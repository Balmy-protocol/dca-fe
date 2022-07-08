/* eslint-disable */
import {
  ApolloClient,
  NormalizedCacheObject,
  ObservableQuery,
  OperationVariables,
  DocumentNode,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';

export interface GraphqlResults<T> {
  data: T | undefined;
  loading: boolean;
}

export default async function gqlFetchAll<T>(
  client: ApolloClient<NormalizedCacheObject>,
  queryToRun: DocumentNode,
  variables: any,
  dataToSearch: string,
  fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network',
  offset = 0,
  limit = 1000,
  query: ObservableQuery<any, OperationVariables> | null = null
): Promise<GraphqlResults<T>> {
  if (query) {
    const newResults = await query.fetchMore({
      variables: {
        first: limit,
        skip: offset,
      },
      updateQuery: (prevResults, options) => {
        let updatedQueryResults = cloneDeep(prevResults);

        const resultsToUpdate = get(options.fetchMoreResult, dataToSearch);
        const prevResultsToUpdate = get(updatedQueryResults, dataToSearch);

        set(updatedQueryResults, dataToSearch, [...prevResultsToUpdate, ...resultsToUpdate]);

        return updatedQueryResults;
      },
    });

    if (get(newResults.data, dataToSearch).length === limit) {
      return gqlFetchAll(client, queryToRun, variables, dataToSearch, fetchPolicy, offset + limit, limit, query);
    }

    return query.result();
  }

  const newQuery = client.watchQuery({
    query: queryToRun,
    fetchPolicy,
    variables: {
      ...variables,
      first: limit,
      skip: 0,
    },
  });

  const results = await newQuery.result();

  if (get(results.data, dataToSearch).length === limit) {
    return gqlFetchAll(client, queryToRun, variables, dataToSearch, fetchPolicy, offset + limit, limit, newQuery);
  }

  return results;
}

/* eslint-enable */
