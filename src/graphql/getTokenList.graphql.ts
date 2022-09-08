import gql from 'graphql-tag';

const getTokenList = gql`
  query getTokenList($first: Int, $skip: Int) {
    tokens(where: { allowed: true }, first: $first, skip: $skip) {
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
