import { ApolloServer } from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { fastify } from 'fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '@/schema';
import { resolvers } from '@/resolvers';

const startServer = async (opts?: Partial<{ port: number; path: string }>) => {
  const path = opts?.path || '/graphql';
  const fastifyApp = fastify();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context() {
      return {};
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: fastifyApp.server })],
  });

  await server.start();
  fastifyApp.register(server.createHandler({ path }));
  const listenHost = await fastifyApp.listen(opts?.port || 4000);

  return { server, fastifyApp, publicUrl: listenHost + path };
};

export { startServer };
