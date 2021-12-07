import {
  useLatestMessagesQuery as useURQLLatestMessagesQuery,
  useCreateMessageMutation as useURQLCreateMessageMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useLatestMessagesQuery = toApolloClientIFUseQuery(useURQLLatestMessagesQuery);
const useCreateMessageMutation = toApolloClientIFUseMutation(useURQLCreateMessageMutation);

export { useLatestMessagesQuery, useCreateMessageMutation };
