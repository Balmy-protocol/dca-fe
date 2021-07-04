import { ApolloClient, NormalizedCacheObject, ObservableQuery, OperationVariables, DocumentNode } from '@apollo/client';

export default async function gqlFetchAllById(
  client: ApolloClient<NormalizedCacheObject>,
  queryToRun: DocumentNode,
  variables: any,
  dataToSearch: string,
  offset = '',
  limit = 1000,
  query: ObservableQuery<any, OperationVariables> | null = null
): Promise<any> {
  if (query) {
    const fetchMoreResult = await query.fetchMore({
      variables: {
        ...variables,
        first: limit,
        id: offset,
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
      return await gqlFetchAllById(
        client,
        queryToRun,
        variables,
        dataToSearch,
        newResults.data[dataToSearch][newResults.data[dataToSearch].length - 1].id,
        limit,
        query
      );
    }

    return query.result();
  }

  const newQuery = client.watchQuery({
    query: queryToRun,
    variables: {
      ...variables,
      first: limit,
      id: '',
    },
  });

  const results = await newQuery.result();

  if (results.data[dataToSearch].length === limit) {
    return await gqlFetchAllById(
      client,
      queryToRun,
      variables,
      dataToSearch,
      results.data[dataToSearch][results.data[dataToSearch].length - 1].id,
      limit,
      newQuery
    );
  }

  return results;
}
