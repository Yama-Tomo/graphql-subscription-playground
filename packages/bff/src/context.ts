import { Message } from '@/resolvers';
import { PubSub } from 'graphql-subscriptions';

const messages: Message[] = [];
const db = { messages };

const createAllRequestSharedContext = () => ({ db, pubsub: new PubSub() });

type Context = ReturnType<typeof createAllRequestSharedContext> & { user: { id: string } };

export { createAllRequestSharedContext };
export type { Context };
