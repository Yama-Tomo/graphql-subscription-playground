import { Message, Channel, User } from '@/resolvers';
import { PubSub } from 'graphql-subscriptions';

const messages: Message[] = [];
const channels: Channel[] = [];
const users: User[] = [];
const db = { messages, channels, users };

const createAllRequestSharedContext = () => ({ db, pubsub: new PubSub() });

type UserCtx = { user: { id: string } };
type Context = ReturnType<typeof createAllRequestSharedContext> & UserCtx;
type UnAuthorizedContext = ReturnType<typeof createAllRequestSharedContext> & Partial<UserCtx>;

export { createAllRequestSharedContext };
export type { Context, UnAuthorizedContext };
