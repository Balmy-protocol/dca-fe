import gql from 'graphql-tag';

const getPairLiquidity = gql`
  query getPairLiquidity($tokenA: String!, $tokenB: String!, $from: Int) {
    pools(where: { token0: $tokenA, token1: $tokenB, liquidity_gt: 0 }) {
      id
      poolDayData(orderBy: date, orderDirection: desc, first: 7) {
        id
        volumeUSD
        date
      }
    }
  }
`;

export default getPairLiquidity;
