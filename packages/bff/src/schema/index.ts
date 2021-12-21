import { gql } from 'apollo-server-fastify';
import { DateTypeDefinition, DateTimeTypeDefinition } from 'graphql-scalars';

import { channel } from './channel';
import { message } from './message';
import { user } from './user';

const typeDefs = gql`
  type Query {
    hello: String
  }

  ${DateTypeDefinition}
  ${DateTimeTypeDefinition}

  enum MutationType {
    CREATED
    UPDATED
    DELETED
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  ${message}
  ${channel}
  ${user}

  union ChangeNotificationSubscriptionPayload =
      ChangeMessageSubscriptionPayload
    | ChangeChannelSubscriptionPayload
    | ChangeMessageReadStateSubscriptionPayload

  type Subscription {
    changeNotification: ChangeNotificationSubscriptionPayload!
  }
`;

export { typeDefs };
