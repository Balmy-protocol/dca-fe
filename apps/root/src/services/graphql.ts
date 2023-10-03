import { ApolloClient, NormalizedCacheObject, InMemoryCache } from '@apollo/client';

export default class GraphqlService {
  client: ApolloClient<NormalizedCacheObject>;

  url: string;

  constructor(url?: string) {
    if (url) {
      this.url = url;
      this.client = new ApolloClient({
        uri: url,
        cache: new InMemoryCache(),
      });
    }
  }

  getClient() {
    return this.client;
  }

  setUrl(url: string) {
    this.url = url;
    this.client = new ApolloClient({
      uri: url,
      cache: new InMemoryCache(),
    });
  }
}
