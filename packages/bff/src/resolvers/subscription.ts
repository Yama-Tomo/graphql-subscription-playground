import { PubSub } from 'graphql-subscriptions';
import {
  Resolvers,
  Subscription,
  ChangeNotificationSubscriptionPayload,
} from '@/resolvers/generated';
import { Context } from '@/context';

const publishNotification = (
  pubsub: PubSub,
  userId: Context['user']['id'],
  payload: ChangeNotificationSubscriptionPayload
) => {
  return pubsub.publish(userId, payload);
};

const Subscription: Resolvers['Subscription'] = {
  changeNotification: {
    subscribe(_, __, { pubsub, user }) {
      // TODO: https://github.com/dotansimha/graphql-code-generator/pull/7015
      return pubsub.asyncIterator(user.id) as unknown as AsyncIterable<any>;
    },
  },
};

export { Subscription, publishNotification };
