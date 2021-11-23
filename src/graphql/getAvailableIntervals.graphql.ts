import gql from 'graphql-tag';

const getAvailableIntervals = gql`
  query getAvailableIntervals {
    swapIntervals {
      id
      interval
      active
    }
  }
`;

export default getAvailableIntervals;
