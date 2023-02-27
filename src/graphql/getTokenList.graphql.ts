import gql from 'graphql-tag';

const getTokenList = gql`
  query getTokenList($first: Int, $lastId: String) {
    tokens(where: { allowed: true, id_gt: $lastId }, first: $first) {
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
