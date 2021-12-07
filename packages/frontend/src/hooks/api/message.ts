import { useLatestMessagesQuery as useURQLLatestMessagesQuery } from '@/hooks/api/gql_generated';
import { toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useLatestMessagesQuery = toApolloClientIFUseQuery(useURQLLatestMessagesQuery);

export { useLatestMessagesQuery };
