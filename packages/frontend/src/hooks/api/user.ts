import {
  useSignUpMutation as useURQLSignUpMutation,
  useSearchUsersQuery as useURQLSearchUsersQuery,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useSignUpMutation = toApolloClientIFUseMutation(useURQLSignUpMutation);
const useSearchUsersQuery = toApolloClientIFUseQuery(useURQLSearchUsersQuery);

export { useSignUpMutation, useSearchUsersQuery };
