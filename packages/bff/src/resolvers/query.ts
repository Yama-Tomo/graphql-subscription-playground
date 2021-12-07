import { Resolvers } from '@/resolvers/generated';

const Query: Resolvers['Query'] = {
  hello: () => {
    return `Hello world`;
  },
  channels: (parent, args, { db, user }) => {
    return db.channels.filter((channel) => channel.joinUsers.includes(user.id));
  },
  messages: (parent, args, { db, user }) => {
    const isJoinedChannel = db.channels
      .find((channel) => channel.id === args.channelId)
      ?.joinUsers.includes(user.id);
    if (!isJoinedChannel) {
      throw new Error('permission error');
    }

    const currentChannelMessages = db.messages.filter(
      (message) => message.channelId == args.channelId
    );

    const nextCursor = (() => {
      if (args.before) {
        const foundIdx = currentChannelMessages.findIndex((message) => message.id === args.before);
        if (foundIdx !== -1) {
          return foundIdx + 1;
        }
      }

      return 0;
    })();

    const reverseCurrentChannelMessage = [...currentChannelMessages].reverse();
    const withNextPageData = reverseCurrentChannelMessage.slice(
      nextCursor,
      nextCursor + args.last + 1
    );

    const data =
      withNextPageData.length > args.last
        ? withNextPageData.slice(0, withNextPageData.length - 1)
        : withNextPageData;

    return {
      pageInfo: {
        hasNextPage: !args.before,
        hasPreviousPage: withNextPageData.length !== data.length,
        startCursor: data[0]?.id,
        endCursor: data[data.length - 1]?.id,
      },
      edges: data.reverse().map((node) => ({ cursor: node.id, node })),
    };
  },
};

export { Query };
