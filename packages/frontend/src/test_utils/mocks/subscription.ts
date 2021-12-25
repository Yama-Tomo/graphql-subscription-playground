import urql from 'urql';

import { Subscription } from '@/test_utils/mocks';

type PublishSubscription = (payload: Subscription) => void;
const mockSubscriptionExchange = () => {
  const original = urql.subscriptionExchange;
  const subscriptionExchangeSpy = jest.spyOn(urql, 'subscriptionExchange');

  const unsubscribe = jest.fn();

  // 描画が始まってすぐにsubscriptionを購読するわけでないので購読してからpublishできるようにpromiseで返す
  let resolvePublishable: (publish: PublishSubscription) => void;
  const publishable = new Promise<PublishSubscription>((r) => {
    resolvePublishable = r;
  });

  subscriptionExchangeSpy.mockImplementationOnce(() =>
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

  return [publishable, subscriptionExchangeSpy, unsubscribe] as const;
};

export { mockSubscriptionExchange };
export type { PublishSubscription };
