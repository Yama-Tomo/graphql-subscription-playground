import '../styles/globals.css';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withUrqlClient(
  () => ({
    url: 'http://localhost:4000/graphql',
  }),
  { ssr: false }
)(MyApp);
