import { graphql, setupWorker } from 'msw';
import { setupServer } from 'msw/node';

import testUtilsMark from '@/test_utils/tree_shake';

import {
  ChannelWithPersonalizedData,
  LatestMessagesDocument,
  MyChannelAndProfileDocument,
  newChannelWithPersonalizedData,
  newMessage,
  newMessageConnection,
  newMessageEdge,
  newPageInfo,
  newUser,
  User,
} from './_generated_gql_mocks';

const myChannelAndProfileQuery = ({
  channels,
  myProfile,
}: { channels?: ChannelWithPersonalizedData[]; myProfile?: User } = {}) => {
  return graphql.query(MyChannelAndProfileDocument, (req, res, ctx) => {
    const user = myProfile || users.yamatomo;
    return res(
      ctx.data({
        channels: channels || [
          newChannelWithPersonalizedData({ id: 'ch1', name: 'ch1', ownerId: user.id }),
          newChannelWithPersonalizedData({ id: 'ch2', name: 'ch2' }),
          newChannelWithPersonalizedData({
            id: 'ch3',
            name: 'loooong channel',
            unReadMessageCount: 2,
          }),
          newChannelWithPersonalizedData({ id: 'dm1', name: 'dm1', isDM: true }),
        ],
        myProfile: user,
      })
    );
  });
};

const users = {
  yamatomo: newUser({ name: 'yamatomo' }),
  bond: newUser({ name: 'bond(007)' }),
  M: newUser({ name: 'M ' }),
  Q: newUser({ name: 'Q' }),
};

const latestMessagesQuery = (messageLength = 15) => {
  return graphql.query(LatestMessagesDocument, (req, res, ctx) => {
    const userArr = Object.values(users);

    const edges = Array.from({ length: messageLength }).map((_, idx) => {
      const user = userArr[idx % userArr.length];
      const message = newMessage({
        channelId: req.variables.channelId,
        user,
        date: '2021-01-01',
        text: `message-${req.variables.channelId}-${idx}`,
      });
      return newMessageEdge({ cursor: message.id, node: message });
    });

    return res(
      ctx.data({
        messages: newMessageConnection({
          pageInfo: newPageInfo({
            startCursor: edges[0].cursor,
            endCursor: edges[edges.length - 1].cursor,
          }),
          edges,
        }),
      })
    );
  });
};

const handlers = [myChannelAndProfileQuery(), latestMessagesQuery()];

const isBrowser = process.browser;
const server = isBrowser ? setupWorker(...handlers) : setupServer(...handlers);
const isMockForNode = (arg: typeof server): arg is ReturnType<typeof setupServer> => !isBrowser;

const setupMockServer = () => {
  if (process.env.NEXT_PUBLIC_ENABLE_MSW === 'enabled') {
    testUtilsMark();
    if (isMockForNode(server)) {
      server.listen();
    } else {
      server.start();
      window._msw = server;
    }
  }
};

export { server, isMockForNode, handlers, myChannelAndProfileQuery, setupMockServer };
