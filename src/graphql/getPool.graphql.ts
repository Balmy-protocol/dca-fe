import gql from 'graphql-tag';

const getPool = gql`
  query getPool($tokenA: String!, $tokenB: String!, $from: Int) {
    pools(where: { token0: $tokenA, token1: $tokenB, liquidity_gt: 0 }) {
      id
      poolHourData(where: { periodStartUnix_gte: $from }, orderBy: periodStartUnix, orderDirection: desc, first: 1000) {
        id
        token0Price
        date: periodStartUnix
        token1Price
      }
    }
  }
`;

export default getPool;
