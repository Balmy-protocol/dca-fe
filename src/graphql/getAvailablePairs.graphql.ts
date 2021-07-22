import gql from 'graphql-tag';

const getAvailablePairs = gql`
  query getAvailablePairs($first: Int, $skip: Int) {
    pairs(first: $first, skip: $skip) {
      id
      tokenA {
        id
      }
      tokenB {
        id
      }
      swaps {
        executedAtTimestamp
      }
      createdAtTimestamp
    }
  }
`;

export default getAvailablePairs;
