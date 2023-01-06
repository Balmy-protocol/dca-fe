import gql from 'graphql-tag';

const getPairPrices = gql`
  query getPairPrices($id: ID) {
    pair(id: $id) {
      id
      swaps(orderBy: executedAtTimestamp, orderDirection: desc, first: 1000) {
        id
        executedAtTimestamp
        ratioBToA
        ratioAToB
        pairSwapsIntervals {
          swapInterval {
            interval
          }
        }
      }
    }
  }
`;

export default getPairPrices;
