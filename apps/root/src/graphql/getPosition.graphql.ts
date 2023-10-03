import { gql } from 'graphql-tag';

const getPosition = gql`
  query getPosition($id: String!, $first: Int, $lastId: String, $subgraphError: String) {
    position(id: $id, subgraphError: $subgraphError) {
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
      totalWithdrawnUnderlying
      remainingSwaps
      remainingLiquidity
      withdrawn
      toWithdraw

      history(
        orderBy: createdAtBlock
        orderDirection: asc
        first: $first
        where: { id_gt: $lastId }
        subgraphError: $subgraphError
      ) {
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

        ... on TerminatedAction {
          withdrawnSwapped
          withdrawnSwappedUnderlying
          withdrawnRemaining
          withdrawnRemainingUnderlying
        }

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
          withdrawnUnderlyingAccum
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
