import { gql } from 'graphql-tag';

const getCurrentPositions = gql`
  query getCurrentPositions(
    $address: String!
    $first: Int
    $lastId: String
    $status: [String]
    $subgraphError: String
  ) {
    positions(
      orderDirection: desc
      orderBy: createdAtTimestamp
      where: { id_gt: $lastId, user: $address, status_in: $status }
      first: $first
      subgraphError: $subgraphError
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
        swaps(orderBy: executedAtTimestamp, orderDirection: desc, first: 1, subgraphError: $subgraphError) {
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
      totalSwappedUnderlyingAccum
      toWithdrawUnderlyingAccum
      remainingSwaps
      remainingLiquidity
      withdrawn
      toWithdraw
      permissions {
        id
        operator
        permissions
      }
    }
  }
`;

export default getCurrentPositions;
