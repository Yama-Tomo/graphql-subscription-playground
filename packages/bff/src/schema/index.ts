import { gql } from 'apollo-server-fastify';
import { message } from '@/schema/message';

const typeDefs = gql`
  type Query {
    hello: String
  }

  enum MutationType {
    CREATED
    UPDATED
    DELETED
  }

  ${message}
`;

export { typeDefs };
