import { setUserId } from '@/libs/user';
import Channels from '@/pages/channels.page';
import { createTestRenderer, publishSubscription } from '@/test_utils/helper';
import {
  mockSubscriptionExchange,
  newChangeChannelSubscriptionPayload,
  newSubscription,
} from '@/test_utils/mocks';

const renderer = createTestRenderer(Channels);

describe('pages/channels', () => {
  beforeAll(() => {
    setUserId('test-uid');
  });

  it('チャンネル一覧が描画されること', async () => {
    mockSubscriptionExchange();
    const result = renderer();
    expect(await result.findByText(/ch1/)).toBeInTheDocument();
    expect(await result.findByText(/ch2/)).toBeInTheDocument();
    expect(await result.findByText(/dm1/)).toBeInTheDocument();
  });

  describe('subscription', () => {
    it('チャンネルに招待されたらチャンネル一覧を再描画すること', async () => {
      const [publishable] = mockSubscriptionExchange();
      const result = renderer();

      const data = newSubscription({
        changeNotification: newChangeChannelSubscriptionPayload({
          data: { name: 'new-add-channel' },
        }),
      });
      await publishSubscription(publishable, data, 100);

      expect(await result.findByText(/new-add-channel/)).toBeInTheDocument();
    });
  });
});
