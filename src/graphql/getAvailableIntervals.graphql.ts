import gql from 'graphql-tag';

const getAvailableIntervals = gql`
  query getAvailableIntervals($subgraphError: Boolean) {
    swapIntervals(where: { active: true }, subgraphError: $subgraphError) {
      id
      interval
      active
    }
  }
`;

export default getAvailableIntervals;
