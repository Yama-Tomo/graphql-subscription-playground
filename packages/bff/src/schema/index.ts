import { gql } from 'apollo-server-fastify';
import { DateTypeDefinition } from 'graphql-scalars';
import { message } from './message';

const typeDefs = gql`
  type Query {
    hello: String
  }

  ${DateTypeDefinition}

  enum MutationType {
    CREATED
    UPDATED
    DELETED
  }

  ${message}
`;

export { typeDefs };
