import gql from 'graphql-tag';

const getAvailableIntervals = gql`
  query getAvailableIntervals {
    swapIntervals(where: { active: true }) {
      id
      interval
      active
    }
  }
`;

export default getAvailableIntervals;
