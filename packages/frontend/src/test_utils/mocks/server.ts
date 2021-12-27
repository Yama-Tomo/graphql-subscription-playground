import { graphql } from 'msw';
import { setupServer } from 'msw/node';

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

const server = setupServer(...handlers);

export { server, handlers, myChannelAndProfileQuery };
