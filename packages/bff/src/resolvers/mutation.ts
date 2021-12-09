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
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeMessageSubscriptionPayload',
          mutation: MutationType.Created,
          data: message,
        },
      });
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
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeMessageSubscriptionPayload',
          mutation: MutationType.Updated,
          data: message,
        },
      });
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
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeMessageSubscriptionPayload',
          mutation: MutationType.Deleted,
          data: message,
        },
      });
    });

    return message;
  },
  createChannel(parent, { data }, { db, user, pubsub }) {
    const channel: Channel = {
      ...data,
      joinUsers: [user.id],
      id: v4(),
      isDM: false,
      ownerId: user.id,
    };
    db.channels.push(channel);
    channel.joinUsers.forEach((userId) => {
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Created,
          data: channel,
        },
      });
    });

    return channel;
  },
  updateChannel(parent, { data }, { db, pubsub, user }) {
    const channel = db.channels.find((channel) => channel.id === data.id);
    if (!channel) {
      throw new Error('channel not found');
    }

    if (channel.name !== data.name) {
      channel.name = data.name;
    }
    if (channel.description !== data.description) {
      channel.description = data.description;
    }
    channel.joinUsers.forEach((userId) => {
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Updated,
          data: channel,
        },
      });
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
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Updated,
          data: channel,
        },
      });
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
      publishNotification(pubsub, userId, {
        changeNotification: {
          __typename: 'ChangeChannelSubscriptionPayload',
          mutation: MutationType.Deleted,
          data: channel,
        },
      });
    });

    return channel;
  },
  signup(parent, { name }, { db }) {
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

export { Mutation };
