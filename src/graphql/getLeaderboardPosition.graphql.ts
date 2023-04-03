import gql from 'graphql-tag';

const getLeaderboardPositions = gql`
  query getLeaderboardPositions($first: Int, $lastId: String, $subgraphError: String) {
    positions(first: $first, where: { id_gt: $lastId }, subgraphError: $subgraphError) {
      id
      createdAtTimestamp
      totalDeposited
      totalSwaps
      totalSwapped
      totalWithdrawn
      user
      terminatedAtTimestamp
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
      }
      status
      swapInterval {
        id
        interval
      }
      permissions {
        id
        operator
        permissions
      }
      rate
      remainingSwaps
      remainingLiquidity
      withdrawn
      toWithdraw
      history(orderBy: createdAtTimestamp, orderDirection: asc) {
        id
        action
        transaction {
          id
          hash
          timestamp
        }
        createdAtBlock
        createdAtTimestamp

        ... on PermissionsModifiedAction {
          permissions {
            operator
            id
            permissions
          }
        }

        ... on ModifiedAction {
          rate
          oldRate
          remainingSwaps
          oldRemainingSwaps
          rateUnderlying
          oldRateUnderlying
        }

        ... on WithdrewAction {
          withdrawn
          withdrawnUnderlying
        }

        ... on SwappedAction {
          pairSwap {
            id
            ratioUnderlyingAToB
            ratioUnderlyingBToA
            ratioUnderlyingAToBWithFee
            ratioUnderlyingBToAWithFee
          }
          swapped
          rate
        }

        ... on TransferedAction {
          from
          to
        }

        ... on CreatedAction {
          rate
          remainingSwaps
          permissions {
            operator
            id
            permissions
          }
        }
      }
    }
  }
`;

export default getLeaderboardPositions;
