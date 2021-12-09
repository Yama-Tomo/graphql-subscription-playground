import { Message, Channel, User } from '@/resolvers';
import { PubSub } from 'graphql-subscriptions';

const messages: Message[] = [];
const channels: Channel[] = [];
const users: User[] = [];
const db = { messages, channels, users };

const createAllRequestSharedContext = () => ({ db, pubsub: new PubSub() });

type Context = ReturnType<typeof createAllRequestSharedContext> & { user: { id: string } };

export { createAllRequestSharedContext };
export type { Context };
