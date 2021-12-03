import { MutationType, ChangeMessageSubscriptionPayload, Resolvers } from '@/resolvers/generated';
import { v4 } from 'uuid';
import { PubSub } from 'graphql-subscriptions';
import { subscribeTopics } from '@/resolvers/subscription';

const publishChangeMessage = (pubsub: PubSub, payload: ChangeMessageSubscriptionPayload) => {
  pubsub.publish(subscribeTopics.changeMessage(payload.data.channelId), payload);
};

const Mutation: Resolvers['Mutation'] = {
  createMessage(parent, { data }, { db, pubsub }) {
    const message = { id: v4(), date: new Date(), ...data };

    db.messages.push(message);
    publishChangeMessage(pubsub, { mutation: MutationType.Created, data: message });

    return message;
  },
  updateMessage(parent, { data }, { db, pubsub }) {
    const message = db.messages.find((mes) => mes.id === data.id);
    if (!message) {
      throw new Error('data not found');
    }

    message.text = data.text;
    publishChangeMessage(pubsub, { mutation: MutationType.Updated, data: message });

    return message;
  },
  deleteMessage(parent, { id }, { db, pubsub }) {
    const dataIdx = db.messages.findIndex((mes) => mes.id === id);
    if (dataIdx === -1) {
      throw new Error('data not found');
    }

    const message = db.messages[dataIdx];
    db.messages.splice(dataIdx, 1);
    publishChangeMessage(pubsub, { mutation: MutationType.Deleted, data: message });

    return message;
  },
};

export { Mutation };
