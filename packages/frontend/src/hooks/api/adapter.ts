import {
  OperationContext,
  OperationResult,
  UseMutationResponse,
  UseMutationState,
  UseQueryResponse,
} from 'urql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toApolloClientIFUseQuery = <T extends (args: any) => UseQueryResponse>(useQueryFn: T) => {
  return function useQueryWrapper(
    options?: Omit<Parameters<T>[0], 'requestPolicy'> & {
      fetchPolicy?: NonNullable<Parameters<T>[0]>['requestPolicy'];
      skip?: NonNullable<Parameters<T>[0]>['pause'];
    }
  ) {
    const [res, refetch] = useQueryFn(options ? swapOptKeys(options) : {});

    return {
      data: res.data as ReturnType<T>[0]['data'],
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

    const wrappedExecute: WrappedExecute = ({ variables, ...context }) =>
      execute(variables, context);

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
