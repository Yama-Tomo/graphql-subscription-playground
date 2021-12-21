import { DateResolver, DateTimeResolver } from 'graphql-scalars';

import { Resolvers } from '@/resolvers/generated';

const Date: Resolvers['Date'] = DateResolver;
const DateTime: Resolvers['DateTime'] = DateTimeResolver;

export { Date, DateTime };
