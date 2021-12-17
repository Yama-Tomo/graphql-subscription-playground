import { GraphQLResolveInfo } from 'graphql';
import { MutationResolvers, QueryResolvers, Resolvers } from '@/resolvers/generated';
import { ObjectsResolvers } from '@/resolvers/objects';
import { Query } from '@/resolvers/query';
import { Date, DateTime } from '@/resolvers/scalers';
import { Mutation } from '@/resolvers/mutation';
import { Subscription } from '@/resolvers/subscription';
import { Context, UnAuthorizedContext } from '@/context';

// prettier-ignore
type UnAuthorizedCtxResolver =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (parent: any, args: any, context: UnAuthorizedContext, info: GraphQLResolveInfo) => any;
// prettier-ignore
type AuthorizedCtxResolver =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (parent: any, args: any, context: Context, info: GraphQLResolveInfo) => any;

const withAuthCheck = (authorizedCtxResolver: AuthorizedCtxResolver): UnAuthorizedCtxResolver => {
  return function authCheckResolver(...args: Parameters<UnAuthorizedCtxResolver>) {
    const parent = args[0];
    const arg = args[1];
    const { user, ...rest } = args[2];
    const info = args[3];

    if (!user) {
      throw new Error('unauthorized');
    }

    return authorizedCtxResolver(parent, arg, { ...rest, user }, info);
  };
};

const skipAuthCheck: Partial<{
  query: (keyof QueryResolvers)[];
  mutation: (keyof MutationResolvers)[];
}> = {
  mutation: ['signup'],
};

const resolvers: Resolvers = {
  ...ObjectsResolvers,
  Date,
  DateTime,
  Query: Object.entries(Query || {}).reduce((res, [name, val]) => {
    const resolver = typeof val === 'function' ? withAuthCheck(val) : val;
    return { ...res, [name]: resolver };
  }, {}),
  Mutation: Object.entries(Mutation || {}).reduce((res, [name, val]) => {
    const isSkipAuthCheck = !skipAuthCheck.mutation?.includes(name as keyof MutationResolvers);
    const resolver = isSkipAuthCheck && typeof val === 'function' ? withAuthCheck(val) : val;
    return { ...res, [name]: resolver };
  }, {}),
  Subscription: Object.entries(Subscription || {}).reduce((res, [name, val]) => {
    const obj =
      typeof val !== 'function' ? { ...val, subscribe: withAuthCheck(val.subscribe) } : val;
    return { ...res, [name]: obj };
  }, {}),
};

export { resolvers };
export type { Message, Channel, User } from '@/resolvers/generated';
