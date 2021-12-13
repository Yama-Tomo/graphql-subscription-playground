import {
  useSignUpMutation as useURQLSignUpMutation,
  useSearchUsersQuery as useURQLSearchUsersQuery,
  useMyProfileQuery as useURQLMyProfileQuery,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';
import { gql } from 'urql';

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

gql`
  query SearchUsers($name: String!) {
    searchUsers(name: $name) {
      ...UserFragment
    }
  }
`;
const useSearchUsersQuery = toApolloClientIFUseQuery(useURQLSearchUsersQuery);

gql`
  query MyProfile {
    myProfile {
      ...UserFragment
    }
  }
`;
const useMyProfileQuery = toApolloClientIFUseQuery(useURQLMyProfileQuery, true);

export { useSignUpMutation, useSearchUsersQuery, useMyProfileQuery };
