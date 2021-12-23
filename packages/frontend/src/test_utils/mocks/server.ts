import { graphql } from 'msw';
import { setupServer } from 'msw/node';

import {
  MyChannelAndProfileDocument,
  newChannelWithPersonalizedData,
  newUser,
} from './gql_generated_factories';

const handlers = [
  graphql.query(MyChannelAndProfileDocument, (req, res, ctx) =>
    res(
      ctx.data({
        channels: [
          newChannelWithPersonalizedData({ name: 'ch1' }),
          newChannelWithPersonalizedData({ name: 'ch2' }),
          newChannelWithPersonalizedData({ name: 'dm1', isDM: true }),
        ],
        myProfile: newUser({ name: 'yamatomo' }),
      })
    )
  ),
];

const server = setupServer(...handlers);

export { server, handlers };
