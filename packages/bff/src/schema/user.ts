import { gql } from 'apollo-server-fastify';

const user = gql`
  type Mutation {
    signup(name: String!): User!
  }

  type User {
    id: ID!
    name: ID!
  }
`;

export { user };
