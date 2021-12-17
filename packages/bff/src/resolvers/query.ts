import { Resolvers } from '@/resolvers/generated';
import { isMessageRead } from '@/resolvers/libs/message';

const Query: Resolvers['Query'] = {
  hello: () => {
    return `Hello world`;
  },
  channels: (parent, args, { db, user }) => {
    return db.channels
      .filter((channel) => channel.joinUserIds.includes(user.id))
      .map(({ joinUserIds, ...rest }) => {
        const unReadMessageCount = db.messages.filter(
          (mes) => mes.channelId == rest.id && !isMessageRead(user.id, mes.userId, mes.readUserIds)
        ).length;

        return { ...rest, joinUserIds, unReadMessageCount };
      });
  },
  messages: (parent, args, { db, user: currentUser }) => {
    const isJoinedChannel = db.channels
      .find((channel) => channel.id === args.channelId)
      ?.joinUserIds.includes(currentUser.id);
    if (!isJoinedChannel) {
      throw new Error('permission error');
    }

    const currentChannelMessages = db.messages.filter(
      (message) => message.channelId == args.channelId
    );
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
      edges: data.reverse().map(({ userId, readUserIds, ...rest }) => {
        return { cursor: rest.id, node: { ...rest, userId, readUserIds } };
      }),
    };
  },
  myProfile: (parent, args, { user, db }) => {
    const userId = user.id;
    const currentUser = db.users.find((user) => user.id === userId);
    if (!currentUser) {
      throw new Error('user not found');
    }

    return currentUser;
  },
  searchUsers: (parent, args, { db }) => {
    return db.users.filter((user) => user.name.includes(args.name));
  },
};

export { Query };
