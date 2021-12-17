import { PubSub } from 'graphql-subscriptions';
import { Resolvers, ResolversTypes, Subscription } from '@/resolvers/generated';
import { Context } from '@/context';

const publishNotification = (
  pubsub: PubSub,
  userId: Context['user']['id'],
  // NOTE: ペイロードがユニオンタイプの場合はどのデータなのか区別するために __typename フィールドを必ず含める必要がある
  typename: Required<Subscription['changeNotification']>['__typename'],
  payload: { changeNotification: ResolversTypes['ChangeNotificationSubscriptionPayload'] }
) => {
  const { changeNotification, ...rest } = payload;
  return pubsub.publish(userId, {
    ...rest,
    changeNotification: { ...changeNotification, __typename: typename },
  });
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
