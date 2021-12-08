import { cacheExchange, Cache } from '@urql/exchange-graphcache';
import { docs, types, MutationType } from '@/hooks/api';

const cacheConfig = (): types.GraphCacheConfig => ({
  updates: {
    Mutation: {
      createChannel: (parent, args, cache) => {
        cache.updateQuery<types.MyChannelsQuery>({ query: docs.MyChannelsDocument }, (data) => {
          if (data?.channels && isAllKeyNotEmpty(parent.createChannel)) {
            data.channels.push(parent.createChannel);
          }

          return data;
        });
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
        if (mutation === MutationType.Created && data?.__typename == 'Message') {
          addNewMessage(data, cache);
        }
      },
    },
  },
});

const isAllKeyNotEmpty = <T extends Record<string, unknown>>(
  arg: T | undefined
): arg is Required<NonNullable<T>> => arg != null && !Object.values(arg).find((v) => v == null);

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

const setupCache = () => cacheExchange(cacheConfig());

export { setupCache };
