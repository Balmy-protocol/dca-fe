import gql from 'graphql-tag';

const getCurrentPositions = gql`
  query getCurrentPositions($address: String!, $first: Int, $skip: Int, $status: String) {
    positions(where: { user: $address, status: $status }, first: $first, skip: $skip) {
      id
      createdAtTimestamp
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
        swapped
        withdrawn
        remainingLiquidity
      }
    }
  }
`;

export default getCurrentPositions;
