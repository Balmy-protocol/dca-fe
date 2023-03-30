import gql from 'graphql-tag';

const getCurrentPositions = gql`
  query getCurrentPositions($createdAtStart: String!, $createdAtStop: String!, $first: Int, $skip: Int) {
    positions(
      where: {
        from: "0xf2f77fe7b8e66571e0fca7104c4d670bf1c8d722"
        createdAtTimestamp_gte: $createdAtStart
        createdAtTimestamp_lte: $createdAtStop
        status_in: [ACTIVE, COMPLETED]
      }
      first: $first
      skip: $skip
    ) {
      id
      createdAtTimestamp
      totalDeposited
      totalSwaps
      totalSwapped
      totalWithdrawn
      totalExecutedSwaps
      user
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
      history(where: { action_in: [MODIFIED_RATE, MODIFIED_DURATION, MODIFIED_RATE_AND_DURATION] }, first: 1) {
        id
      }
      status
      swapInterval {
        id
        interval
      }
      rate
      depositedRateUnderlying
      totalSwappedUnderlyingAccum
      toWithdrawUnderlyingAccum
      remainingSwaps
      remainingLiquidity
      withdrawn
      toWithdraw
    }
  }
`;

export default getCurrentPositions;
