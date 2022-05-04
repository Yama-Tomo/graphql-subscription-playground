import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { filter } from 'graphql-anywhere';
import { useRef, useState } from 'react';
import { createRequest } from 'urql';

import { useQuery, UseQueryOptions, UseQueryReturn } from './adapter';
import { AnyTypedDocNode, TypedUseQueryResult } from './typed_document';

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

type RefetchableFragment<T extends AnyTypedDocNode> = (
  fragmentQuery: UseFragmentQueryWithFetchedTimeReturn<T>
) => UseFragmentQueryWithFetchedTimeReturn<T>[0];

type UseQueryWithFetchedTimeReturn<T extends AnyTypedDocNode> = [UseQueryReturn<T>, number];
const useQueryWithFetchedTime = <T extends AnyTypedDocNode>(
  query: T,
  opts?: UseQueryOptions<T>
): UseQueryWithFetchedTimeReturn<T> => {
  const ref = useRef<{ time: number; operationKey: number | undefined }>({
    time: -1,
    operationKey: undefined,
  });

  const result = useQuery(query, opts);
  const {
    data,
    loading,
    extra: { isValidating, operation },
  } = result;

  const isFetched =
    data != null && !loading && !isValidating && operation?.key !== ref.current.operationKey;
  if (isFetched) {
    ref.current.operationKey = operation?.key;
    ref.current.time = new Date().getTime();
  }

  return [result, ref.current.time];
};

type UseFragmentQueryWithFetchedTimeReturn<T extends AnyTypedDocNode> = [
  Omit<UseQueryReturn<T>, 'refetch'> & { fetch: (opts?: UseQueryOptions<T>) => void },
  number
];
const useFragmentQueryWithFetchedTime = <T extends AnyTypedDocNode>(
  query: T
): UseFragmentQueryWithFetchedTimeReturn<T> => {
  const [queryOpts, setQueryOpts] = useState<UseQueryOptions<T> | undefined>(undefined);
  const ref = useRef<{ time: number; operationKey: number | undefined; skip: boolean }>({
    time: -1,
    operationKey: undefined,
    skip: true,
  });
  const options = { ...(queryOpts || {}), skip: ref.current.skip } as UseQueryOptions<T>;
  const result = useQuery(query, options);
  const {
    data,
    loading,
    extra: { isValidating, operation },
  } = result;

  const isFetched =
    data != null && !loading && !isValidating && operation?.key !== ref.current.operationKey;
  if (isFetched) {
    ref.current.operationKey = operation?.key;
    ref.current.time = new Date().getTime();
  }

  const fetch = (opts?: UseQueryOptions<T>) => {
    ref.current.skip = false;

    const isExecutedSameQueryOnPrevious =
      opts &&
      ref.current.operationKey &&
      createRequest(query, opts.variables).key == ref.current.operationKey;
    if (isExecutedSameQueryOnPrevious) {
      // すでに同じオペレーションkeyで実行されたクエリはキャッシュから即返されるので operationKey を初期化してisFetched == trueの分岐に入るようにする
      // そうしないと time が更新されずキャッシュから返された値が採用されない
      ref.current.operationKey = undefined;
    }

    setQueryOpts(opts);
  };

  return [{ data, loading, extra: result.extra, fetch, error: result.error }, ref.current.time];
};

const combinedQueryResult = <
  PageQuery extends AnyTypedDocNode,
  FragmentQuery extends AnyTypedDocNode
>(
  pageQueryResult: UseQueryWithFetchedTimeReturn<PageQuery>,
  fragmentQueryResult: UseFragmentQueryWithFetchedTimeReturn<FragmentQuery>,
  filter: (data: TypedUseQueryResult<PageQuery>) => TypedUseQueryResult<FragmentQuery>
): UseFragmentQueryWithFetchedTimeReturn<FragmentQuery>[0] => {
  const [pageQuery, pageQueryFetchedTime] = pageQueryResult;
  const [fragmentQuery, fragmentQueryFetchedTime] = fragmentQueryResult;

  if (pageQueryFetchedTime < fragmentQueryFetchedTime) {
    const { extra, loading } = fragmentQuery;
    return {
      ...fragmentQuery,
      loading: loading || pageQuery.loading,
      extra: { ...extra, isValidating: extra.isValidating || pageQuery.extra.isValidating },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { refetch: _, loading, extra, data, ...rest } = pageQuery;
  return {
    ...rest,
    data: data ? filter(data) : undefined,
    fetch: fragmentQuery.fetch,
    loading: loading || fragmentQuery.loading,
    extra: { ...extra, isValidating: extra.isValidating || fragmentQuery.extra.isValidating },
  };
};

export {
  useQueryWithFetchedTime,
  useFragmentQueryWithFetchedTime,
  combinedQueryResult,
  typedFilter,
};
export type {
  UseQueryWithFetchedTimeReturn,
  UseFragmentQueryWithFetchedTimeReturn,
  RefetchableFragment,
};
