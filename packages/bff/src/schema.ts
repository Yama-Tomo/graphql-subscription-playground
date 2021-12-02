import { gql } from 'apollo-server-fastify';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

export { typeDefs };
