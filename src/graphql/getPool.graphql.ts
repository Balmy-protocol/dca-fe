import gql from 'graphql-tag';

const getPool = gql`
  query getPool($tokenA: String!, $tokenB: String!) {
    pools(where: { token0: $tokenA, token1: $tokenB }) {
      id
    }
  }
`;

export default getPool;
