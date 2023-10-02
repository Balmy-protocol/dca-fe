import { gql } from 'graphql-tag';

const getTokenList = gql`
  query getTokenList($first: Int, $lastId: String, $subgraphError: String) {
    tokens(where: { allowed: true, id_gt: $lastId }, first: $first, subgraphError: $subgraphError) {
      address: id
      allowed
      decimals
      name
      symbol
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

export default getTokenList;
