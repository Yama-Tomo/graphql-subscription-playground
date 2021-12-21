import '../styles/globals.css';
import React, { useEffect, useState } from 'react';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';
import { ChakraProvider, Flex } from '@chakra-ui/react';
import { dedupExchange, fetchExchange, subscriptionExchange } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { Header } from '@/components/Header';
import { SignUp } from '@/components/SignUp';
import { setupCache } from '@/libs/urql';
import { getUserId } from '@/libs/user';
import { theme } from '@/libs/theme';
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
    return (
      <AppContainer>
        <AuthorizedContainer pageProps={pageProps} Component={Component} {...rest} />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <SignUp {...rest} />
    </AppContainer>
  );
}

const AppContainer: React.FC = ({ children }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
);

const AuthorizedContainer: React.FC<AppProps> = ({ Component, pageProps }) => {
  useChangeNotificationSubscription();
  return (
    <>
      <Header />
      <Flex flex={'1 0 auto'} as="main">
        <Component {...pageProps} />
      </Flex>
    </>
  );
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
