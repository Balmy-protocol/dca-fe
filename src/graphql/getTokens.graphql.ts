import gql from 'graphql-tag';

const getTokens = gql`
  query getTokens($first: Int, $skip: Int) {
    tokens(first: $first, skip: $skip) {
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
