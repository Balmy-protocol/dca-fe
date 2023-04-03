import gql from 'graphql-tag';

const getTokens = gql`
  query getTokens($first: Int, $lastId: String, $subgraphError: String) {
    tokens(first: $first, where: { id_gt: $lastId }, subgraphError: $subgraphError) {
      address: id
      name
      symbol
      decimals
      type
      underlyingTokens {
        address: id
        decimals
        name
        symbol
        type
      }
    }
  }
`;

export default getTokens;
