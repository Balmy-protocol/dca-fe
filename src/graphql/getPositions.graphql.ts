import gql from 'graphql-tag';

const getCurrentPositions = gql`
  query getCurrentPositions($address: String!, $first: Int, $skip: Int, $status: [String]) {
    positions(
      orderDirection: desc
      orderBy: createdAtTimestamp
      where: { user: $address, status_in: $status }
      first: $first
      skip: $skip
    ) {
      id
      createdAtTimestamp
      totalDeposited
      totalSwaps
      totalSwapped
      totalWithdrawn
      totalExecutedSwaps
      user
      from {
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
      to {
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
      pair {
        id
        activePositionsPerInterval
        swaps(orderBy: executedAtTimestamp, orderDirection: desc, first: 1) {
          id
          executedAtTimestamp
        }
      }
      status
      swapInterval {
        id
        interval
      }
      rate
      depositedRateUnderlying
      accumSwappedUnderlying
      remainingSwaps
      remainingLiquidity
      withdrawn
      toWithdraw
    }
  }
`;

export default getCurrentPositions;
