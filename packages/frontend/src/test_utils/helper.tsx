import { act, render } from '@testing-library/react';
import { GraphQLHandler, GraphQLRequest } from 'msw';
import { AppProps } from 'next/app';
import React from 'react';

import { PublishSubscription, router, server, Subscription } from '@/test_utils/mocks';

const createTestRenderer =
  (Component: AppProps['Component'], pageProps?: Omit<AppProps, 'router' | 'Component'>) =>
  (...responseOverride: GraphQLHandler<GraphQLRequest<never>>[]) => {
    if (responseOverride.length > 0) {
      server.use(...responseOverride);
    }
    const appProps: AppProps = {
      Component,
      // NOTE: かっちりやるなら足りないプロパティがまだまだあるのでそれらもモックするのがいいのだが量が多いのでanyでごまかし、テストを書いてる過程で足りないプロパティは都度足す
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router: router() as any,
      pageProps: pageProps || {},
    };

    // _app.page.tsxをimportしてしまうとその中で呼び出しているwithUrqlClientが先に実行され
    // beforeEachで行うnext-urqlのモックが無意味になるのでrequireを使ってこのタイミングで動的に読み込む
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: App }: typeof import('@/pages/_app.page') = require('@/pages/_app.page');
    return render(<App {...appProps} />);
  };

const publishSubscription = async (
  publishable: Promise<PublishSubscription>,
  data: Subscription,
  delay = 100
) => {
  await act(async () => {
    // 場合によっては描画（query)が走ってからpublishしないと期待する結果にならないケースにも応えられるようにスリープを入れられるようにする
    if (delay) {
      await new Promise((r) => setTimeout(r, delay));
    }
    const publish = await publishable;
    publish(data);
  });
};

export { createTestRenderer, publishSubscription };
