import { graphql, setupWorker } from 'msw';
import { setupServer } from 'msw/node';

import testUtilsMark from '@/test_utils/tree_shake';

import {
  ChannelWithPersonalizedData,
  MyChannelAndProfileDocument,
  newChannelWithPersonalizedData,
  newUser,
  User,
} from './_generated_gql_mocks';

const myChannelAndProfileQuery = ({
  channels,
  myProfile,
}: { channels?: ChannelWithPersonalizedData[]; myProfile?: User } = {}) => {
  return graphql.query(MyChannelAndProfileDocument, (req, res, ctx) =>
    res(
      ctx.data({
        channels: channels || [
          newChannelWithPersonalizedData({ name: 'ch1' }),
          newChannelWithPersonalizedData({ name: 'ch2' }),
          newChannelWithPersonalizedData({ name: 'dm1', isDM: true }),
        ],
        myProfile: myProfile || newUser({ name: 'yamatomo' }),
      })
    )
  );
};

const handlers = [myChannelAndProfileQuery()];

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
    }
  }
};

export { server, isMockForNode, handlers, myChannelAndProfileQuery, setupMockServer };
