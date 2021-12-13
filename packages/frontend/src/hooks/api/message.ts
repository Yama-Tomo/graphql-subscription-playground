import {
  useLatestMessagesQuery as useURQLLatestMessagesQuery,
  useMyProfileQuery as useURQLMyProfileQuery,
  useCreateMessageMutation as useURQLCreateMessageMutation,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useLatestMessagesQuery = toApolloClientIFUseQuery(useURQLLatestMessagesQuery);
const useCreateMessageMutation = toApolloClientIFUseMutation(useURQLCreateMessageMutation);
const useMyProfileQuery = toApolloClientIFUseQuery(useURQLMyProfileQuery, true);

export { useLatestMessagesQuery, useCreateMessageMutation, useMyProfileQuery };
