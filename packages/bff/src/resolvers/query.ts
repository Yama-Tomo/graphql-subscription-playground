import { Resolvers } from '@/resolvers/generated';

const Query: Resolvers['Query'] = {
  hello: () => {
    return `Hello world`;
  },
};

export { Query };
