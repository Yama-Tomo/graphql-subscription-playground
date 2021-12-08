import React, { useEffect, useState } from 'react';
import { gql } from 'urql';
import { types } from '@/hooks/api';
import { useLatestMessagesQuery } from '@/hooks/api';

type UiProps = {
  hasPrevPage: boolean;
  messages?: types.LatestMessagesQuery['messages'];
  onPrevClick: () => void;
};
const Ui: React.FC<UiProps> = (props) => (
  <React.Fragment>
    {props.hasPrevPage && <button onClick={props.onPrevClick}>old message</button>}
    {!props.messages && 'loading...'}
    {props.messages &&
      props.messages.edges.map((message) => (
        <div key={message.node.id}>
          <div style={{ marginBottom: '1rem' }}>
            {/* TODO: ユーザ名に変換 */}
            <b>{message.node.id}</b>
            <div>{message.node.text}</div>
          </div>
        </div>
      ))}
  </React.Fragment>
);

type ContainerProps = {
  channelId: string;
};
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState<{ channelId: string; before?: string }>({
    channelId: props.channelId,
  });

  const { data } = useLatestMessagesQuery({
    variables: state,
    ...(!state.before ? { fetchPolicy: 'network-only' } : {}),
  });

  useEffect(() => {
    setState({ channelId: props.channelId });
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

  return <Ui {...uiProps} />;
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
          userId
          text
        }
      }
    }
  }
`;

export { Container as Messages };
export type { ContainerProps as MessagesProps };
