import gql from 'graphql-tag';

const getTokenPrices = gql`
  query getTokenPrices($pool: String!, $from: Int, $subgraphError: String) {
    poolDayDatas(
      where: { pool: $pool, date_gte: $from }
      orderBy: date
      orderDirection: desc
      subgraphError: $subgraphError
    ) {
      date
      token0Price
      token1Price
    }
  }
`;

export default getTokenPrices;
