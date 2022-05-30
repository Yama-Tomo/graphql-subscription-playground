import { Box, Center, Flex } from '@chakra-ui/react';
import gql from 'graphql-tag';
import React, {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { MessageListItem, MessageListItemProps } from '@/components/MessageListItem';
import {
  MessagesDocument,
  useReadMessagesMutation,
  useQuery,
  useCombinedQuery,
  TypedUseQueryResult,
  QueryData,
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

type ContextType = {
  channelId: string;
  queryData: QueryData<TypedUseQueryResult<typeof MessagesDocument>>;
};

const Context = createContext<ContextType>({
  channelId: '',
  queryData: { loading: false, data: undefined, requestStartTime: -1 },
});

const Container: React.FC = () => {
  const ctx = useContext(Context);
  const ref = useRef<HTMLDivElement>(null);
  const [{ variables, skip, requestStartTime }, setQueryOpts] = useState({
    requestStartTime: -1,
    variables: { channelId: ctx.channelId, last: 20, before: '' },
    skip: true,
  });

  const fragmentQuery = useQuery(MessagesDocument, { variables, skip });
  const combinedQuery = useCombinedQuery(ctx.queryData, { ...fragmentQuery, requestStartTime });
  const { data } = combinedQuery;

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
  }, [ctx.channelId]);

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
        setQueryOpts({
          requestStartTime: new Date().getTime(),
          variables: { channelId: ctx.channelId, last: 20, before },
          skip: false,
        });
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

const MemorizedContainer = memo(Container);

export { MemorizedContainer as Messages, Context as MessagesContext };
export type { ContextType as MessagesContextType };
