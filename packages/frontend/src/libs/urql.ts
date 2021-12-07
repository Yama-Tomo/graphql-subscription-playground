import { cacheExchange, Cache } from '@urql/exchange-graphcache';
import { types, docs } from '@/hooks/api';

const setupCache = () =>
  cacheExchange({
    updates: {
      Mutation: {
        createChannel: (parent: types.CreateChannelMutation, _, cache) => {
          cache.updateQuery<types.MyChannelsQuery>({ query: docs.MyChannelsDocument }, (data) => {
            if (data) {
              data.channels.push(parent.createChannel);
            }

            return data;
          });
        },
        createMessage: (
          parent: types.CreateMessageMutation,
          vars: { data: types.CreateMessageMutationVariables },
          cache
        ) => {
          addNewMessage(parent, vars, cache);
        },
      },
    },
  });

const addNewMessage = (
  parent: types.CreateMessageMutation,
  vars: { data: types.CreateMessageMutationVariables },
  cache: Cache
) => {
  const latestPageCache = cache.inspectFields('Query').find((queryCache) => {
    if (queryCache.fieldName === 'messages') {
      const arg = queryCache.arguments as types.LatestMessagesQueryVariables;
      return arg.channelId === vars.data.channelId && arg.before == null;
    }
    return false;
  });

  if (!latestPageCache) {
    return;
  }

  cache.updateQuery<types.LatestMessagesQuery>(
    { query: docs.LatestMessagesDocument, variables: latestPageCache.arguments || undefined },
    (data) => {
      data?.messages.edges.push({
        __typename: 'MessageEdge',
        cursor: parent.createMessage.id,
        node: { __typename: 'Message', ...parent.createMessage },
      });

      return data;
    }
  );
};

export { setupCache };
