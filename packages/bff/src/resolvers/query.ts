import { Resolvers } from '@/resolvers/_generated';

const Query: Resolvers['Query'] = {
  hello: () => {
    return `Hello world`;
  },
  async channels(parent, args, { user, dataSources }) {
    return dataSources.channel.getJoinedChannels(user.id);
  },
  messages: async (parent, args, { user: currentUser, dataSources }) => {
    const channel = await dataSources.channel.getById(args.channelId);
    channel.joinUserIds.includes(currentUser.id);
    if (!channel.joinUserIds.includes(currentUser.id)) {
      throw new Error('permission error');
    }

    const currentChannelMessages = await dataSources.message.getByChannelId(args.channelId);
    const reverseCurrentChannelMessage = [...currentChannelMessages].reverse();

    const nextCursor = (() => {
      if (args.before) {
        const foundIdx = reverseCurrentChannelMessage.findIndex(
          (message) => message.id === args.before
        );
        if (foundIdx !== -1) {
          return foundIdx + 1;
        }
      }

      return 0;
    })();

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
        hasNextPage: !!args.before,
        hasPreviousPage: withNextPageData.length !== data.length,
        startCursor: data[data.length - 1]?.id,
        endCursor: data[0]?.id,
      },
      edges: data.reverse().map((mess) => ({ cursor: mess.id, node: mess })),
    };
  },
  async myProfile(parent, args, { user, dataSources }) {
    return dataSources.user.getById(user.id);
  },
  searchUsers: async (parent, args, { dataSources }) => {
    return dataSources.user.getByName(args.name);
  },
};

export { Query };
