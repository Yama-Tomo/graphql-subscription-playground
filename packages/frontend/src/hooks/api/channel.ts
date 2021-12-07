import {
  useMyChannelsQuery as useURQLMyChannelsQuery,
  useCreateChannelMutation as useURQLCreateChannelMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useMyChannelsQuery = toApolloClientIFUseQuery(useURQLMyChannelsQuery, true);
const useCreateChannelMutation = toApolloClientIFUseMutation(useURQLCreateChannelMutation);

export { useMyChannelsQuery, useCreateChannelMutation };
