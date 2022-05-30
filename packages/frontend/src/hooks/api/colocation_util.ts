import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { filter } from 'graphql-anywhere';
import { useRef } from 'react';

import { AnyTypedDocNode } from './typed_document';

const typedFilter = <Data, Doc extends AnyTypedDocNode>(
  doc: Doc,
  data: Data
): FilterResult<Data, Doc> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return filter<any>(doc, data);
};

// prettier-ignore
type FilterResult<Data, Fragment extends AnyTypedDocNode> = Data extends Array<infer Element>
  ? FilterResult<Element, Fragment>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : Fragment extends TypedDocumentNode<infer R, any>
    ? Data extends R
      ? R
      : never
    : never;

type QueryData<D> = { data: D | undefined; loading: boolean; requestStartTime: number };
const useCombinedQuery = <T>(queryA: QueryData<T>, queryB: QueryData<T>) => {
  const prev = useRef<QueryData<T>['data']>(undefined);

  const loading = queryA.loading || queryB.loading;
  const isFetched = (query: QueryData<T>) => !query.loading && query.data != null;

  const newestQuery =
    queryA.requestStartTime < queryB.requestStartTime && isFetched(queryB) ? queryB : queryA;
  const result = { ...newestQuery, loading, data: loading ? prev.current : newestQuery.data };

  prev.current = result.data;

  return result;
};

export { typedFilter, useCombinedQuery };
export type { QueryData };
