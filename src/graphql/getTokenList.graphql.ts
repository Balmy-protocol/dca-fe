import gql from 'graphql-tag';

const getTokenList = gql`
  query getTokenList($first: Int, $id: String) {
    pools(first: $first, where: { id_gt: $id, liquidity_gt: 0 }, orderBy: id, orderDirection: asc) {
      id
      token0 {
        id
        decimals
        symbol
        name
      }
      token1 {
        id
        decimals
        symbol
        name
      }
    }
  }
`;

export default getTokenList;
