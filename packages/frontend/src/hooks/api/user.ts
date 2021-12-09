import { useSignUpMutation as useURQLSignUpMutation } from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation } from '@/hooks/api/adapter';

const useSignUpMutation = toApolloClientIFUseMutation(useURQLSignUpMutation);

export { useSignUpMutation };
