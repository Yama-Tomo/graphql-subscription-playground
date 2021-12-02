import { Resolvers, Message } from '@/resolvers/generated';
import { Query } from '@/resolvers/query';
import { Date } from '@/resolvers/scalers';

const resolvers: Resolvers = { Query, Date };

export { resolvers };
export type { Message };
