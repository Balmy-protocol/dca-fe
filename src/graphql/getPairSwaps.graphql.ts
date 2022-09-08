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
        type
        underlyingTokens {
          address: id
          decimals
          name
          symbol
          type
        }
      }
      tokenB {
        address: id
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
      createdAtTimestamp
      activePositionsPerInterval
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
