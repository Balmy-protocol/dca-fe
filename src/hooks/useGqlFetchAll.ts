import React from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { ApolloClient, DocumentNode, NormalizedCacheObject, QueryResult } from '@apollo/client';
import gqlFetchAll from 'common/utils/gqlFetchAll';
import useDCAGraphql from './useDCAGraphql';

function useGqlFetchAll<T>(
  client: ApolloClient<NormalizedCacheObject> | undefined,
  queryToRun: DocumentNode,
  variables: unknown,
  dataToSearch: string,
  skip = false
): QueryResult<T> | { data: undefined; loading: boolean; error?: string } {
  const [result, setResult] = React.useState<QueryResult<T> | { data: undefined; loading: boolean; error?: string }>({
    data: undefined,
    loading: false,
    error: undefined,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const prevParameters = usePrevious(variables);
  const defaultClient = useDCAGraphql();
  const clientToUse = client || defaultClient;

  React.useEffect(() => {
    async function callPromise() {
      try {
        const gqlResult = await gqlFetchAll<T>(clientToUse, queryToRun, variables, dataToSearch);
        setResult({ ...gqlResult, loading: false, error: undefined } as never);
      } catch (e) {
        setResult({ data: undefined, loading: false, error: e as string } as never);
        console.error(e);
      }
    }

    if (
      client &&
      !skip &&
      ((!result.data && !result.loading && !result.error) || !isEqual(prevParameters, variables))
    ) {
      setResult({ data: undefined, loading: true, error: undefined });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [client, queryToRun, variables, skip, result]);

  return result;
}

export default useGqlFetchAll;
