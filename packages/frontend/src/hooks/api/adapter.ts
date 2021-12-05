import { UseQueryResponse } from 'urql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toApolloClientIFUseQuery = <T2 extends (args: any) => UseQueryResponse>(useQueryFn: T2) => {
  return function useQueryWrapper(
    options?: Omit<Parameters<T2>[0], 'requestPolicy'> & {
      fetchPolicy?: NonNullable<Parameters<T2>[0]>['requestPolicy'];
      skip?: NonNullable<Parameters<T2>[0]>['pause'];
    }
  ) {
    const [res, refetch] = useQueryFn(options ? swapOptKeys(options) : {});

    return {
      data: res.data as ReturnType<T2>[0]['data'],
      loading: res.fetching,
      error: res.error,
      refetch,
    };
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

export { toApolloClientIFUseQuery };
