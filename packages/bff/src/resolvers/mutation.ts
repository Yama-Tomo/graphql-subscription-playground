import { MutationType, Resolvers, Channel } from '@/resolvers/generated';
import { v4 } from 'uuid';
import { publishNotification } from '@/resolvers/subscription';

const Mutation: Resolvers['Mutation'] = {
  createMessage(parent, { data }, { db, pubsub, user }) {
    const message = { id: v4(), date: new Date(), userId: user.id, ...data };
    const channel = db.channels.find((channel) => channel.id == message.channelId);
    if (!channel) {
      throw new Error('channel not found');
    }

    db.messages.push(message);
    channel.joinUsers.forEach((userId) => {
      if (user.id === userId) return;
      publishNotification(pubsub, userId, { mutation: MutationType.Created, data: message });
    });

    return message;
  },
  updateMessage(parent, { data }, { db, pubsub, user }) {
    const message = db.messages.find((mes) => mes.id === data.id);
    if (!message) {
      throw new Error('message not found');
    }

    const channel = db.channels.find((channel) => channel.id == message.channelId);
    if (!channel) {
      throw new Error('channel not found');
    }

    message.text = data.text;
    channel.joinUsers.forEach((userId) => {
      if (user.id === userId) return;
      publishNotification(pubsub, userId, { mutation: MutationType.Updated, data: message });
    });

    return message;
  },
  deleteMessage(parent, { id }, { db, pubsub, user }) {
    const dataIdx = db.messages.findIndex((mes) => mes.id === id);
    const message = db.messages[dataIdx];
    if (!message) {
      throw new Error('message not found');
    }

    const channel = db.channels.find((channel) => channel.id == message.channelId);
    if (!channel) {
      throw new Error('channel not found');
    }

    db.messages.splice(dataIdx, 1);
    channel.joinUsers.forEach((userId) => {
      if (user.id === userId) return;
      publishNotification(pubsub, userId, { mutation: MutationType.Deleted, data: message });
    });

    return message;
  },
  createChannel(parent, { data }, { db, user }) {
    const channel: Channel = {
      ...data,
      joinUsers: [user.id],
      id: v4(),
      isDM: false,
      ownerId: user.id,
    };
    db.channels.push(channel);

    return channel;
  },
  updateChannel(parent, { data }, { db, pubsub, user }) {
    const channel = db.channels.find((channel) => channel.id === data.id);
    if (!channel) {
      throw new Error('channel not found');
    }

    channel.name = data.name;
    channel.description = data.description;
    channel.joinUsers.forEach((userId) => {
      if (user.id === userId) return;
      publishNotification(pubsub, userId, { mutation: MutationType.Updated, data: channel });
    });

    return channel;
  },
  inviteChannel(parent, { data }, { db, pubsub, user }) {
    const channel = db.channels.find((channel) => channel.id === data.id);
    if (!channel) {
      throw new Error('channel not found');
    }

    channel.joinUsers.push(data.userId);

    channel.joinUsers.forEach((userId) => {
      if (user.id === userId) return;
      publishNotification(pubsub, userId, { mutation: MutationType.Updated, data: channel });
    });

    return channel;
  },

  deleteChannel(parent, { id }, { db, pubsub, user }) {
    const dataIdx = db.channels.findIndex((channel) => channel.id === id);
    const channel = db.channels[dataIdx];
    if (!channel) {
      throw new Error('channel not found');
    }

    db.channels.splice(dataIdx, 1);
    channel.joinUsers.forEach((userId) => {
      if (user.id === userId) return;
      publishNotification(pubsub, userId, { mutation: MutationType.Deleted, data: channel });
    });

    return channel;
  },
};

export { Mutation };
