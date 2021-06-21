import gql from 'graphql-tag';

const getTokenPrices = gql`
  query getTokenPrices($pool: String!, $from: Int) {
    poolDayDatas(where: { pool: $pool, date_gte: $from }, orderBy: date, orderDirection: desc) {
      date
      token0Price
      token1Price
    }
  }
`;

export default getTokenPrices;
