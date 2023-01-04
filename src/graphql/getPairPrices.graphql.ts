import gql from 'graphql-tag';

const getPairPrices = gql`
  query getPairPrices($id: ID, $minInterval: ID) {
    pair(id: $id) {
      id
      swaps(
        orderBy: executedAtTimestamp
        orderDirection: desc
        where: { pairSwapsIntervals_: { swapInterval_gte: $minInterval } }
      ) {
        id
        executedAtTimestamp
        ratioUnderlyingAToB
        ratioUnderlyingBToA
      }
    }
  }
`;

export default getPairPrices;
