import gql from 'graphql-tag';

const getPosition = gql`
  query getPosition($id: String!) {
    position(id: $id) {
      id
      createdAtTimestamp
      totalDeposits
      totalSwaps
      totalSwapped
      totalWithdrawn
      startedAtSwap
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
      }
      history(orderBy: createdAtTimestamp, orderDirection: asc) {
        id
        rate
        startingSwap
        lastSwap
        remainingSwaps
        swapped
        withdrawn
        remainingLiquidity
        createdAtBlock
        createdAtTimestamp
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
