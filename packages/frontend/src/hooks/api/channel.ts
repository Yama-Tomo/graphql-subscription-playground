import {
  useMyChannelsQuery as useURQLMyChannelsQuery,
  useCreateChannelMutation as useURQLCreateChannelMutation,
  useUpdateChannelNameMutation as useURQLUpdateChannelNameMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useMyChannelsQuery = toApolloClientIFUseQuery(useURQLMyChannelsQuery, true);
const useCreateChannelMutation = toApolloClientIFUseMutation(useURQLCreateChannelMutation);
const useUpdateChannelNameMutation = toApolloClientIFUseMutation(useURQLUpdateChannelNameMutation);

export { useMyChannelsQuery, useCreateChannelMutation, useUpdateChannelNameMutation };
