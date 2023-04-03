import gql from 'graphql-tag';

const getAvailablePairs = gql`
  query getAvailablePairs($first: Int, $lastId: String, $subgraphError: String) {
    pairs(first: $first, where: { id_gt: $lastId }, subgraphError: $subgraphError) {
      id
      tokenA {
        address: id
        decimals
        name
        symbol
        type
        underlyingTokens {
          address: id
          decimals
          name
          symbol
          type
        }
      }
      tokenB {
        address: id
        decimals
        name
        symbol
        type
        underlyingTokens {
          address: id
          decimals
          name
          symbol
          type
        }
      }
      swaps(first: 1, orderBy: executedAtTimestamp, orderDirection: desc, subgraphError: $subgraphError) {
        executedAtTimestamp
      }
      activePositionsPerInterval
      createdAtTimestamp
      lastSwappedAt
      oldestActivePositionCreatedAt
    }
  }
`;

export default getAvailablePairs;
