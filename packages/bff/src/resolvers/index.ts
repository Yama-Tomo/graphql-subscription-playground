import { Resolvers } from '@/resolvers/generated';

const resolvers: Resolvers = {
  Query: {
    hello: () => {
      return `Hello world`;
    },
  },
};

export { resolvers };
