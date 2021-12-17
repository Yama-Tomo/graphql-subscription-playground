import { Context } from '@/context';
import {
  ChannelResolvers,
  ChannelWithPersonalizedData,
  ChannelWithPersonalizedDataResolvers,
  MessageResolvers,
  ReadMessageUsersResolvers,
  ResolversParentTypes,
} from '@/resolvers/generated';
import { isMessageRead } from '@/resolvers/libs/message';

const Message: MessageResolvers<
  Context,
  ResolversParentTypes['Message'] & Partial<{ userId: string; readUserIds: string[] }>
> = {
  user(parent, args, { db }) {
    const user = db.users.find((usr) => usr.id === parent.userId);
    if (!user) {
      throw new Error('user not found');
    }

    return user;
  },
  readUsers({ readUserIds }, args, { db }) {
    return (readUserIds || [])
      .map((id) => db.users.find((usr) => usr.id == id))
      .filter(Boolean) as typeof db.users;
  },
  isRead(parent, args, { user: currentUser }) {
    return isMessageRead(currentUser.id, parent.userId || '', parent.readUserIds || []);
  },
};

const ChannelWithPersonalizedData: ChannelWithPersonalizedDataResolvers<
  Context,
  ResolversParentTypes['ChannelWithPersonalizedData'] & Partial<{ joinUserIds: string[] }>
> = {
  joinUsers(parent, args, { db }) {
    return db.users.filter((usr) => parent.joinUserIds?.includes(usr.id));
  },
};

const Channel: ChannelResolvers<
  Context,
  ResolversParentTypes['Channel'] & Partial<{ joinUserIds: string[] }>
> = {
  joinUsers(parent, args, { db }) {
    return db.users.filter((usr) => parent.joinUserIds?.includes(usr.id));
  },
};

const ReadMessageUsers: ReadMessageUsersResolvers<
  Context,
  ResolversParentTypes['ReadMessageUsers'] & Partial<{ readUserIds: string[] }>
> = {
  readUsers(parent, args, { db }) {
    return db.users.filter((usr) => parent.readUserIds?.includes(usr.id));
  },
};

export { Message, ChannelWithPersonalizedData, Channel, ReadMessageUsers };
