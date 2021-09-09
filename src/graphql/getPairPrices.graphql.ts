import gql from 'graphql-tag';

const getPairPrices = gql`
  query getPairPrices($id: ID) {
    pair(id: $id) {
      id
      swaps(orderBy: executedAtTimestamp, orderDirection: desc) {
        id
        executedAtTimestamp
        ratePerUnitBToA
        ratePerUnitAToB
      }
    }
  }
`;

export default getPairPrices;
