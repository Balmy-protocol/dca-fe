import gql from 'graphql-tag';

const getPairSwaps = gql`
  query getPairSwaps($id: ID, $subgraphError: String) {
    pair(id: $id, subgraphError: $subgraphError) {
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
      lastSwappedAt
      swaps(orderBy: executedAtTimestamp, orderDirection: desc, first: 1, subgraphError: $subgraphError) {
        id
        executedAtTimestamp
        executedAtBlock
        ratioUnderlyingAToB
        ratioUnderlyingBToA
        ratioUnderlyingAToBWithFee
        ratioUnderlyingBToAWithFee
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
