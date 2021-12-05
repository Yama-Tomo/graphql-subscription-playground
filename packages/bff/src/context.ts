import { Message, Channel } from '@/resolvers';
import { PubSub } from 'graphql-subscriptions';

const messages: Message[] = [];
const channels: Channel[] = [];
const db = { messages, channels };

const createAllRequestSharedContext = () => ({ db, pubsub: new PubSub() });

type Context = ReturnType<typeof createAllRequestSharedContext> & { user: { id: string } };

export { createAllRequestSharedContext };
export type { Context };
