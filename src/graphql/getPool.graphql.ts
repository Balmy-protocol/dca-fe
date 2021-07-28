import gql from 'graphql-tag';

const getPool = gql`
  query getPool($tokenA: String!, $tokenB: String!, $from: Int) {
    pools(where: { token0: $tokenA, token1: $tokenB, liquidity_gt: 0 }, first: 1) {
      id
      poolDayData(where: { date_gte: $from }, orderBy: date, orderDirection: desc) {
        id
        token0Price
        date
        token1Price
      }
    }
  }
`;

export default getPool;
