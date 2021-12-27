import { Resolvers } from '@/resolvers/_generated';
import { isMessageRead } from '@/resolvers/libs/message';

const ObjectsResolvers: Resolvers = {
  Message: {
    user: async (parent, args, { dataSources }) => {
      return dataSources.user.getById(parent.userId);
    },
    readUsers({ readUserIds }, args, { dataSources }) {
      return dataSources.user.getByIds(readUserIds);
    },
    isRead(parent, args, { user: currentUser }) {
      return isMessageRead(currentUser.id, parent.userId, parent.readUserIds);
    },
  },
  ChannelWithPersonalizedData: {
    joinUsers(parent, args, { dataSources }) {
      return dataSources.user.getByIds(parent.joinUserIds);
    },
    unReadMessageCount(parent, args, { user: currentUser, dataSources }) {
      return dataSources.message
        .getByChannelId(parent.id)
        .then(
          (messages) =>
            messages.filter((mess) => !isMessageRead(currentUser.id, mess.userId, mess.readUserIds))
              .length
        );
    },
  },
  Channel: {
    joinUsers(parent, args, { dataSources }) {
      return dataSources.user.getByIds(parent.joinUserIds);
    },
  },
  ReadMessageUsers: {
    readUsers(parent, args, { dataSources }) {
      return dataSources.user.getByIds(parent.readUserIds);
    },
  },
};

export { ObjectsResolvers };
