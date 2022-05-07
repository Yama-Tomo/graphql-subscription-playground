import { Cache, cacheExchange } from '@urql/exchange-graphcache';
import { gql } from 'urql';

import {
  MutationType,
  MessageFragmentFragmentDoc,
  UrqlCacheUpdateChannelsDocument,
  UrqlCacheUpdateChannelFragmentFragmentDoc,
  UrqlCacheUpdateMessagesDocument,
  Message,
  UrqlCacheUpdateMessagesQueryVariables,
  UrqlCacheUpdateMessageFragmentFragmentDoc,
  UrqlCacheUpdateMessageFragmentFragment,
  CreateMessageMutation,
  Channel,
  CreateChannelMutation,
  GraphCacheConfig,
} from '@/hooks/api';

import schema from './_generated_gql_schema_json';

const cacheConfig = (): GraphCacheConfig => ({
  // パフォーマンスに懸念が出てきたら ...(process.env.NODE_ENV !== 'production' ? { schema ..snip.. } : {}) とする
  schema: schema as GraphCacheConfig['schema'],
  resolvers: {
    Query: {
      messages(parent, args, cache, info) {
        const { parentKey: entityKey, fieldName } = info;

        const edges: NonNullable<typeof parent.messages>['edges'] = [];

        const pageCaches = cache.inspectFields(entityKey).filter((info) => {
          return info.fieldName === fieldName && info.arguments?.channelId === args.channelId;
        });

        const serializedArgs = JSON.stringify(args);
        for (const pageCache of pageCaches) {
          const key = cache.resolve(entityKey, pageCache.fieldKey);
          const data = cache.resolve(key as string, 'edges');
          // 引数がマッチするまでデータを連結。（ページ数が進めば進むほど１ページ目から連結され、データ量が多くなる
          edges.unshift(...(data as typeof edges));

          if (JSON.stringify(pageCache.arguments) == serializedArgs) {
            break;
          }
        }

        return {
          __typename: 'MessageConnection',
          edges,
        };
      },
    },
  },
  updates: {
    Mutation: {
      readMessages(parent, args, cache) {
        // 同一ユーザが複数ウインドウ開いていてもそれぞれのウインドウの状態を更新できるようにargsの値を使ってキャッシュを更新するのがミソ
        args.data.forEach(({ id }) => {
          const messageFromCache = cache.readFragment<Partial<Message>>(
            MessageFragmentFragmentDoc,
            { id }
          );

          if (messageFromCache?.channelId) {
            const updateData = {
              __typename: 'Message',
              id,
              channelId: messageFromCache.channelId,
              isRead: !!messageFromCache.isRead,
            };
            updateUnReadMessageCount(updateData, 'decrement', cache);
          }
        });
      },
    },
    Subscription: {
      changeNotification: ({ changeNotification: { mutation, data } }, args, cache) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('subscription:', mutation, data);
        }
        if (mutation === MutationType.Created) {
          if (data?.__typename === 'Message') {
            addNewMessage(data, cache);
            updateUnReadMessageCount(data, 'increment', cache);
          }
          if (data?.__typename === 'Channel') {
            addNewChannel(data, cache);
          }
        }

        if (mutation === MutationType.Updated) {
          if (data?.__typename === 'Channel') {
            !addNewChannel(data, cache) && updateChannel(data, cache);
          }
          if (data?.__typename === 'Message') {
            updateMessage(data, cache);
          }
          if (data?.__typename === 'ReadMessageUsers') {
            updateMessageReadUsers(
              { __typename: 'Message', id: data.id, readUsers: data.readUsers },
              cache
            );
          }
        }

        if (mutation === MutationType.Deleted) {
          if (data?.__typename === 'Channel') {
            deleteChannel(data.id, cache);
          }
          if (data?.__typename === 'Message') {
            deleteMessage(data.id, cache);
            updateUnReadMessageCount(data, 'decrement', cache);
          }
        }
      },
    },
  },
});

// NOTE: ここで定義するクエリはアプリケーションで実行するクエリと一致していなくてもいいことに注意
// 最新: writeFragmentに使うfragmentに列挙しているフィールドだけが更新される。すべてのフィールドを更新したければすべてのフィールドを列挙した fragment を用意する必要がある
// リストの追加、削除はそのリスト配下のフィールドはすべて列挙しておくとトラブルが少ない。
// 実際、channels はすべて列挙しないとうまくキャッシュされない。 messages は `node { id }` だけでもキャッシュされると挙動にゆらぎがある。詳しくはまだわかっていない。
// (channelsはリストがtop-levelだからなのかも、一階層フィールドを掘りそれをリストにすればすべて列挙しなくても動くかもしれない。未検証

gql`
  query UrqlCacheUpdateChannels {
    channels {
      id
      name
      description
      joinUsers {
        id
        name
      }
      ownerId
      isDM
      unReadMessageCount
    }
  }
`;

gql`
  fragment UrqlCacheUpdateChannelFragment on ChannelWithPersonalizedData {
    id
    name
    description
    joinUsers {
      id
      name
    }
    ownerId
    isDM
    # キャッシュを更新するpayloadにこの値は含まれないので列挙できない。（列挙すると型が合わなくなる
    # unReadMessageCount
  }
`;

gql`
  query UrqlCacheUpdateMessages($channelId: ID!, $last: Int!, $before: String) {
    messages(channelId: $channelId, before: $before, last: $last) {
      edges {
        cursor
        node {
          id
          channelId
          user {
            id
            name
          }
          text
          date
          isRead
          readUsers {
            id
            name
          }
        }
      }
    }
  }
`;

gql`
  fragment UrqlCacheUpdateMessageFragment on Message {
    id
    readUsers {
      id
    }
  }
`;

const addNewChannel = (channel: CreateChannelMutation['createChannel'], cache: Cache) => {
  const channelCache = cache.inspectFields('Query').find((qc) => qc.fieldName === 'channels');
  if (!channelCache) {
    return;
  }

  let added = false;
  cache.updateQuery({ query: UrqlCacheUpdateChannelsDocument }, (data) => {
    if (data?.channels.find((item) => item.id === channel.id)) {
      return data;
    }

    added = true;
    // サーバから未読数が返ってこないので0から始める。
    // すでにメッセージのやり取りが始まっているチャンネルに招待されてもそれまでのメッセージは未読数に含まれない。
    // チャンネルを移動したら最新のチャンネル一覧と未読状態をリフェッチして整合性を合わせる
    data?.channels.push({
      ...channel,
      unReadMessageCount: 0,
      __typename: 'ChannelWithPersonalizedData',
    });
    return data;
  });

  return added;
};

const updateChannel = (channel: Channel, cache: Cache) => {
  cache.writeFragment(UrqlCacheUpdateChannelFragmentFragmentDoc, {
    ...channel,
    __typename: 'ChannelWithPersonalizedData',
  });
};

const deleteChannel = (channelId: Channel['id'], cache: Cache) => {
  const channelCache = cache.inspectFields('Query').find((qc) => qc.fieldName === 'channels');
  if (!channelCache) {
    return;
  }

  cache.updateQuery({ query: UrqlCacheUpdateChannelsDocument }, (data) => {
    if (data?.channels) {
      data.channels = data.channels.filter((item) => item.id !== channelId);
    }
    return data;
  });
};

const addNewMessage = (message: CreateMessageMutation['createMessage'], cache: Cache) => {
  const latestPageCache = cache.inspectFields('Query').find((queryCache) => {
    if (queryCache.fieldName === 'messages') {
      const arg = queryCache.arguments as UrqlCacheUpdateMessagesQueryVariables;
      return arg.channelId === message.channelId && arg.before == null;
    }
    return false;
  });

  if (!latestPageCache) {
    return;
  }

  cache.updateQuery(
    {
      query: UrqlCacheUpdateMessagesDocument,
      variables: latestPageCache.arguments as UrqlCacheUpdateMessagesQueryVariables,
    },
    (data) => {
      const isAlreadyUpdated = !!data?.messages.edges.find((item) => item.node.id === message.id);
      if (isAlreadyUpdated) {
        return data;
      }

      data?.messages.edges.push({
        __typename: 'MessageEdge',
        cursor: message.id,
        node: { __typename: 'Message', ...message },
      });

      return data;
    }
  );
};

const updateMessage = (message: Message, cache: Cache) => {
  cache.writeFragment(UrqlCacheUpdateMessageFragmentFragmentDoc, message);
};

const updateUnReadMessageCount = (
  payload: Pick<Message, 'channelId' | 'isRead'>,
  action: 'increment' | 'decrement',
  cache: Cache
) => {
  if (payload.isRead) {
    return;
  }

  cache.updateQuery({ query: UrqlCacheUpdateChannelsDocument }, (data) => {
    if (!data) {
      return data;
    }

    const message = data.channels.find((ch) => ch.id === payload.channelId);
    if (!message) {
      return data;
    }

    if (action === 'increment') {
      message.unReadMessageCount += 1;
    }

    if (action === 'decrement') {
      message.unReadMessageCount -= 1;
    }

    return data;
  });
};

const updateMessageReadUsers = (message: UrqlCacheUpdateMessageFragmentFragment, cache: Cache) => {
  cache.writeFragment(UrqlCacheUpdateMessageFragmentFragmentDoc, message);
};

const deleteMessage = (messageId: Message['id'], cache: Cache) => {
  cache
    .inspectFields('Query')
    .filter((qc) => qc.fieldName === 'messages')
    .forEach((qc) => {
      cache.updateQuery(
        {
          query: UrqlCacheUpdateMessagesDocument,
          variables: qc.arguments as UrqlCacheUpdateMessagesQueryVariables,
        },
        (data) => {
          if (data?.messages) {
            data.messages.edges = data.messages.edges.filter((item) => item.node.id !== messageId);
          }
          return data;
        }
      );
    });
};

const setupCache = () => cacheExchange(cacheConfig());

export { setupCache };
