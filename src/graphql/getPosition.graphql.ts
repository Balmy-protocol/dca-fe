import gql from 'graphql-tag';

const getPosition = gql`
  query getPosition($id: String!, $first: Int, $skip: Int) {
    position(id: $id) {
      id
      createdAtTimestamp
      totalDeposited
      totalSwaps
      totalSwapped
      totalWithdrawn
      totalExecutedSwaps
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
      depositedRateUnderlying
      totalSwappedUnderlyingAccum
      toWithdrawUnderlyingAccum
      remainingSwaps
      remainingLiquidity
      withdrawn
      toWithdraw

      history(orderBy: createdAtBlock, orderDirection: asc, first: $first, skip: $skip) {
        id
        action
        transaction {
          id
          hash
          timestamp
          gasPrice
          l1GasPrice
          overhead
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
          rateUnderlying
          depositedRateUnderlying
          swappedUnderlying
        }

        ... on TransferedAction {
          from
          to
        }

        ... on CreatedAction {
          rate
          remainingSwaps
          rateUnderlying
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

export default getPosition;
