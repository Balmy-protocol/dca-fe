import gql from 'graphql-tag';

const getCurrentPositions = gql`
  query getCurrentPositions($address: String!, $first: Int, $skip: Int, $status: String) {
    positions(
      orderDirection: desc
      orderBy: createdAtTimestamp
      where: { user: $address, status: $status }
      first: $first
      skip: $skip
    ) {
      id
      dcaId
      createdAtTimestamp
      totalDeposits
      totalSwaps
      totalSwapped
      totalWithdrawn
      from {
        id
      }
      to {
        id
      }
      pair {
        id
      }
      status
      swapInterval {
        id
        interval
        description
      }
      current {
        id
        rate
        remainingSwaps
        remainingLiquidity
      }
    }
  }
`;

export default getCurrentPositions;
