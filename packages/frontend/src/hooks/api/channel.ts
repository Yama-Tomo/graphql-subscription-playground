import {
  useMyChannelsQuery as useURQLMyChannelsQuery,
  useCreateChannelMutation as useURQLCreateChannelMutation,
  useUpdateChannelNameMutation as useURQLUpdateChannelNameMutation,
  useDeleteChannelMutation as useURQLDeleteChannelMutation,
  useUpdateMessageMutation as useURQLUpdateMessageMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useMyChannelsQuery = toApolloClientIFUseQuery(useURQLMyChannelsQuery, true);
const useCreateChannelMutation = toApolloClientIFUseMutation(useURQLCreateChannelMutation);
const useUpdateChannelNameMutation = toApolloClientIFUseMutation(useURQLUpdateChannelNameMutation);
const useDeleteChannelMutation = toApolloClientIFUseMutation(useURQLDeleteChannelMutation);
const useUpdateMessageMutation = toApolloClientIFUseMutation(useURQLUpdateMessageMutation);

export {
  useMyChannelsQuery,
  useCreateChannelMutation,
  useUpdateChannelNameMutation,
  useDeleteChannelMutation,
  useUpdateMessageMutation,
};
