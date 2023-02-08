import gql from 'graphql-tag';

const getCurrentPositions = gql`
  query getCurrentPositions($createdAtStart: String!, $createdAtStop: String!, $first: Int, $skip: Int) {
    positions(
      where: {
        from: "0xbd1fe73e1f12bd2bc237de9b626f056f21f86427"
        createdAtTimestamp_gte: $createdAtStart
        createdAtTimestamp_lte: $createdAtStop
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
