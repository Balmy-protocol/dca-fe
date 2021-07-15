import {
  ApolloClient,
  NormalizedCacheObject,
  ObservableQuery,
  OperationVariables,
  DocumentNode,
  WatchQueryFetchPolicy,
} from '@apollo/client';

export default async function gqlFetchAll(
  client: ApolloClient<NormalizedCacheObject>,
  queryToRun: DocumentNode,
  variables: any,
  dataToSearch: string,
  fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network',
  offset = 0,
  limit = 1000,
  query: ObservableQuery<any, OperationVariables> | null = null
): Promise<any> {
  if (query) {
    const fetchMoreResult = await query.fetchMore({
      variables: {
        first: limit,
        skip: offset,
      },

      updateQuery: (previousResult, { fetchMoreResult }) => {
        const newEntries = fetchMoreResult[dataToSearch];
        return {
          [dataToSearch]: [...previousResult[dataToSearch], ...newEntries],
        };
      },
    });

    const newResults = await query.result();

    if (newResults.data[dataToSearch].length === limit + offset) {
      return await gqlFetchAll(client, queryToRun, variables, dataToSearch, fetchPolicy, offset + limit, limit, query);
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

  if (results.data[dataToSearch].length === limit) {
    return await gqlFetchAll(client, queryToRun, variables, dataToSearch, fetchPolicy, offset + limit, limit, newQuery);
  }

  return results;
}
