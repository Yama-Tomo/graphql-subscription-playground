import { Resolvers, Subscription } from '@/resolvers/generated';

const subscribeTopics = {
  changeMessage: (channelId: string) => `changeMessage:${channelId}`,
};

const Subscription: Resolvers['Subscription'] = {
  changeMessage: {
    subscribe(parent, args, { pubsub, db, user }) {
      // TODO: ユーザが購読できるチャンネルの一覧を取得し、チャンネルの変化を購読する

      // TODO: https://github.com/dotansimha/graphql-code-generator/pull/7015
      return pubsub.asyncIterator([
        subscribeTopics.changeMessage('TODO'),
      ]) as unknown as AsyncIterable<any>;
    },
  },
};

export { Subscription, subscribeTopics };
