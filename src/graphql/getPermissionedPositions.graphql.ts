import gql from 'graphql-tag';

const getPermissionedPositions = gql`
  query getPermissionedPositions($address: String!) {
    positions(where: { permissions_: { operator: $address } }) {
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

export default getPermissionedPositions;
