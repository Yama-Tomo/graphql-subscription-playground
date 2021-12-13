import { Resolvers } from '@/resolvers/generated';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';

const Date: Resolvers['Date'] = DateResolver;
const DateTime: Resolvers['DateTime'] = DateTimeResolver;

export { Date, DateTime };
