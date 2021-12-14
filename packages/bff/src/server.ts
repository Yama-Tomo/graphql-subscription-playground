import { ApolloServer } from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { fastify } from 'fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { typeDefs } from '@/schema';
import { resolvers } from '@/resolvers';
import { UnAuthorizedContext, createAllRequestSharedContext } from '@/context';

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
      onConnect(params: Record<string, unknown>): UnAuthorizedContext {
        const userId = params['user_id'] ? String(params['user_id']) : undefined;
        if (!userId) {
          throw new Error('unauthorized');
        }

        return { ...sharedContext, user: { id: userId } };
      },
    },
    { server: fastifyApp.server, path: path }
  );

  const server = new ApolloServer({
    schema,
    context(param): UnAuthorizedContext {
      const userId = param.request.headers['user_id']
        ? String(param.request.headers['user_id'])
        : undefined;
      return { ...sharedContext, ...(userId ? { user: { id: userId } } : {}) };
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
  const listenHost = await fastifyApp.listen(opts?.port || 4000, '0.0.0.0');

  return { server, fastifyApp, publicUrl: listenHost + path };
};

export { startServer };
