import { PubSub } from 'graphql-subscriptions';
import { db, DataSources } from '@/data';

const createAllRequestSharedContext = () => ({ db, pubsub: new PubSub() });

type UserCtx = { user: { id: string } };
type Context = ReturnType<typeof createAllRequestSharedContext> &
  UserCtx & { dataSources: DataSources };

type UnAuthorizedContext = Omit<Context, 'user'> & Partial<UserCtx>;

export { createAllRequestSharedContext };
export type { Context, UnAuthorizedContext };
