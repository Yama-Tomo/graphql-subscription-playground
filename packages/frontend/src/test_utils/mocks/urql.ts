import { NextComponentType, NextPage } from 'next';
import NextUrql, { NextUrqlContext, WithUrqlProps } from 'next-urql';
import NextApp from 'next/app';
import { createElement } from 'react';
import urql, { createClient, Provider, ssrExchange } from 'urql';

import { Subscription } from '@/test_utils/mocks/_generated_gql_mocks';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const WithUrql = ({ pageProps, urqlClient, urqlState, ...rest }: WithUrqlProps) => {
        const urqlServerState = (pageProps && pageProps.urqlState) || urqlState;
        const ssr = ssrExchange({
          initialState: urqlServerState,
          isClient: true,
          staleWhileRevalidate:
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

type PublishSubscription = (payload: Subscription) => void;
const mockSubscriptionExchange = () => {
  const original = urql.subscriptionExchange;
  const spy = jest.spyOn(urql, 'subscriptionExchange');

  const unsubscribe = jest.fn();

  // 描画が始まってすぐにsubscriptionを購読するわけでないので購読してからpublishできるようにpromiseで返す
  let resolvePublishable: (publish: PublishSubscription) => void;
  const publishable = new Promise<PublishSubscription>((r) => {
    resolvePublishable = r;
  });

  spy.mockImplementationOnce(() =>
    original({
      forwardSubscription() {
        return {
          subscribe(observer) {
            const publish = (payload: Subscription) => {
              observer.next({ data: payload });
            };

            resolvePublishable(publish);
            return { unsubscribe };
          },
        };
      },
    })
  );

  return [publishable, spy, unsubscribe] as const;
};

export { mockWithUrqlClient, mockSubscriptionExchange };
export type { PublishSubscription };
