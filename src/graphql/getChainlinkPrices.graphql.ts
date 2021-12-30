import gql from 'graphql-tag';

const getChainlinkPrices = gql`
  query FeedSubscription($contractAddress: ID!, $from: Int!) {
    feed(id: $contractAddress) {
      id
      version
      oracles {
        id
      }
      requiredSubmissions
      rounds(
        first: 1000
        where: { value_not: null, unixTimestamp_gt: $from }
        orderBy: unixTimestamp
        orderDirection: desc
      ) {
        id
        value
        unixTimestamp
      }
      latestRound: rounds(
        where: { value_not: null, unixTimestamp_gt: $from }
        first: 1
        orderBy: unixTimestamp
        orderDirection: desc
      ) {
        id
        value
        unixTimestamp
        submissions {
          id
          oracle {
            id
            node {
              id
            }
          }
          gasPrice
          unixTimestamp
          value
          transmitter
        }
      }
    }
  }
`;

export default getChainlinkPrices;
