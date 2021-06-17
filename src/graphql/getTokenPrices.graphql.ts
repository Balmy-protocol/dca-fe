import gql from 'graphql-tag';

const getTokenPrices = gql`
  query getTokenPrices($pool: String!) {
    poolDayDatas(where: { pool: $pool }, orderBy: date, orderDirection: desc) {
      date
      token0Price
      token1Price
    }
  }
`;

export default getTokenPrices;
