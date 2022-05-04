import { Box, Center, Flex } from '@chakra-ui/react';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { MessageListItem, MessageListItemProps } from '@/components/MessageListItem';
import { types, useReadMessagesMutation, useLatestMessagesQuery } from '@/hooks/api';
import { useMessageReadStateUpdate } from '@/hooks/message';

type UiProps = {
  hasPrevPage: boolean;
  messages?: types.LatestMessagesQuery['messages'];
  onPrevClick: () => void;
  myUserId: string;
} & Pick<MessageListItemProps, 'onReadMessage'>;
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
    {!props.messages && (
      <Box className="loader" key={0} color={'gray.600'}>
        <Center fontSize={'sm'}>Loading ...</Center>
      </Box>
    )}

    {props.messages && (
      <InfiniteScroll
        style={{ display: 'flex', flexDirection: 'column-reverse' }}
        scrollableTarget="messages-container"
        dataLength={props.messages.edges.length}
        next={props.onPrevClick}
        hasMore={props.hasPrevPage}
        inverse={true}
        loader={
          <Box className="loader" key={0} color={'gray.600'}>
            <Center fontSize={'sm'}>Loading ...</Center>
          </Box>
        }
      >
        {[...props.messages.edges].reverse().map((message, idx) => (
          <MessageListItem
            key={idx}
            onReadMessage={props.onReadMessage}
            date={message.node.date}
            message={message.node.text}
            userName={message.node.user.name}
            isOwner={props.myUserId === message.node.user.id}
            id={message.node.id}
            isRead={message.node.isRead}
          />
        ))}
      </InfiniteScroll>
    )}
  </Flex>
));

type ContainerProps = {
  channelId: string;
} & Pick<UiProps, 'myUserId'>;
const Container: React.FC<ContainerProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ channelId: string; before?: string; last: number }>({
    channelId: props.channelId,
    last: 20,
  });
  const [messageReadStateUpdater] = useReadMessagesMutation();
  const wrappedMessageReadStateUpdater = useCallback(
    (ids: string[]) => {
      messageReadStateUpdater({ variables: { data: ids.map((id) => ({ id })) } });
    },
    [messageReadStateUpdater]
  );
  const onReadMessage = useMessageReadStateUpdate(wrappedMessageReadStateUpdater);

  const { data } = useLatestMessagesQuery({
    variables: state,
    ...(!state.before ? { fetchPolicy: 'network-only' } : {}),
  });
  const preventOnPrevClick = useRef(false);

  useEffect(() => {
    preventOnPrevClick.current = true;
    setState((current) => ({ ...current, channelId: props.channelId }));
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
        preventOnPrevClick.current = false;
      }
    }, 10);
  }, [props.channelId]);

  const uiProps: UiProps = {
    onReadMessage,
    myUserId: props.myUserId,
    messages: data?.messages,
    hasPrevPage: !!data?.messages.pageInfo.hasPreviousPage,
    onPrevClick: () => {
      const before = data?.messages.pageInfo.startCursor;
      if (before && !preventOnPrevClick.current) {
        setState((current) => ({ ...current, before }));
      }
    },
  };

  return <Ui {...uiProps} ref={ref} />;
};

export { Container as Messages };
export type { ContainerProps as MessagesProps };
