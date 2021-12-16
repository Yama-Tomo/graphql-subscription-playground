import { cacheExchange, Cache } from '@urql/exchange-graphcache';
import { docs, types, MutationType } from '@/hooks/api';

const cacheConfig = (): types.GraphCacheConfig => ({
  resolvers: {
    Query: {
      messages(parent, args, cache, info) {
        const { parentKey: entityKey, fieldName } = info;

        const edges: NonNullable<typeof parent.messages>['edges'] = [];

        // カーソルが初期位置の場合はコンポーネントは必ずサーバからフェッチしなおすため、１ページ目以降のキャッシュは捨てる
        const isPurgeAfterFirstPageCache = args.before == null;
        const pageCaches = (() => {
          const caches = cache.inspectFields(entityKey).filter((info) => {
            return info.fieldName === fieldName && info.arguments?.channelId === args.channelId;
          });
          if (!isPurgeAfterFirstPageCache) {
            return caches;
          }

          // 1ページ目以降のキャッシュを捨てつつ1ページ目だけのキャッシュを返す
          return caches.filter((pageCache) => {
            const isFirstPage = pageCache.arguments?.before == null;
            if (!isFirstPage) {
              // 1ページ目以降のキャッシュが残っているとそれが読み出されてしまうので削除
              console.log('cache purge', pageCache.arguments);
              cache.invalidate(entityKey, fieldName, pageCache.arguments);
            }

            return isFirstPage;
          });
        })();

        pageCaches.forEach((pageCache) => {
          const key = cache.resolve(entityKey, pageCache.fieldKey);
          const data = cache.resolve(key as string, 'edges');
          edges.unshift(...(data as typeof edges));
        });

        return {
          __typename: 'MessageConnection',
          edges,
        };
      },
    },
  },
  updates: {
    Mutation: {
      createChannel: (parent, args, cache) => {
        if (isAllKeyNotEmpty(parent.createChannel)) {
          addNewChannel(parent.createChannel, cache);
        }
      },
      updateChannel(parent, args, cache) {
        if (isAllKeyNotEmpty(parent.updateChannel)) {
          updateChannel(parent.updateChannel, cache);
        }
      },
      createMessage: (parent, args, cache) => {
        if (isAllKeyNotEmpty(parent.createMessage)) {
          addNewMessage(parent.createMessage, cache);
        }
      },
    },
    Subscription: {
      changeNotification: ({ changeNotification: { mutation, data } }, args, cache) => {
        console.log('subscription:', mutation, data);
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

const isAllKeyNotEmpty = <T extends Record<string, unknown>>(
  arg: T | undefined
): arg is Required<NonNullable<T>> => arg != null && !Object.values(arg).find((v) => v == null);

const addNewChannel = (channel: types.CreateChannelMutation['createChannel'], cache: Cache) => {
  const channelCache = cache.inspectFields('Query').find((qc) => qc.fieldName === 'channels');
  if (!channelCache) {
    return;
  }

  let added = false;
  cache.updateQuery<types.MyChannelAndProfileQuery>(
    { query: docs.MyChannelAndProfileDocument },
    (data) => {
      if (data?.channels.find((item) => item.id === channel.id)) {
        return data;
      }

      added = true;
      data?.channels.push({
        ...channel,
        unReadMessageCount: 0,
        __typename: 'ChannelWithPersonalizedData',
      });
      return data;
    }
  );

  return added;
};

const updateChannel = (channel: types.Channel, cache: Cache) => {
  // cache.writeFragment: ドキュメントのフィールドと更新しようとするデータのフィールドがすべてあっていないと警告が出るので注意
  cache.writeFragment<Omit<types.ChannelWithPersonalizedData, 'unReadMessageCount'>>(
    docs.ChannelFragmentFragmentDoc,
    {
      ...channel,
      __typename: 'ChannelWithPersonalizedData',
    }
  );
};

const deleteChannel = (channelId: types.Channel['id'], cache: Cache) => {
  const channelCache = cache.inspectFields('Query').find((qc) => qc.fieldName === 'channels');
  if (!channelCache) {
    return;
  }

  cache.updateQuery<types.MyChannelAndProfileQuery>(
    { query: docs.MyChannelAndProfileDocument },
    (data) => {
      if (data?.channels) {
        data.channels = data.channels.filter((item) => item.id !== channelId);
      }
      return data;
    }
  );
};

const addNewMessage = (message: types.CreateMessageMutation['createMessage'], cache: Cache) => {
  const latestPageCache = cache.inspectFields('Query').find((queryCache) => {
    if (queryCache.fieldName === 'messages') {
      const arg = queryCache.arguments as types.LatestMessagesQueryVariables;
      return arg.channelId === message.channelId && arg.before == null;
    }
    return false;
  });

  if (!latestPageCache) {
    return;
  }

  cache.updateQuery<types.LatestMessagesQuery>(
    { query: docs.LatestMessagesDocument, variables: latestPageCache.arguments || undefined },
    (data) => {
      if (data?.messages.edges.find((item) => item.node.id === message.id)) {
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

const updateMessage = (message: types.Message, cache: Cache) => {
  cache.writeFragment<types.Message>(docs.MessageFragmentFragmentDoc, message);
};

const updateUnReadMessageCount = (
  payload: Pick<types.Message, 'channelId' | 'isRead'>,
  action: 'increment' | 'decrement',
  cache: Cache
) => {
  if (payload.isRead) {
    return;
  }

  cache.updateQuery<types.MyChannelAndProfileQuery>(
    { query: docs.MyChannelAndProfileDocument },
    (data) => {
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
    }
  );
};

const deleteMessage = (messageId: types.Message['id'], cache: Cache) => {
  cache
    .inspectFields('Query')
    .filter((qc) => qc.fieldName === 'messages')
    .forEach((qc) => {
      cache.updateQuery<types.LatestMessagesQuery>(
        { query: docs.LatestMessagesDocument, variables: qc.arguments ?? undefined },
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
