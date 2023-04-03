import gql from 'graphql-tag';

const getPool = gql`
  query getPool($tokenA: String!, $tokenB: String!, $subgraphError: String) {
    pools(where: { token0: $tokenA, token1: $tokenB, liquidity_gt: 0 }, first: 1, subgraphError: $subgraphError) {
      id
    }
  }
`;

export default getPool;
