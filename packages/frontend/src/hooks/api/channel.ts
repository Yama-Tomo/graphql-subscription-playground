import { gql } from 'urql';

import {
  useCreateChannelMutation as useURQLCreateChannelMutation,
  useDeleteChannelMutation as useURQLDeleteChannelMutation,
  useInviteChannelMutation as useURQLInviteChannelMutation, // useMyChannelAndProfileQuery as useURQLMyChannelAndProfileQuery,
  useUpdateChannelNameMutation as useURQLUpdateChannelNameMutation,
} from '@/hooks/api/_generated_gql_codes';
import { toApolloClientIFUseMutation } from '@/hooks/api/adapter';

// ----------- fragment -----------
gql`
  fragment ChannelFragment on Channel {
    id
    name
    description
    isDM
    joinUsers {
      ...UserFragment
    }
    ownerId
  }
`;
// ----------- fragment -----------

gql`
  query MyChannelAndProfile {
    channels {
      id
      name
      description
      isDM
      joinUsers {
        ...UserFragment
      }
      ownerId
      unReadMessageCount
    }
    myProfile {
      ...UserFragment
    }
  }
`;

gql`
  mutation CreateChannel($name: String!, $description: String, $isDM: Boolean!, $joinUsers: [ID!]) {
    createChannel(
      data: { name: $name, description: $description, isDM: $isDM, joinUsers: $joinUsers }
    ) {
      ...ChannelFragment
    }
  }
`;
const useCreateChannelMutation = toApolloClientIFUseMutation(useURQLCreateChannelMutation);

gql`
  mutation UpdateChannelName($id: ID!, $name: String!, $description: String) {
    updateChannel(data: { id: $id, name: $name, description: $description }) {
      ...ChannelFragment
    }
  }
`;
const useUpdateChannelNameMutation = toApolloClientIFUseMutation(useURQLUpdateChannelNameMutation);

gql`
  mutation DeleteChannel($id: ID!) {
    deleteChannel(id: $id) {
      ...ChannelFragment
    }
  }
`;
const useDeleteChannelMutation = toApolloClientIFUseMutation(useURQLDeleteChannelMutation);

gql`
  mutation InviteChannel($id: ID!, $userId: ID!) {
    inviteChannel(data: { id: $id, userId: $userId }) {
      ...ChannelFragment
    }
  }
`;
const useInviteChannelMutation = toApolloClientIFUseMutation(useURQLInviteChannelMutation);

export {
  useCreateChannelMutation,
  useUpdateChannelNameMutation,
  useDeleteChannelMutation,
  useInviteChannelMutation,
};
