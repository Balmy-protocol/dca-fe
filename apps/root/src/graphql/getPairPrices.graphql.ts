import { gql } from 'graphql-tag';

const getPairPrices = gql`
  query getPairPrices($id: ID, $subgraphError: String) {
    pair(id: $id, subgraphError: $subgraphError) {
      id
      swaps(orderBy: executedAtTimestamp, orderDirection: desc, first: 1000, subgraphError: $subgraphError) {
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
