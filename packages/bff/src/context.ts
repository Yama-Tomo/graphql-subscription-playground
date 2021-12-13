import { PubSub } from 'graphql-subscriptions';

type Message = {
  channelId: string;
  id: string;
  text: string;
  userId: string;
};
const messages: Message[] = [];

type Channel = {
  description?: string;
  id: string;
  isDM: boolean;
  joinUsers: string[];
  name: string;
  ownerId: string;
};
const channels: Channel[] = [];

type User = {
  id: string;
  name: string;
};
const users: User[] = [];
const db = { messages, channels, users };

const createAllRequestSharedContext = () => ({ db, pubsub: new PubSub() });

type UserCtx = { user: { id: string } };
type Context = ReturnType<typeof createAllRequestSharedContext> & UserCtx;
type UnAuthorizedContext = ReturnType<typeof createAllRequestSharedContext> & Partial<UserCtx>;

export { createAllRequestSharedContext };
export type { Context, UnAuthorizedContext };
