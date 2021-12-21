import { PubSub } from 'graphql-subscriptions';

import { Context } from '@/context';
// 同じ変数名と型名が１つのファイルに存在しているとprettier-plugin-sort-importsがエラーになるので別名でimportする
import { Resolvers, ResolversTypes, Subscription as SubscriptionType } from '@/resolvers/generated';

const publishNotification = (
  pubsub: PubSub,
  userId: Context['user']['id'],
  // NOTE: ペイロードがユニオンタイプの場合はどのデータなのか区別するために __typename フィールドを必ず含める必要がある
  typename: Required<SubscriptionType['changeNotification']>['__typename'],
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
