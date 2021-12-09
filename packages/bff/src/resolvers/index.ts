import { Resolvers } from '@/resolvers/generated';
import { Query } from '@/resolvers/query';
import { Date } from '@/resolvers/scalers';
import { Mutation } from '@/resolvers/mutation';
import { Subscription } from '@/resolvers/subscription';

const resolvers: Resolvers = { Query, Date, Mutation, Subscription };

export { resolvers };
export type { Message, Channel, User } from '@/resolvers/generated';
