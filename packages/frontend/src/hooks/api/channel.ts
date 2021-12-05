import { useMyChannelsQuery as useURQLMyChannelsQuery } from '@/hooks/api/gql_generated';
import { toApolloClientIFUseQuery } from '@/hooks/api/adapter';

const useMyChannelsQuery = toApolloClientIFUseQuery(useURQLMyChannelsQuery);

export { useMyChannelsQuery };
