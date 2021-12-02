import { Resolvers } from '@/resolvers/generated';
import { DateResolver } from 'graphql-scalars';

const Date: Resolvers['Date'] = DateResolver;

export { Date };
