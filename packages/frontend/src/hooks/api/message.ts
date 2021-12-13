import {
  useLatestMessagesQuery as useURQLLatestMessagesQuery,
  useCreateMessageMutation as useURQLCreateMessageMutation,
  useUpdateMessageMutation as useURQLUpdateMessageMutation,
  useDeleteMessageMutation as useURQLDeleteMessageMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';
import { gql } from 'urql';

// ----------- fragment -----------
gql`
  fragment MessageFragment on Message {
    id
    channelId
    text
    date
    user {
      ...UserFragment
    }
  }
`;
// ----------- fragment -----------

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
          ...MessageFragment
        }
      }
    }
  }
`;
const useLatestMessagesQuery = toApolloClientIFUseQuery(useURQLLatestMessagesQuery);

gql`
  mutation CreateMessage($channelId: ID!, $text: String!) {
    createMessage(data: { channelId: $channelId, text: $text }) {
      ...MessageFragment
    }
  }
`;
const useCreateMessageMutation = toApolloClientIFUseMutation(useURQLCreateMessageMutation);

gql`
  mutation UpdateMessage($id: ID!, $text: String!) {
    updateMessage(data: { id: $id, text: $text }) {
      ...MessageFragment
    }
  }
`;
const useUpdateMessageMutation = toApolloClientIFUseMutation(useURQLUpdateMessageMutation);

gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id) {
      ...MessageFragment
    }
  }
`;
const useDeleteMessageMutation = toApolloClientIFUseMutation(useURQLDeleteMessageMutation);

export {
  useLatestMessagesQuery,
  useUpdateMessageMutation,
  useCreateMessageMutation,
  useDeleteMessageMutation,
};
