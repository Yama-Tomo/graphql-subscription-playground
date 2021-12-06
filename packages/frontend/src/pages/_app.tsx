import '../styles/globals.css';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';
import { dedupExchange, fetchExchange } from 'urql';
import { setupCache } from '@/libs/urql';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withUrqlClient(
  () => ({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
    exchanges: [dedupExchange, setupCache(), fetchExchange],
  }),
  { ssr: false }
)(MyApp);
