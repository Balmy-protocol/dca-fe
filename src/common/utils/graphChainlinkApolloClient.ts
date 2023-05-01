import { ApolloClient, InMemoryCache } from '@apollo/client';
import { CHAINLINK_GRAPHQL_URL } from '@constants';

const client = new ApolloClient({
  uri: CHAINLINK_GRAPHQL_URL[1],
  cache: new InMemoryCache(),
});

export default client;
