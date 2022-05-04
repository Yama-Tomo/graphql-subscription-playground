import { gql } from 'urql';

import { useSignUpMutation as useURQLSignUpMutation } from '@/hooks/api/_generated_gql_codes';
import { toApolloClientIFUseMutation } from '@/hooks/api/adapter';

// ----------- fragment -----------
gql`
  fragment UserFragment on User {
    id
    name
  }
`;
// ----------- fragment -----------

gql`
  mutation SignUp($name: String!) {
    signup(name: $name) {
      ...UserFragment
    }
  }
`;
const useSignUpMutation = toApolloClientIFUseMutation(useURQLSignUpMutation);

export { useSignUpMutation };
