import { setUserId } from '@/libs/user';
import Channels from '@/pages/channels.page';
import { createTestRenderer, publishSubscription } from '@/test_utils/helper';
import {
  channelsPageQuery,
  mockSubscriptionExchange,
  MutationType,
  newChangeChannelSubscriptionPayload,
  newChannelWithPersonalizedData,
  newSubscription,
  newUser,
  requestServerSpy,
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
      expect(requestServerSpy?.mock.calls.length).toBe(1);
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
        channelsPageQuery({
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
      expect(requestServerSpy?.mock.calls.length).toBe(1);
    });

    it('ほかユーザが作成したチャンネルが更新されたらチャンネル一覧を再描画すること', async () => {
      const [publishable] = mockSubscriptionExchange();

      const myUser = newUser();
      const otherUser = newUser();
      const otherUserCreatedCh = newChannelWithPersonalizedData({
        name: 'other-user-ch1',
        ownerId: otherUser.id,
      });
      const result = renderer(
        channelsPageQuery({
          channels: [
            newChannelWithPersonalizedData({ name: 'ch1', ownerId: myUser.id }),
            otherUserCreatedCh,
          ],
          myProfile: myUser,
        })
      );

      expect(await result.findByText(/^# ch1$/)).toBeInTheDocument();
      expect(await result.findByText(/^# other-user-ch1$/)).toBeInTheDocument();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { unReadMessageCount: _, ...rest } = otherUserCreatedCh;
      const data = newSubscription({
        changeNotification: newChangeChannelSubscriptionPayload({
          mutation: MutationType.Updated,
          data: { ...rest, name: '[update]other-user-ch1', __typename: 'Channel' },
        }),
      });
      await publishSubscription(publishable, data);

      expect(await result.findByText('# [update]other-user-ch1')).toBeInTheDocument();
      expect(requestServerSpy?.mock.calls.length).toBe(1);
    });
  });
});
