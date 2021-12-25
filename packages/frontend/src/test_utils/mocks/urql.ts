import { NextComponentType, NextPage } from 'next';
import NextUrql, { NextUrqlContext, WithUrqlProps } from 'next-urql';
import NextApp from 'next/app';
import { createElement } from 'react';
import { createClient, Provider, ssrExchange } from 'urql';

// https://github.com/FormidableLabs/urql/blob/b4674c4961df28c724a3d214c5828d4f60ca6a99/packages/next-urql/src/init-urql-client.ts#L3
// クライアントインスタンスを保持する変数のスコープがグローバルなのでテスト間で参照しあってしまい不整合が起きるので
// 参照を切り離すための修正を加えたモックにする
const mockWithUrqlClient = () => {
  jest.spyOn(NextUrql, 'withUrqlClient').mockImplementation((getClientConfig, options) => {
    if (!options) options = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <C extends NextPage<any> | typeof NextApp>(
      AppOrPage: C
      // eslint-disable-next-line @typescript-eslint/ban-types
    ): NextComponentType<NextUrqlContext, {}, WithUrqlProps> => {
      const WithUrql = ({ pageProps, urqlClient, urqlState, ...rest }: WithUrqlProps) => {
        const urqlServerState = (pageProps && pageProps.urqlState) || urqlState;
        const ssr = ssrExchange({
          initialState: urqlServerState,
          isClient: true,
          staleWhileRevalidate:
            typeof window !== 'undefined' ? options!.staleWhileRevalidate : undefined,
        });

        const clientConfig = getClientConfig(ssr);
        const client = createClient(clientConfig);

        return createElement(
          Provider,
          { value: client },
          createElement(AppOrPage, { ...rest, pageProps, urqlClient: client })
        );
      };

      return WithUrql;
    };
  });
};

export { mockWithUrqlClient };
