import { Resolvers } from '@/resolvers/generated';
import { Query } from '@/resolvers/query';
import { Date } from '@/resolvers/scalers';

const resolvers: Resolvers = { Query, Date };

export { resolvers };
