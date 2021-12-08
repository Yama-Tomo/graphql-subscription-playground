import '../styles/globals.css';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';
import { dedupExchange, fetchExchange, gql, subscriptionExchange } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { setupCache } from '@/libs/urql';
import { useChangeNotificationSubscription } from '@/hooks/api';

function MyApp({ Component, pageProps }: AppProps) {
  useChangeNotificationSubscription();
  return <Component {...pageProps} />;
}

const setupSubscription = () => {
  const subscriptionClient = new SubscriptionClient(process.env.NEXT_PUBLIC_WS_GRAPHQL_URL || '', {
    reconnect: true,
  });

  return subscriptionExchange({
    forwardSubscription: (operation) => subscriptionClient.request(operation),
  });
};

export default withUrqlClient(
  () => ({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
    // prettier-ignore
    exchanges: [dedupExchange, setupCache(), fetchExchange, ...(process.browser ? [setupSubscription()] : [])],
    fetchOptions() {
      return {};
    },
  }),
  { ssr: false }
)(MyApp);

gql`
  subscription ChangeNotification {
    changeNotification {
      ... on ChangeChannelSubscriptionPayload {
        mutation
        data {
          id
          description
          isDM
          joinUsers
          name
          ownerId
        }
      }

      ... on ChangeMessageSubscriptionPayload {
        mutation
        data {
          id
          channelId
          text
          userId
        }
      }
    }
  }
`;
