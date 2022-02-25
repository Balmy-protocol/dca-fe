import gql from 'graphql-tag';

const getLeaderboardPositions = gql`
  query getLeaderboardPositions($first: Int, $skip: Int) {
    positions(first: $first, skip: $skip) {
      id
      createdAtTimestamp
      totalDeposits
      totalSwaps
      totalSwapped
      totalWithdrawn
      startedAtSwap
      user
      terminatedAtTimestamp
      from {
        address: id
        decimals
        name
        symbol
      }
      to {
        address: id
        decimals
        name
        symbol
      }
      pair {
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
      }
      status
      swapInterval {
        id
        interval
      }
      current {
        id
        rate
        remainingSwaps
        remainingLiquidity
        withdrawn
        idleSwapped
        permissions {
          id
          operator
          permissions
        }
      }
      history: actionsHistory(orderBy: createdAtTimestamp, orderDirection: asc) {
        id
        action
        rate
        oldRate
        from
        to
        remainingSwaps
        oldRemainingSwaps
        swapped
        withdrawn
        createdAtBlock
        createdAtTimestamp
        ratePerUnitAToBWithFee
        ratePerUnitBToAWithFee
        permissions {
          operator
          id
          permissions
        }
        transaction {
          id
          hash
          timestamp
        }
      }
    }
  }
`;

export default getLeaderboardPositions;
