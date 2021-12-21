import { useCallback, useEffect, useState } from 'react';

import { useSearchUsersQuery } from '@/hooks/api';

const useSearchUsers = (delay = 300) => {
  const [searchVars, setSearchVars] = useState({ name: '' });
  const { name } = searchVars;
  const { data, refetch, error, loading } = useSearchUsersQuery({
    variables: searchVars,
    skip: true,
  });

  useEffect(() => {
    if (!name) {
      return;
    }

    const timeout = setTimeout(refetch, delay);
    return function cancelRequest() {
      clearTimeout(timeout);
    };
  }, [refetch, name, delay]);

  const search = useCallback((name: string) => {
    setSearchVars((current) => ({ ...current, name }));
  }, []);

  const reset = useCallback(() => search(''), [search]);

  return { data: name === '' ? undefined : data, error, loading, search, input: name, reset };
};

export { useSearchUsers };
