import { gql } from 'apollo-server-fastify';
import { DateTypeDefinition } from 'graphql-scalars';
import { message } from './message';
import { channel } from './channel';

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
  ${channel}

  union ChangeNotificationSubscriptionPayload =
      ChangeMessageSubscriptionPayload
    | ChangeChannelSubscriptionPayload

  type Subscription {
    changeNotification: ChangeNotificationSubscriptionPayload
  }
`;

export { typeDefs };
