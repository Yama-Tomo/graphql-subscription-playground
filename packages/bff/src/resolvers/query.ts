import { Resolvers } from '@/resolvers/generated';
import { isRead } from '@/resolvers/mutation';

const Query: Resolvers['Query'] = {
  hello: () => {
    return `Hello world`;
  },
  channels: (parent, args, { db, user }) => {
    return db.channels
      .filter((channel) => channel.joinUsers.includes(user.id))
      .map(({ joinUsers, ...rest }) => {
        const unReadMessageCount = db.messages.filter(
          (mes) => mes.channelId == rest.id && !isRead(user.id, mes.userId, mes.readUserIds)
        ).length;

        return {
          ...rest,
          joinUsers: db.users.filter((user) => joinUsers.includes(user.id)),
          unReadMessageCount,
        };
      });
  },
  messages: (parent, args, { db, user: currentUser }) => {
    const isJoinedChannel = db.channels
      .find((channel) => channel.id === args.channelId)
      ?.joinUsers.includes(currentUser.id);
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
      edges: data.reverse().map(({ userId: messageOwnerId, readUserIds, ...rest }) => {
        const user = db.users.find((user) => user.id === messageOwnerId);
        if (!user) {
          throw new Error('not found user');
        }
        const readUsers = readUserIds
          .map((id) => db.users.find((user) => user.id == id))
          .filter(Boolean) as typeof db.users;

        const read = isRead(currentUser.id, messageOwnerId, readUserIds);

        return { cursor: rest.id, node: { ...rest, user, readUsers, isRead: read } };
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
