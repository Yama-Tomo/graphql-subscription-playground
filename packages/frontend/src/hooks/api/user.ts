import {
  useSignUpMutation as useURQLSignUpMutation,
  useSearchUsersQuery as useURQLSearchUsersQuery,
  useMyProfileQuery as useURQLMyProfileQuery,
} from '@/hooks/api/gql_generated';
import { toApolloClientIFUseMutation, toApolloClientIFUseQuery } from '@/hooks/api/adapter';
import { gql } from 'urql';

gql`
  mutation SignUp($name: String!) {
    signup(name: $name) {
      id
      name
    }
  }
`;
const useSignUpMutation = toApolloClientIFUseMutation(useURQLSignUpMutation);

gql`
  query SearchUsers($name: String!) {
    searchUsers(name: $name) {
      id
      name
    }
  }
`;
const useSearchUsersQuery = toApolloClientIFUseQuery(useURQLSearchUsersQuery);

gql`
  query MyProfile {
    myProfile {
      id
      name
    }
  }
`;
const useMyProfileQuery = toApolloClientIFUseQuery(useURQLMyProfileQuery, true);

export { useSignUpMutation, useSearchUsersQuery, useMyProfileQuery };
