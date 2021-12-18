import { ApolloServer } from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { fastify } from 'fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { typeDefs } from '@/schema';
import { resolvers } from '@/resolvers';
import { UnAuthorizedContext, createAllRequestSharedContext } from '@/context';
import { dataSources, initDataSources } from '@/data';

const startServer = async (opts?: Partial<{ port: number; path: string }>) => {
  const path = opts?.path || '/graphql';
  const fastifyApp = fastify();
  const sharedContext = createAllRequestSharedContext();

  const cache = new InMemoryLRUCache();
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: async (params: Record<string, unknown>): Promise<UnAuthorizedContext> => {
        const userId = params['user_id'] ? String(params['user_id']) : undefined;
        if (!userId) {
          throw new Error('unauthorized');
        }

        const ctx = { ...sharedContext, user: { id: userId } };
        // https://github.com/graphql/graphql-js/issues/894#issuecomment-309403270
        // subscriptionは接続のタイミングしかインスタンスを生成できないので古いキャッシュが残りっぱなしになる可能性が高いのでdataloaderのキャッシュを無効にしてバッチ処理だけ使う
        const dataSources = await initDataSources(ctx, cache, { cache: false });
        return { ...sharedContext, user: { id: userId }, dataSources };
      },
    },
    { server: fastifyApp.server, path: path }
  );

  const server = new ApolloServer({
    schema,
    dataSources,
    cache,
    context(param): Omit<UnAuthorizedContext, 'dataSources'> {
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
