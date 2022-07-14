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
      totalDeposits
      totalSwaps
      totalSwapped
      totalWithdrawn
      executedSwaps
      user
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
        nextSwapAvailableAt
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
      current {
        id
        rate
        remainingSwaps
        remainingLiquidity
        idleSwapped
      }
    }
  }
`;

export default getCurrentPositions;
