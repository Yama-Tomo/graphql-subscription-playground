import { FastifyReply, FastifyRequest } from 'fastify';

import { DB } from '@/data';
import { startServer } from '@/server';
import { mockDBData } from '@/test_utils/mocks';

test('メッセージ一覧', async () => {
  const user1 = { id: 'u1', name: 'user1' };
  const user2 = { id: 'u2', name: 'user2' };
  const dbData: DB = {
    // prettier-ignore
    messages: [
      { id: 'mes1', readUserIds: [user1.id], userId: user1.id, channelId: 'ch1', text: 'mes1', date: new Date('2021-01-01') },
      { id: 'mes2', readUserIds: [], userId: user1.id, channelId: 'ch1', text: 'mes2', date: new Date('2021-01-01') },
      { id: 'mes3', readUserIds: [], userId: user2.id, channelId: 'ch1', text: 'mes3', date: new Date('2021-01-01') },
    ],
    users: [user1, user2],
    // prettier-ignore
    channels: [
      { id: 'ch1', name: 'ch1', description: '', joinUserIds: [user1.id, user2.id], isDM: false, ownerId: user1.id },
    ],
  };

  mockDBData(dbData);

  const { server } = await startServer();
  const query = `query ($channelId: ID!, $last: Int!) {
    messages(channelId: $channelId, last: $last) {
      pageInfo {
        endCursor
        startCursor
        hasPreviousPage
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          user {
            id
            name
          }
          readUsers {
            id
            name
          }
          date
          text
          channelId
        }
      }
    }
  }`;
  const res = await server.executeOperation(
    { query, variables: { channelId: 'ch1', last: 10 } },
    {
      request: { headers: { user_id: user1.id } } as unknown as FastifyRequest,
      reply: {} as FastifyReply,
    }
  );

  expect(res).toMatchSnapshot();
});
