import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/benesjan/uniswap-v3-subgraph',
  cache: new InMemoryCache(),
});

export default client;
