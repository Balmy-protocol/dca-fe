import {
  UNI_GRAPHQL_URL,
  NETWORKS,
  POSITION_VERSION_1,
  POSITION_VERSION_2,
  POSITION_VERSION_3,
  PositionVersions,
  POSITION_VERSION_4,
} from 'config';
import GraphqlService from 'services/graphql';

const clients: Record<PositionVersions, Record<number, GraphqlService>> = {
  [POSITION_VERSION_1]: {
    [NETWORKS.optimism.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_1][NETWORKS.optimism.chainId]),
  },
  [POSITION_VERSION_2]: {
    [NETWORKS.optimism.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_2][NETWORKS.optimism.chainId]),
    [NETWORKS.polygon.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_2][NETWORKS.polygon.chainId]),
    // [NETWORKS.optimismKovan.chainId]: new GraphqlService(
    //   MEAN_GRAPHQL_URL[POSITION_VERSION_2][NETWORKS.optimismKovan.chainId],
    // ),
  },
  [POSITION_VERSION_3]: {
    [NETWORKS.optimism.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_3][NETWORKS.optimism.chainId]),
    [NETWORKS.polygon.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_3][NETWORKS.polygon.chainId]),
    // [NETWORKS.optimismKovan.chainId]: new GraphqlService(
    //   MEAN_GRAPHQL_URL[POSITION_VERSION_3][NETWORKS.optimismKovan.chainId],
    // ),
    // [NETWORKS.mumbai.chainId]: new GraphqlService(
    //   MEAN_GRAPHQL_URL[POSITION_VERSION_3][NETWORKS.mumbai.chainId],
    // ),
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.optimism.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_4][NETWORKS.optimism.chainId]),
    [NETWORKS.polygon.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_4][NETWORKS.polygon.chainId]),
    [NETWORKS.arbitrum.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_4][NETWORKS.arbitrum.chainId]),
    [NETWORKS.mainnet.chainId]: new GraphqlService(UNI_GRAPHQL_URL[POSITION_VERSION_4][NETWORKS.mainnet.chainId]),
    // [NETWORKS.optimismKovan.chainId]: new GraphqlService(
    //   MEAN_GRAPHQL_URL[POSITION_VERSION_3][NETWORKS.optimismKovan.chainId],
    // ),
    // [NETWORKS.mumbai.chainId]: new GraphqlService(
    //   MEAN_GRAPHQL_URL[POSITION_VERSION_3][NETWORKS.mumbai.chainId],
    // ),
  },
};

export default clients;
