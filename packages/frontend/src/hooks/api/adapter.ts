import { useCallback, useMemo } from 'react';
import {
  OperationContext,
  OperationResult,
  UseMutationResponse,
  UseMutationState,
  useQuery as useURQLQuery,
  UseQueryArgs,
} from 'urql';

import { AnyTypedDocNode, TypedUseQueryArgs, TypedUseQueryResponse } from './typed_document';

type UseCustomQueryArgs<T> = T extends Omit<UseQueryArgs, 'query'>
  ? Omit<T, 'requestPolicy' | 'pause'> & {
      fetchPolicy?: NonNullable<T>['requestPolicy'];
      skip?: NonNullable<T>['pause'];
    }
  : never;

type UseQueryOptions<T extends AnyTypedDocNode> = UseCustomQueryArgs<
  Omit<TypedUseQueryArgs<T>, 'query'>
>;
type UseQueryReturn<T extends AnyTypedDocNode> = {
  data: TypedUseQueryResponse<T>[0]['data'];
  loading: TypedUseQueryResponse<T>[0]['fetching'];
  error: TypedUseQueryResponse<T>[0]['error'];
  extra: {
    isValidating: TypedUseQueryResponse<T>[0]['stale'];
  } & Pick<TypedUseQueryResponse<T>[0], 'extensions' | 'operation'>;
  refetch: TypedUseQueryResponse<T>[1];
};
const useQuery = <T extends AnyTypedDocNode>(
  query: T,
  opts?: UseQueryOptions<T>
): UseQueryReturn<T> => {
  const args = { query, ...(opts ? swapOptKeys(opts) : {}) };
  const [res, refetch] = useURQLQuery(args);
  return useMemo(() => {
    const { data, fetching: loading, error, ...extra } = res;
    const { stale, ...restExtra } = extra;

    return { data, loading, error, extra: { ...restExtra, isValidating: stale }, refetch };
  }, [res, refetch]);
};

type WrappedExecute<Data = unknown, Variables = unknown> = (
  executeArgs: { variables: Variables } & Partial<OperationContext>
) => Promise<OperationResult<Data, Variables>>;

type CustomResult<Data = unknown, Variables = unknown> = Pick<
  UseMutationState<Data, Variables>,
  'data' | 'error'
> & { loading: boolean };

type UseMutationWrapperReturnType<T> = T extends (
  options: unknown
) => UseMutationResponse<infer Data, infer Variables>
  ? [WrappedExecute<Data, Variables>, CustomResult]
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toApolloClientIFUseMutation = <T extends (args: unknown) => UseMutationResponse<any, any>>(
  useMutationFn: T
) => {
  return function useMutationWrapper(...options: Parameters<T>): UseMutationWrapperReturnType<T> {
    const [res, execute] = useMutationFn(options);

    const wrappedExecute: WrappedExecute = useCallback(
      ({ variables, ...context }) => execute(variables, context),
      [execute]
    );

    const result: CustomResult = {
      data: res.data,
      loading: res.fetching,
      error: res.error,
    };

    // この関数の戻り値がconditional typeでnever型に合わせることができないのでanyで強制的にキャスト
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [wrappedExecute, result] as any;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const swapOptKeys = <T extends Record<string, any>>(options: T) => {
  const swapKeys: Record<string, string> = {
    fetchPolicy: 'requestPolicy',
    skip: 'pause',
  };

  return Object.entries(options).reduce((result, [key, value]) => {
    const swapKey = swapKeys[key] || key;
    return { ...result, [swapKey]: value };
  }, {});
};

export { toApolloClientIFUseMutation, useQuery };
export type { UseQueryOptions, UseQueryReturn };
