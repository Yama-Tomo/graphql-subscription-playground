import {
  useMyChannelsQuery as useURQLMyChannelsQuery,
  useCreateChannelMutation as useURQLCreateChannelMutation,
  useUpdateChannelNameMutation as useURQLUpdateChannelNameMutation,
  useDeleteChannelMutation as useURQLDeleteChannelMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';
import { gql } from 'urql';

gql`
  query MyChannels {
    channels {
      id
      name
      isDM
      joinUsers {
        id
        name
      }
      ownerId
    }
    myProfile {
      id
      name
    }
  }
`;
const useMyChannelsQuery = toApolloClientIFUseQuery(useURQLMyChannelsQuery, true);

gql`
  mutation CreateChannel($name: String!, $description: String, $isDM: Boolean!, $joinUsers: [ID!]) {
    createChannel(
      data: { name: $name, description: $description, isDM: $isDM, joinUsers: $joinUsers }
    ) {
      id
      isDM
      joinUsers {
        id
        name
      }
      description
      name
      ownerId
    }
  }
`;
const useCreateChannelMutation = toApolloClientIFUseMutation(useURQLCreateChannelMutation);

gql`
  mutation UpdateChannelName($id: ID!, $name: String!) {
    updateChannel(data: { id: $id, name: $name }) {
      id
      isDM
      joinUsers {
        id
        name
      }
      description
      name
      ownerId
    }
  }
`;
const useUpdateChannelNameMutation = toApolloClientIFUseMutation(useURQLUpdateChannelNameMutation);

gql`
  mutation DeleteChannel($id: ID!) {
    deleteChannel(id: $id) {
      id
      isDM
      joinUsers {
        id
        name
      }
      description
      name
      ownerId
    }
  }
`;
const useDeleteChannelMutation = toApolloClientIFUseMutation(useURQLDeleteChannelMutation);

export {
  useMyChannelsQuery,
  useCreateChannelMutation,
  useUpdateChannelNameMutation,
  useDeleteChannelMutation,
};
