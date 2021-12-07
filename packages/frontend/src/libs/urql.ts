import { cacheExchange } from '@urql/exchange-graphcache';
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
      },
    },
  });

export { setupCache };
