import '../styles/globals.css';
import React, { useEffect, useState } from 'react';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';
import { dedupExchange, fetchExchange, subscriptionExchange } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { SignUp } from '@/components/SignUp';
import { setupCache } from '@/libs/urql';
import { getUserId } from '@/libs/user';
import { useChangeNotificationSubscription } from '@/hooks/api';

function MyApp({ Component, pageProps, ...rest }: AppProps) {
  const router = rest.router;
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      setUserId(getUserId());
    });
  }, [router]);

  if (userId) {
    return <AuthenticatedLayout pageProps={pageProps} Component={Component} {...rest} />;
  }

  return <SignUp {...rest} />;
}

const AuthenticatedLayout: React.FC<AppProps> = ({ Component, pageProps }) => {
  useChangeNotificationSubscription();
  return <Component {...pageProps} />;
};

const setupSubscription = () => {
  const subscriptionClient = new SubscriptionClient(process.env.NEXT_PUBLIC_WS_GRAPHQL_URL || '', {
    reconnect: true,
    lazy: true,
    connectionParams() {
      return { user_id: getUserId() };
    },
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
      return {
        headers: {
          user_id: getUserId() || '',
        },
      };
    },
  }),
  { ssr: false }
)(MyApp);
