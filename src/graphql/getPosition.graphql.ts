import gql from 'graphql-tag';

const getPosition = gql`
  query getPosition($id: String!, $first: Int, $skip: Int) {
    position(id: $id) {
      id
      createdAtTimestamp
      totalDeposits
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
      permissions {
        id
        operator
        permissions
      }
      current {
        id
        rate
        remainingSwaps
        remainingLiquidity
        withdrawn
        toWithdraw
      }
      history: actionsHistory(orderBy: createdAtTimestamp, orderDirection: asc, first: $first, skip: $skip) {
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

export default getPosition;
