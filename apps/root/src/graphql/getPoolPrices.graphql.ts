import { gql } from 'graphql-tag';

const getPoolPrices = gql`
  query getPoolPrices($tokenA: String!, $tokenB: String!, $from: Int, $subgraphError: String) {
    pools(where: { token0: $tokenA, token1: $tokenB, liquidity_gt: 0 }, subgraphError: $subgraphError) {
      id
      poolHourData(
        where: { periodStartUnix_gte: $from }
        orderBy: periodStartUnix
        orderDirection: desc
        first: 1000
        subgraphError: $subgraphError
      ) {
        id
        token0Price
        date: periodStartUnix
        token1Price
      }
    }
  }
`;

export default getPoolPrices;
