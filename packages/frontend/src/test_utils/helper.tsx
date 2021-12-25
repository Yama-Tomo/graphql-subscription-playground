import { act, render } from '@testing-library/react';
import { GraphQLHandler, GraphQLRequest } from 'msw';
import { AppProps } from 'next/app';
import React from 'react';

import App from '@/pages/_app.page';
import { PublishSubscription, router, server, Subscription } from '@/test_utils/mocks';

const createTestRenderer =
  (Component: AppProps['Component'], pageProps?: Omit<AppProps, 'router' | 'Component'>) =>
  (responseOverride?: GraphQLHandler<GraphQLRequest<never>>) => {
    if (responseOverride) {
      server.use(responseOverride);
    }
    const appProps: AppProps = {
      Component,
      // NOTE: かっちりやるなら足りないプロパティがまだまだあるのでそれらもモックするのがいいのだが量が多いのでanyでごまかし、テストを書いてる過程で足りないプロパティは都度足す
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router: router() as any,
      pageProps: pageProps || {},
    };

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
