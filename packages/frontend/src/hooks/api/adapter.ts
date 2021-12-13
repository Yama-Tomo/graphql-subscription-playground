import { useCallback } from 'react';
import {
  OperationContext,
  OperationResult,
  UseMutationResponse,
  UseMutationState,
  UseQueryArgs,
  UseQueryResponse,
} from 'urql';

type UseCustomQueryArgs<T> = T extends Omit<UseQueryArgs, 'query'>
  ? Omit<T, 'requestPolicy' | 'pause'> & {
      fetchPolicy?: NonNullable<T>['requestPolicy'];
      skip?: NonNullable<T>['pause'];
    }
  : never;

const toApolloClientIFUseQuery = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CODEGEN_USE_QUERY_FN extends (args: any) => UseQueryResponse,
  OPTS_OPTIONAL extends boolean = false
>(
  useQueryFn: CODEGEN_USE_QUERY_FN,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts_optional?: OPTS_OPTIONAL
) => {
  return function useQueryWrapper(
    ...options: NonNullable<OPTS_OPTIONAL> extends true
      ? Partial<[UseCustomQueryArgs<Parameters<CODEGEN_USE_QUERY_FN>[0]>]>
      : [UseCustomQueryArgs<Parameters<CODEGEN_USE_QUERY_FN>[0]>]
  ) {
    const [res, refetch] = useQueryFn(options[0] ? swapOptKeys(options[0]) : {});

    return {
      data: res.data as ReturnType<CODEGEN_USE_QUERY_FN>[0]['data'],
      loading: res.fetching,
      error: res.error,
      refetch,
    };
  };
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

export { toApolloClientIFUseQuery, toApolloClientIFUseMutation };
