import React from 'react';
import { gql } from 'urql';
import { types } from '@/hooks/api';
import { useLatestMessagesQuery } from '@/hooks/api';

type UiProps = {
  messages?: types.LatestMessagesQuery['messages'];
};
const Ui: React.FC<UiProps> = (props) => (
  <React.Fragment>
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
  const { data } = useLatestMessagesQuery({ variables: { channelId: props.channelId } });

  const uiProps: UiProps = {
    messages: data?.messages,
  };

  return <Ui {...uiProps} />;
};

gql`
  query LatestMessages($channelId: ID!, $last: Int = 10, $before: String) {
    messages(channelId: $channelId, before: $before, last: $last) {
      pageInfo {
        endCursor
        hasNextPage
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
