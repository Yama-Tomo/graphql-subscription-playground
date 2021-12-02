import { ApolloServer } from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { fastify } from 'fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { typeDefs } from '@/schema';
import { resolvers } from '@/resolvers';
import { Context, createAllRequestSharedContext } from '@/context';

const startServer = async (opts?: Partial<{ port: number; path: string }>) => {
  const path = opts?.path || '/graphql';
  const fastifyApp = fastify();
  const sharedContext = createAllRequestSharedContext();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect(): Context {
        return { ...sharedContext, user: { id: 'todo' } };
      },
    },
    { server: fastifyApp.server, path: path }
  );

  const server = new ApolloServer({
    schema,
    context(): Context {
      return { ...sharedContext, user: { id: 'todo' } };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: fastifyApp.server }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();
  fastifyApp.register(server.createHandler({ path }));
  const listenHost = await fastifyApp.listen(opts?.port || 4000);

  return { server, fastifyApp, publicUrl: listenHost + path };
};

export { startServer };
