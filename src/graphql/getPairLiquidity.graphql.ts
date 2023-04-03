import gql from 'graphql-tag';

const getPairLiquidity = gql`
  query getPairLiquidity($tokenA: String!, $tokenB: String!, $from: Int, $subgraphError: String) {
    pools(where: { token0: $tokenA, token1: $tokenB, liquidity_gt: 0 }, subgraphError: $subgraphError) {
      id
      poolHourData(orderBy: periodStartUnix, orderDirection: desc, first: 24, subgraphError: $subgraphError) {
        id
        volumeUSD
        periodStartUnix
      }
    }
  }
`;

export default getPairLiquidity;
