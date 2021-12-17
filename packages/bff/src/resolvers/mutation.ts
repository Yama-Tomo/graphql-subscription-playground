import { MutationType, Resolvers } from '@/resolvers/generated';
import { v4 } from 'uuid';
import { publishNotification } from '@/resolvers/subscription';
import { UnAuthorizedContext } from '@/context';

const Mutation: Resolvers['Mutation'] = {
  createMessage(parent, { data }, { db, pubsub, user: currentUser }) {
    const message = {
      id: v4(),
      date: new Date(),
      userId: currentUser.id,
      readUserIds: [],
      ...data,
    };
    db.messages.push(message);

    const channel = db.channels.find((channel) => channel.id == message.channelId);
    channel?.joinUserIds.forEach((joinUserId) => {
      const data = message;
      publishNotification(pubsub, joinUserId, 'ChangeMessageSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Created, data },
      });
    });

    return message;
  },
  updateMessage(parent, { data }, { db, pubsub }) {
    const message = db.messages.find((mes) => mes.id === data.id);
    if (!message) {
      throw new Error('message not found');
    }

    message.text = data.text;

    const channel = db.channels.find((channel) => channel.id == message.channelId);
    channel?.joinUserIds.forEach((joinUserId) => {
      const data = message;
      publishNotification(pubsub, joinUserId, 'ChangeMessageSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Updated, data },
      });
    });

    return message;
  },
  deleteMessage(parent, { id }, { db, pubsub }) {
    const dataIdx = db.messages.findIndex((mes) => mes.id === id);
    const message = db.messages[dataIdx];
    if (!message) {
      throw new Error('message not found');
    }

    db.messages.splice(dataIdx, 1);

    const channel = db.channels.find((channel) => channel.id == message.channelId);
    channel?.joinUserIds.forEach((joinUserId) => {
      const data = message;
      publishNotification(pubsub, joinUserId, 'ChangeMessageSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Deleted, data },
      });
    });

    return message;
  },
  createChannel(parent, { data }, { db, user, pubsub }) {
    const channel = {
      id: v4(),
      name: data.name,
      description: data.description ?? undefined,
      joinUserIds: (data.joinUsers || []).concat(user.id),
      isDM: data.isDM,
      ownerId: user.id,
    };
    db.channels.push(channel);

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Created, data: channel },
      });
    });

    return channel;
  },
  updateChannel(parent, { data }, { db, pubsub }) {
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

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Updated, data: channel },
      });
    });

    return channel;
  },
  inviteChannel(parent, { data }, { db, pubsub }) {
    const channel = db.channels.find((channel) => channel.id === data.id);
    if (!channel) {
      throw new Error('channel not found');
    }

    channel.joinUserIds.push(data.userId);

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Updated, data: channel },
      });
    });

    return channel;
  },
  deleteChannel(parent, { id }, { db, pubsub }) {
    const dataIdx = db.channels.findIndex((channel) => channel.id === id);
    const channel = db.channels[dataIdx];
    if (!channel) {
      throw new Error('channel not found');
    }

    db.channels.splice(dataIdx, 1);

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Deleted, data: channel },
      });
    });

    return channel;
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
        joinUserIds: [user.id],
      });
    }

    return user;
  },
  readMessages(parent, { data }, { user: currentUser, db, pubsub }) {
    const findCache: {
      channels: Record<string, typeof db.channels[number]>;
      users: Record<string, typeof db.users[number]>;
    } = { channels: {}, users: {} };

    const findChannel = (id: string) => {
      const channel =
        findCache.channels[id] ||
        db.channels.find((ch) => ch.id === id && ch.joinUserIds.includes(currentUser.id));
      if (!channel) {
        throw new Error('not allowed channel');
      }

      findCache.channels[id] = channel;
      return channel;
    };

    const findUser = (id: string) => {
      const user = findCache.users[id] || db.users.find((u) => u.id === id);
      if (!user) {
        throw new Error('user not found');
      }

      findCache.users[id] = user;
      return user;
    };

    const rows = data.map(({ id: messageId }) => {
      const message = db.messages.find((mes) => mes.id == messageId);
      if (!message) {
        throw new Error('message not found');
      }

      const channel = findChannel(message.channelId);
      const joinUsers = channel.joinUserIds.map((joinUserId) => findUser(joinUserId));
      return { message, channel: { ...channel, joinUsers } };
    });

    const unReadMessages = rows.filter(({ message }) => {
      const isMessageOwner = message.userId === currentUser.id;
      return !isMessageOwner && !message.readUserIds.includes(currentUser.id);
    });
    unReadMessages.forEach(({ message }) => message.readUserIds.push(currentUser.id));

    unReadMessages.forEach(({ message, channel }) => {
      channel.joinUsers.forEach((joinUser) => {
        const data = { id: message.id, readUserIds: message.readUserIds };
        publishNotification(pubsub, joinUser.id, 'ChangeMessageReadStateSubscriptionPayload', {
          changeNotification: { mutation: MutationType.Updated, data },
        });
      });
    });

    return unReadMessages.map(({ message }) => ({ id: message.id }));
  },
};

export { Mutation };
