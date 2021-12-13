import {
  useLatestMessagesQuery as useURQLLatestMessagesQuery,
  useCreateMessageMutation as useURQLCreateMessageMutation,
  useUpdateMessageMutation as useURQLUpdateMessageMutation,
  useDeleteMessageMutation as useURQLDeleteMessageMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';
import { gql } from 'urql';

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
          date
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
const useLatestMessagesQuery = toApolloClientIFUseQuery(useURQLLatestMessagesQuery);

gql`
  mutation CreateMessage($channelId: ID!, $text: String!) {
    createMessage(data: { channelId: $channelId, text: $text }) {
      id
      channelId
      date
      text
      user {
        id
        name
      }
    }
  }
`;
const useCreateMessageMutation = toApolloClientIFUseMutation(useURQLCreateMessageMutation);

gql`
  mutation UpdateMessage($id: ID!, $text: String!) {
    updateMessage(data: { id: $id, text: $text }) {
      id
      channelId
      date
      text
      user {
        id
        name
      }
    }
  }
`;
const useUpdateMessageMutation = toApolloClientIFUseMutation(useURQLUpdateMessageMutation);

gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id) {
      id
      channelId
      date
      text
      user {
        id
        name
      }
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
