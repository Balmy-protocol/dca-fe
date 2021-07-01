import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.UNI_GRAPH,
  cache: new InMemoryCache(),
});

export default client;
