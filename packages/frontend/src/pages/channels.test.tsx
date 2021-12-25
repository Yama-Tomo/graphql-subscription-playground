import { setUserId } from '@/libs/user';
import Channels from '@/pages/channels.page';
import { createTestRenderer, publishSubscription } from '@/test_utils/helper';
import {
  mockSubscriptionExchange,
  MutationType,
  myChannelAndProfileQuery,
  newChangeChannelSubscriptionPayload,
  newChannelWithPersonalizedData,
  newSubscription,
  newUser,
} from '@/test_utils/mocks';

const renderer = createTestRenderer(Channels);

describe('pages/channels', () => {
  beforeAll(() => {
    setUserId('test-uid');
  });

  it('チャンネル一覧が描画されること', async () => {
    mockSubscriptionExchange();
    const result = renderer();
    expect(await result.findByText('# ch1')).toBeInTheDocument();
    expect(await result.findByText('# ch2')).toBeInTheDocument();
    expect(await result.findByText('dm1')).toBeInTheDocument();
  });

  describe('他ユーザからのアクション', () => {
    it('チャンネルに招待されたらチャンネル一覧を再描画すること', async () => {
      const [publishable] = mockSubscriptionExchange();
      const result = renderer();

      const data = newSubscription({
        changeNotification: newChangeChannelSubscriptionPayload({
          data: { name: 'new-add-channel' },
        }),
      });
      await publishSubscription(publishable, data, 100);

      expect(await result.findByText('# new-add-channel')).toBeInTheDocument();
    });

    it('ほかユーザが作成したチャンネルを削除されたらチャンネル一覧を再描画すること', async () => {
      const [publishable] = mockSubscriptionExchange();

      const myUser = newUser();
      const otherUser = newUser();
      const otherUserCreatedCh = newChannelWithPersonalizedData({
        name: 'other-user-ch1',
        ownerId: otherUser.id,
      });
      const result = renderer(
        myChannelAndProfileQuery({
          channels: [
            newChannelWithPersonalizedData({ name: 'ch1', ownerId: myUser.id }),
            otherUserCreatedCh,
          ],
          myProfile: myUser,
        })
      );

      expect(await result.findByText('# ch1')).toBeInTheDocument();
      const otherUserCreatedChMatcher = '# other-user-ch1';
      expect(await result.findByText(otherUserCreatedChMatcher)).toBeInTheDocument();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { unReadMessageCount: _, ...rest } = otherUserCreatedCh;
      const data = newSubscription({
        changeNotification: newChangeChannelSubscriptionPayload({
          mutation: MutationType.Deleted,
          data: { ...rest, __typename: 'Channel' },
        }),
      });
      await publishSubscription(publishable, data);

      expect(result.queryByText(otherUserCreatedChMatcher)).toBeNull();
    });
  });
});
