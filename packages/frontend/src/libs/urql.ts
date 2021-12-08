import { gql } from 'urql';
import { cacheExchange, Cache } from '@urql/exchange-graphcache';
import { docs, types, MutationType } from '@/hooks/api';

const cacheConfig = (): types.GraphCacheConfig => ({
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
          }
          if (data?.__typename === 'Channel') {
            addNewChannel(data, cache);
          }
        }

        if (mutation === MutationType.Updated) {
          if (data?.__typename === 'Channel') {
            updateChannel(data, cache);
          }
        }

        if (mutation === MutationType.Deleted) {
          if (data?.__typename === 'Channel') {
            deleteChannel(data.id, cache);
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

  cache.updateQuery<types.MyChannelsQuery>({ query: docs.MyChannelsDocument }, (data) => {
    if (data?.channels.find((item) => item.id === channel.id)) {
      return data;
    }

    data?.channels.push({ __typename: 'Channel', ...channel });
    return data;
  });
};

const updateChannel = (channel: types.Channel, cache: Cache) => {
  cache.writeFragment(
    gql`
      fragment _ on Channel {
        id
        isDM
        joinUsers
        description
        name
        ownerId
      }
    `,
    channel
  );
};

const deleteChannel = (channelId: types.Channel['id'], cache: Cache) => {
  const channelCache = cache.inspectFields('Query').find((qc) => qc.fieldName === 'channels');
  if (!channelCache) {
    return;
  }

  cache.updateQuery<types.MyChannelsQuery>({ query: docs.MyChannelsDocument }, (data) => {
    if (data?.channels) {
      data.channels = data.channels.filter((item) => item.id !== channelId);
    }
    return data;
  });
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

const setupCache = () => cacheExchange(cacheConfig());

export { setupCache };
