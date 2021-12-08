import { PubSub, withFilter } from 'graphql-subscriptions';
import { Resolvers, Subscription } from '@/resolvers/generated';
import { Context } from '@/context';

// NOTE: ペイロードがユニオンタイプの場合はどのデータなのか区別するために __typename フィールドを必ず含める必要がある
type RequiredTypenameSubscription = Pick<Subscription, '__typename'> & {
  changeNotification: Required<Subscription['changeNotification']>;
};

const publishNotification = (
  pubsub: PubSub,
  userId: Context['user']['id'],
  payload: RequiredTypenameSubscription
) => {
  return pubsub.publish(userId, payload);
};

const Subscription: Resolvers['Subscription'] = {
  changeNotification: {
    subscribe(_, __, { pubsub, user }) {
      // TODO: https://github.com/dotansimha/graphql-code-generator/pull/7015
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return pubsub.asyncIterator(user.id) as unknown as AsyncIterable<any>;
    },
  },
};

export { Subscription, publishNotification };
