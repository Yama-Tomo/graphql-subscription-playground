import { ChakraProvider, Flex } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';
import React, { useEffect, useState } from 'react';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { dedupExchange, fetchExchange, subscriptionExchange } from 'urql';

import { Header } from '@/components/Header';
import { SignUp } from '@/components/SignUp';
import { useChangeNotificationSubscription } from '@/hooks/api';
import { pagesPath } from '@/libs/$path';
import { theme } from '@/libs/theme';
import { setupCache } from '@/libs/urql';
import { getUserId } from '@/libs/user';

import '../styles/globals.css';

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod: typeof import('@/test_utils/mocks') = require('@/test_utils/mocks');
  mod.setupMockServer();
}

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
      <SignUp {...rest} onAuthorized={() => router.push(pagesPath.channels.$url())} />
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
      {/* minHeight=0 => https://note.com/takamoso/n/n32c4e6904cf7 */}
      <Flex flex={'1'} minHeight={0} as="main">
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
