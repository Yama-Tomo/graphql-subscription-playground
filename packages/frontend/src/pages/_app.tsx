import '../styles/globals.css';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';
import { dedupExchange, fetchExchange } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { types, gql } from '@/hooks/api';

const cache = cacheExchange({
  updates: {
    Mutation: {
      createChannel: (parent: types.CreateChannelMutation, _, cache) => {
        cache.updateQuery<types.MyChannelsQuery>({ query: gql.MyChannels }, (data) => {
          if (data) {
            data.channels.push(parent.createChannel);
          }

          return data;
        });
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withUrqlClient(
  () => ({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
    exchanges: [dedupExchange, cache, fetchExchange],
  }),
  { ssr: false }
)(MyApp);
