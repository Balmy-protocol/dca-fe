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
      activePositionsPerInterval
      positions(first: 1, orderBy: createdAtTimestamp, orderDirection: asc, where: { status: ACTIVE }) {
        id
        createdAtTimestamp
      }
      createdAtTimestamp
    }
  }
`;

export default getAvailablePairs;
