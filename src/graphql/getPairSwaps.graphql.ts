import gql from 'graphql-tag';

const getPairSwaps = gql`
  query getPairSwaps($id: ID) {
    pair(id: $id) {
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
      createdAtTimestamp
      nextSwapAvailableAt
      swaps(orderBy: executedAtTimestamp, orderDirection: desc, first: 1) {
        id
        executedAtTimestamp
        executedAtBlock
        ratioPerUnitBToAWithFee
        ratioPerUnitAToBWithFee
        transaction {
          id
          hash
          index
          from
          timestamp
        }
        pairSwapsIntervals {
          id
          swapInterval {
            interval
            id
          }
        }
      }
    }
  }
`;

export default getPairSwaps;
