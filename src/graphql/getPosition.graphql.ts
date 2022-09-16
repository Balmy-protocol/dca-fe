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
      accumSwappedUnderlying
      accumToWithdrawUnderlying
      remainingSwaps
      remainingLiquidity
      withdrawn
      toWithdraw

      history(orderBy: createdAtTimestamp, orderDirection: asc, first: $first, skip: $skip) {
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
          depositedRateUnderlying
          oldDepositedRateUnderlying
        }

        ... on WithdrewAction {
          withdrawn
          withdrawnUnderlying
        }

        ... on SwappedAction {
          ratioPerUnitAToBWithFee
          ratioPerUnitBToAWithFee
          swapped
          rate
          rateUnderlying
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

export default getPosition;
