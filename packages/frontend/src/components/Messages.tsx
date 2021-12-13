import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { gql } from 'urql';
import InfiniteScroll from 'react-infinite-scroll-component';
import { types } from '@/hooks/api';
import { useLatestMessagesQuery } from '@/hooks/api';
import { MessageListItem } from '@/components/MessageListItem';

type UiProps = {
  hasPrevPage: boolean;
  messages?: types.LatestMessagesQuery['messages'];
  onPrevClick: () => void;
};
// eslint-disable-next-line react/display-name
const Ui = forwardRef<HTMLDivElement, UiProps>((props, ref) => (
  <React.Fragment>
    {!props.messages && 'loading...'}
    {props.messages && (
      <div
        id="messages-container"
        style={{ overflow: 'auto', display: 'flex', flexDirection: 'column-reverse' }}
        ref={ref}
      >
        <InfiniteScroll
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
          scrollableTarget="messages-container"
          dataLength={props.messages.edges.length}
          next={props.onPrevClick}
          hasMore={props.hasPrevPage}
          inverse={true}
          loader={
            <div className="loader" key={0}>
              Loading ...
            </div>
          }
        >
          {[...props.messages.edges].reverse().map((message, idx) => (
            // TODO: ユーザ名, owner はあとで
            <MessageListItem
              key={idx}
              message={message.node.text}
              userName={message.node.userId}
              isOwner={true}
              id={message.node.id}
            />
          ))}
        </InfiniteScroll>
      </div>
    )}
  </React.Fragment>
));

type ContainerProps = {
  channelId: string;
};
const Container: React.FC<ContainerProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ channelId: string; before?: string }>({
    channelId: props.channelId,
  });

  const { data } = useLatestMessagesQuery({
    variables: state,
    ...(!state.before ? { fetchPolicy: 'network-only' } : {}),
  });

  useEffect(() => {
    setState({ channelId: props.channelId });
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [props.channelId]);

  const uiProps: UiProps = {
    messages: data?.messages,
    hasPrevPage: !!data?.messages.pageInfo.hasPreviousPage,
    onPrevClick: () => {
      const before = data?.messages.pageInfo.startCursor;
      if (before) {
        setState((current) => ({ ...current, before }));
      }
    },
  };

  return <Ui {...uiProps} ref={ref} />;
};

gql`
  query LatestMessages($channelId: ID!, $last: Int = 10, $before: String) {
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
          id
          user {
            id
            name
          }
          text
        }
      }
    }
  }
`;

export { Container as Messages };
export type { ContainerProps as MessagesProps };
