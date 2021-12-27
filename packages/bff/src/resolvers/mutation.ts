import { UnAuthorizedContext } from '@/context';
import { MutationType, Resolvers } from '@/resolvers/_generated';
import { isMessageRead } from '@/resolvers/libs/message';
import { publishNotification } from '@/resolvers/subscription';

const Mutation: Resolvers['Mutation'] = {
  createMessage(parent, { data }, { pubsub, user: currentUser, dataSources }) {
    const message = dataSources.message.create({
      date: new Date(),
      userId: currentUser.id,
      readUserIds: [],
      ...data,
    });

    dataSources.channel.getById(message.channelId).then((channel) => {
      channel.joinUserIds.forEach((joinUserId) => {
        const data = message;
        publishNotification(pubsub, joinUserId, 'ChangeMessageSubscriptionPayload', {
          changeNotification: { mutation: MutationType.Created, data },
        });
      });
    });

    return message;
  },
  async updateMessage(parent, { data }, { pubsub, dataSources }) {
    const message = await dataSources.message.update(data);

    dataSources.channel.getById(message.channelId).then((channel) => {
      channel.joinUserIds.forEach((joinUserId) => {
        const data = message;
        publishNotification(pubsub, joinUserId, 'ChangeMessageSubscriptionPayload', {
          changeNotification: { mutation: MutationType.Updated, data },
        });
      });
    });

    return message;
  },
  deleteMessage(parent, { id }, { pubsub, dataSources }) {
    const message = dataSources.message.delete(id);

    dataSources.channel.getById(message.channelId).then((channel) => {
      channel.joinUserIds.forEach((joinUserId) => {
        const data = message;
        publishNotification(pubsub, joinUserId, 'ChangeMessageSubscriptionPayload', {
          changeNotification: { mutation: MutationType.Deleted, data },
        });
      });
    });

    return message;
  },
  createChannel(parent, { data }, { user, pubsub, dataSources }) {
    const channel = dataSources.channel.create({
      name: data.name,
      description: data.description ?? null,
      joinUserIds: (data.joinUsers || []).concat(user.id),
      isDM: data.isDM,
      ownerId: user.id,
    });

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Created, data: channel },
      });
    });

    return channel;
  },
  async updateChannel(parent, { data }, { pubsub, dataSources }) {
    const channel = await dataSources.channel.update(data);

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Updated, data: channel },
      });
    });

    return channel;
  },
  async inviteChannel(parent, { data }, { pubsub, dataSources }) {
    const channel = await dataSources.channel.addUser(data.id, data.userId);

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Updated, data: channel },
      });
    });

    return channel;
  },
  deleteChannel(parent, { id }, { pubsub, dataSources }) {
    const channel = dataSources.channel.delete(id);

    channel.joinUserIds.forEach((joinUserId) => {
      publishNotification(pubsub, joinUserId, 'ChangeChannelSubscriptionPayload', {
        changeNotification: { mutation: MutationType.Deleted, data: channel },
      });
    });

    return channel;
  },
  signup(parent, { name }, { dataSources }: UnAuthorizedContext) {
    const user = dataSources.user.create({ name });

    const myDMChannel = dataSources.channel
      .getJoinedChannels(user.id)
      .find((ch) => ch.ownerId === user.id && ch.isDM);

    if (!myDMChannel) {
      dataSources.channel.create({
        name: user.name,
        description: '',
        isDM: true,
        ownerId: user.id,
        joinUserIds: [user.id],
      });
    }

    return user;
  },
  async readMessages(parent, { data }, { user: currentUser, pubsub, dataSources }) {
    const messages = await dataSources.message.getByIds(data.map((v) => v.id));
    const channels = await dataSources.channel.getByIds(messages.map((mes) => mes.channelId));

    const unReadMessages = messages.filter(
      (mess) => !isMessageRead(currentUser.id, mess.userId, mess.readUserIds)
    );

    unReadMessages.forEach((message) => message.readUserIds.push(currentUser.id));

    unReadMessages.forEach((mess) => {
      channels
        .find((ch) => ch.id === mess.channelId)
        ?.joinUserIds.forEach((joinUserId) => {
          const data = { id: mess.id, readUserIds: mess.readUserIds };
          publishNotification(pubsub, joinUserId, 'ChangeMessageReadStateSubscriptionPayload', {
            changeNotification: { mutation: MutationType.Updated, data },
          });
        });
    });

    return unReadMessages.map((message) => ({ id: message.id }));
  },
};

export { Mutation };
