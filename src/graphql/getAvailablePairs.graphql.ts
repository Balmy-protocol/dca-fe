import gql from 'graphql-tag';

const getAvailablePairs = gql`
  query getAvailablePairs($first: Int, $skip: Int) {
    pairs(first: $first, skip: $skip) {
      id
      tokenA {
        address: id
        decimals
        name
        symbol
      }
      tokenB {
        address: id
        decimals
        name
        symbol
      }
      swaps(first: 1, orderBy: executedAtTimestamp, orderDirection: desc) {
        executedAtTimestamp
      }
      createdAtTimestamp
    }
  }
`;

export default getAvailablePairs;
