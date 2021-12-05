import { Resolvers } from '@/resolvers/generated';

const Query: Resolvers['Query'] = {
  hello: () => {
    return `Hello world`;
  },
  channels: (parent, args, { db, user }) => {
    return db.channels.filter((channel) => channel.joinUsers.includes(user.id));
  },
};

export { Query };
