import { MutationType, Resolvers } from '@/resolvers/generated';
import { v4 } from 'uuid';
import { publishNotification } from '@/resolvers/subscription';
import { UnAuthorizedContext } from '@/context';

const isRead = (currentUserId: string, messageOwnerId: string, readUserIds: string[]) => {
  const isMessageOwner = currentUserId === messageOwnerId;
  return isMessageOwner || readUserIds.includes(currentUserId);
};

const Mutation: Resolvers['Mutation'] = {
  createMessage(parent, { data }, { db, pubsub, user: currentUser }) {
    const message = {
      id: v4(),
      date: new Date(),
      userId: currentUser.id,
      readUserIds: [],
      ...data,
    };
    const channel = db.channels.find((channel) => channel.id == message.channelId);
    if (!channel) {
      throw new Error('channel not found');
    }
    const targetUser = db.users.find((u) => u.id === currentUser.id);
    if (!targetUser) {
      throw new Error('user not found');
    }

    db.messages.push(message);
    const { userId: messageOwnerId, readUserIds, ...rest } = message;
    const payload = { ...rest, user: targetUser, readUsers: [] };

    channel.joinUsers.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, {
        changeNotification: {
          __typename: 'ChangeMessageSubscriptionPayload',
          mutation: MutationType.Created,
          data: { ...payload, isRead: isRead(joinUserId, messageOwnerId, readUserIds) },
        },
      });
    });

    return { ...payload, isRead: isRead(currentUser.id, messageOwnerId, readUserIds) };
  },
  updateMessage(parent, { data }, { db, pubsub, user: currentUser }) {
    const message = db.messages.find((mes) => mes.id === data.id);
    if (!message) {
      throw new Error('message not found');
    }

    const channel = db.channels.find((channel) => channel.id == message.channelId);
    if (!channel) {
      throw new Error('channel not found');
    }

    const targetUser = db.users.find((u) => u.id === currentUser.id);
    if (!targetUser) {
      throw new Error('user not found');
    }

    message.text = data.text;
    const { userId: messageOwnerId, readUserIds, ...rest } = message;
    const readUsers = db.users.filter((u) => readUserIds.includes(u.id));
    const payload = { ...rest, user: targetUser, readUsers };

    channel.joinUsers.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, {
        changeNotification: {
          __typename: 'ChangeMessageSubscriptionPayload',
          mutation: MutationType.Updated,
          data: { ...payload, isRead: isRead(joinUserId, messageOwnerId, readUserIds) },
        },
      });
    });

    return { ...payload, isRead: isRead(currentUser.id, messageOwnerId, readUserIds) };
  },
  deleteMessage(parent, { id }, { db, pubsub, user: currentUser }) {
    const dataIdx = db.messages.findIndex((mes) => mes.id === id);
    const message = db.messages[dataIdx];
    if (!message) {
      throw new Error('message not found');
    }

    const channel = db.channels.find((channel) => channel.id == message.channelId);
    if (!channel) {
      throw new Error('channel not found');
    }

    const targetUser = db.users.find((u) => u.id === currentUser.id);
    if (!targetUser) {
      throw new Error('user not found');
    }

    db.messages.splice(dataIdx, 1);

    const { userId: messageOwnerId, readUserIds, ...rest } = message;
    const readUsers = db.users.filter((u) => readUserIds.includes(u.id));
    const payload = { ...rest, user: targetUser, readUsers };

    channel.joinUsers.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, {
        changeNotification: {
          __typename: 'ChangeMessageSubscriptionPayload',
          mutation: MutationType.Deleted,
          data: { ...payload, isRead: isRead(joinUserId, messageOwnerId, readUserIds) },
        },
      });
    });

    return { ...payload, isRead: isRead(currentUser.id, messageOwnerId, readUserIds) };
  },
  createChannel(parent, { data }, { db, user, pubsub }) {
    const targetUser = db.users.find((u) => u.id === user.id);
    if (!targetUser) {
      throw new Error('user not found');
    }

    const channel = {
      name: data.name,
      description: data.description ?? undefined,
      joinUsers: (data.joinUsers || []).concat(user.id),
      id: v4(),
      isDM: data.isDM,
      ownerId: user.id,
    };
    db.channels.push(channel);

    const { joinUsers, ...rest } = channel;
    const payload = { ...rest, joinUsers: db.users.filter((u) => joinUsers.includes(u.id)) };

    channel.joinUsers.forEach((userId) => {
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Created,
          data: payload,
        },
      });
    });

    return payload;
  },
  updateChannel(parent, { data }, { db, pubsub, user }) {
    const targetUser = db.users.find((u) => u.id === user.id);
    if (!targetUser) {
      throw new Error('user not found');
    }

    const channel = db.channels.find((channel) => channel.id === data.id);
    if (!channel) {
      throw new Error('channel not found');
    }

    if (channel.name !== data.name) {
      channel.name = data.name;
    }
    if (channel.description !== data.description) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      channel.description = data.description!;
    }

    const { joinUsers, ...rest } = channel;
    const payload = { ...rest, joinUsers: db.users.filter((u) => joinUsers.includes(u.id)) };

    channel.joinUsers.forEach((userId) => {
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Updated,
          data: payload,
        },
      });
    });

    return payload;
  },
  inviteChannel(parent, { data }, { db, pubsub, user }) {
    const targetUser = db.users.find((u) => u.id === user.id);
    if (!targetUser) {
      throw new Error('user not found');
    }

    const channel = db.channels.find((channel) => channel.id === data.id);
    if (!channel) {
      throw new Error('channel not found');
    }

    channel.joinUsers.push(data.userId);

    const { joinUsers, ...rest } = channel;
    const payload = { ...rest, joinUsers: db.users.filter((u) => joinUsers.includes(u.id)) };

    channel.joinUsers.forEach((userId) => {
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Updated,
          data: payload,
        },
      });
    });

    return payload;
  },
  deleteChannel(parent, { id }, { db, pubsub, user }) {
    const targetUser = db.users.find((u) => u.id === user.id);
    if (!targetUser) {
      throw new Error('user not found');
    }

    const dataIdx = db.channels.findIndex((channel) => channel.id === id);
    const channel = db.channels[dataIdx];
    if (!channel) {
      throw new Error('channel not found');
    }

    db.channels.splice(dataIdx, 1);

    const { joinUsers, ...rest } = channel;
    const payload = { ...rest, joinUsers: db.users.filter((u) => joinUsers.includes(u.id)) };

    channel.joinUsers.forEach((userId) => {
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Deleted,
          data: payload,
        },
      });
    });

    return payload;
  },
  signup(parent, { name }, { db }: UnAuthorizedContext) {
    const id = v4();
    const user = { id, name };

    db.users.push(user);

    if (!db.channels.find((channel) => channel.ownerId === id && channel.isDM)) {
      db.channels.push({
        id: v4(),
        name: name,
        description: '',
        isDM: true,
        ownerId: user.id,
        joinUsers: [user.id],
      });
    }

    return user;
  },
};

export { Mutation, isRead };
