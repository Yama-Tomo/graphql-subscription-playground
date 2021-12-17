import { Resolvers } from '@/resolvers/generated';
import { isMessageRead } from '@/resolvers/libs/message';

const ObjectsResolvers: Resolvers = {
  Message: {
    user(parent, args, { db }) {
      const user = db.users.find((usr) => usr.id === parent.userId);
      if (!user) {
        throw new Error('user not found');
      }

      return user;
    },
    readUsers({ readUserIds }, args, { db }) {
      return readUserIds
        .map((id) => db.users.find((usr) => usr.id == id))
        .filter(Boolean) as typeof db.users;
    },
    isRead(parent, args, { user: currentUser }) {
      return isMessageRead(currentUser.id, parent.userId, parent.readUserIds);
    },
  },
  ChannelWithPersonalizedData: {
    joinUsers(parent, args, { db }) {
      return db.users.filter((usr) => parent.joinUserIds.includes(usr.id));
    },
  },
  Channel: {
    joinUsers(parent, args, { db }) {
      return db.users.filter((usr) => parent.joinUserIds.includes(usr.id));
    },
  },
  ReadMessageUsers: {
    readUsers(parent, args, { db }) {
      return db.users.filter((usr) => parent.readUserIds.includes(usr.id));
    },
  },
};

export { ObjectsResolvers };
