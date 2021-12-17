import { PubSub } from 'graphql-subscriptions';

type Message = {
  channelId: string;
  id: string;
  text: string;
  userId: string;
  date: Date;
  readUserIds: string[];
};

type Channel = {
  description?: string;
  id: string;
  isDM: boolean;
  joinUserIds: string[];
  name: string;
  ownerId: string;
};

type ChannelWithPersonalizedData = Channel;

type User = {
  id: string;
  name: string;
};

type ReadMessageUsers = {
  id: string;
  readUserIds: string[];
};

const messages: Message[] = [];
const channels: Channel[] = [];
const users: User[] = [];
const db = { messages, channels, users };

const createAllRequestSharedContext = () => ({ db, pubsub: new PubSub() });

type UserCtx = { user: { id: string } };
type Context = ReturnType<typeof createAllRequestSharedContext> & UserCtx;
type UnAuthorizedContext = ReturnType<typeof createAllRequestSharedContext> & Partial<UserCtx>;

export { createAllRequestSharedContext };
export type {
  Context,
  UnAuthorizedContext,
  Channel,
  Message,
  ChannelWithPersonalizedData,
  ReadMessageUsers,
};
