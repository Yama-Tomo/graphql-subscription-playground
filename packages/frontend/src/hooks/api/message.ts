import { gql } from 'urql';

import {
  useCreateMessageMutation as useURQLCreateMessageMutation,
  useDeleteMessageMutation as useURQLDeleteMessageMutation,
  useReadMessagesMutation as useURQLReadMessagesMutation,
  useUpdateMessageMutation as useURQLUpdateMessageMutation,
} from '@/hooks/api/_generated_gql_codes';
import { toApolloClientIFUseMutation } from '@/hooks/api/adapter';

// ----------- fragment -----------
gql`
  fragment MessageFragment on Message {
    id
    channelId
    text
    date
    isRead
    user {
      ...UserFragment
    }
    readUsers {
      ...UserFragment
    }
  }
`;

gql`
  fragment MessageReadUsersFragment on Message {
    id
    readUsers {
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

gql`
  mutation ReadMessages($data: [ReadMessageInput!]!) {
    readMessages(data: $data) {
      id
    }
  }
`;
const useReadMessagesMutation = toApolloClientIFUseMutation(useURQLReadMessagesMutation);

export {
  useUpdateMessageMutation,
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useReadMessagesMutation,
};
