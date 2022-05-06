import { Box, Center, Flex } from '@chakra-ui/react';
import gql from 'graphql-tag';
import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { MessageListItem, MessageListItemProps } from '@/components/MessageListItem';
import {
  RefetchableFragment,
  MessagesDocument,
  useFragmentQueryWithFetchedTime,
  useReadMessagesMutation,
} from '@/hooks/api';
import { useMessageReadStateUpdate } from '@/hooks/message';

type UiProps = { hasPrevPage: boolean; messages: MessageListItemProps[]; onPrevClick: () => void };
// eslint-disable-next-line react/display-name
const Ui = forwardRef<HTMLDivElement, UiProps>((props, ref) => (
  <Flex
    id="messages-container"
    overflow={'auto'}
    flex={1}
    flexDirection={'column-reverse'}
    ref={ref}
    p={2}
  >
    {!props.messages.length && (
      <Box className="loader" key={0} color={'gray.600'}>
        <Center fontSize={'sm'}>no message</Center>
      </Box>
    )}

    {props.messages && (
      <InfiniteScroll
        style={{ display: 'flex', flexDirection: 'column-reverse' }}
        scrollableTarget="messages-container"
        dataLength={props.messages.length}
        next={props.onPrevClick}
        hasMore={props.hasPrevPage}
        inverse={true}
        loader={
          <Box className="loader" key={0} color={'gray.600'}>
            <Center fontSize={'sm'}>Loading ...</Center>
          </Box>
        }
      >
        {[...props.messages].reverse().map((message, idx) => (
          <MessageListItem {...message} key={idx} />
        ))}
      </InfiniteScroll>
    )}
  </Flex>
));

type ContainerProps = {
  channelId: string;
  refetchableFragment: RefetchableFragment<typeof MessagesDocument>;
};
const Container: React.FC<ContainerProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { data, fetch } = props.refetchableFragment(
    useFragmentQueryWithFetchedTime(MessagesDocument)
  );

  const [messageReadStateUpdater] = useReadMessagesMutation();
  const wrappedMessageReadStateUpdater = useCallback(
    (ids: string[]) => {
      messageReadStateUpdater({ variables: { data: ids.map((id) => ({ id })) } });
    },
    [messageReadStateUpdater]
  );
  const onReadMessage = useMessageReadStateUpdate(wrappedMessageReadStateUpdater);

  const preventOnPrevClick = useRef(false);

  useEffect(() => {
    preventOnPrevClick.current = true;
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
      preventOnPrevClick.current = false;
    }
  }, [props.channelId]);

  const uiProps: UiProps = {
    messages: (data?.messages.edges || []).map((message) => ({
      ...message.node,
      onReadMessage,
      isOwner: data?.myProfile.id === message.node.user.id,
    })),
    hasPrevPage: !!data?.messages.pageInfo.hasPreviousPage,
    onPrevClick: () => {
      const before = data?.messages.pageInfo.startCursor;
      if (before && !preventOnPrevClick.current) {
        fetch({ variables: { channelId: props.channelId, last: 20, before } });
      }
    },
  };

  return <Ui {...uiProps} ref={ref} />;
};

gql`
  fragment Messages_query on Query {
    myProfile {
      id
    }
    messages(channelId: $channelId, before: $before, last: $last) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      edges {
        cursor
        node {
          channelId
          user {
            id
          }
          readUsers {
            id
            name
          }
          ...MessageListItem_message
        }
      }
    }
  }
`;

gql`
  query Messages($channelId: ID!, $last: Int = 20, $before: String) {
    ...Messages_query
  }
`;

export { Container as Messages };
export type { ContainerProps as MessagesProps };
