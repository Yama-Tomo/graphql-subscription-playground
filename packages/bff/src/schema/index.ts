import { gql } from 'apollo-server-fastify';
import { message } from '@/schema/message';
import { scalars } from '@/schema/scalars';

const typeDefs = gql`
  type Query {
    hello: String
  }

  enum MutationType {
    CREATED
    UPDATED
    DELETED
  }

  ${scalars}
  ${message}
`;

export { typeDefs };
