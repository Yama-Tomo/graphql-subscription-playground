import { FastifyReply, FastifyRequest } from 'fastify';
import { PubSub } from 'graphql-subscriptions';

import { Channel, Message, User } from '@/data';
import { startServer } from '@/server';
import { createSubscriber } from '@/test_utils/helper';
import { mockDBData, mockCreateAllRequestSharedContext } from '@/test_utils/mocks';

test('channel作成', async () => {
  const user1 = { id: 'u1', name: 'user1' };
  const user2 = { id: 'u2', name: 'user2' };
  const dbData: { messages: Message[]; users: User[]; channels: Channel[] } = {
    messages: [],
    users: [user1, user2],
    channels: [],
  };

  mockDBData(dbData);

  const pubsub = new PubSub();
  mockCreateAllRequestSharedContext().mockReturnValue({ pubsub });
  const { server } = await startServer();
  const query = `mutation ($data: CreateChannelInput!) {
    createChannel(data: $data) {
      id
      name
      description
      isDM
      joinUsers {
        id
        name
      }
    }
  }`;

  const subscriber = createSubscriber(pubsub);
  const promises = [subscriber(user1.id), subscriber(user2.id)];

  const res = await server.executeOperation(
    {
      query,
      variables: {
        data: { name: 'test-ch', description: 'test-ch', isDM: false, joinUsers: [user2.id] },
      },
    },
    {
      request: { headers: { user_id: user1.id } } as unknown as FastifyRequest,
      reply: {} as FastifyReply,
    }
  );

  await Promise.all(promises);

  expect(res).toMatchSnapshot('mutation-result');
});
