import gql from 'graphql-tag';

const getAvailableIntervals = gql`
  query getAvailableIntervals($subgraphError: String) {
    swapIntervals(where: { active: true }, subgraphError: $subgraphError) {
      id
      interval
      active
    }
  }
`;

export default getAvailableIntervals;
