/* eslint-disable no-template-curly-in-string */

import { Chains, getAllChains } from '@mean-finance/sdk';
import { NetworkStruct, PositionVersions } from '@types';
import findKey from 'lodash/findKey';
import { Chain } from '@mean-finance/sdk/dist/types';
import { POSITION_VERSION_2, POSITION_VERSION_3, POSITION_VERSION_4, POSITION_VERSION_1 } from './common';

// type WithKey<K extends string | number | symbol> = {
//   [k in K]: boolean
// }
type AddressMap<K extends PositionVersions> = {
  [k in K]: Record<number, string>;
};
// type AddressMap<PositionVersions> = Record<PositionVersions, Record<number, string>>

export const RAW_NETWORKS: Record<string, NetworkStruct> = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    mainColor: '#3076F6',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [
      'https://mainnet.infura.io/v3/${INFURA_API_KEY}',
      'wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}',
      'https://api.mycryptoapi.com/eth',
      'https://cloudflare-eth.com',
    ],
  },
  ropsten: {
    chainId: 3,
    name: 'Ropsten',
    mainColor: '#3076F6',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: ['https://ropsten.infura.io/v3/${INFURA_API_KEY}', 'wss://ropsten.infura.io/ws/v3/${INFURA_API_KEY}'],
  },
  rinkeby: {
    chainId: 4,
    name: 'Rinkeby',
    mainColor: '#3076F6',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: ['https://rinkeby.infura.io/v3/${INFURA_API_KEY}', 'wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}'],
  },
  goerli: {
    chainId: 5,
    name: 'Goerli',
    mainColor: '#3076F6',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: ['https://goerli.infura.io/v3/${INFURA_API_KEY}', 'wss://goerli.infura.io/ws/v3/${INFURA_API_KEY}'],
  },
  kovan: {
    chainId: 42,
    name: 'Kovan',
    mainColor: '#3076F6',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: ['https://kovan.infura.io/v3/${INFURA_API_KEY}', 'wss://kovan.infura.io/ws/v3/${INFURA_API_KEY}'],
  },
  meanfinance: {
    chainId: 31337,
    name: 'Mean Finance',
    mainColor: '#3076F6',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: ['https://kovan.infura.io/v3/${INFURA_API_KEY}', 'wss://kovan.infura.io/ws/v3/${INFURA_API_KEY}'],
  },
  bsc: {
    chainId: 56,
    name: 'BNB',
    mainCurrency: 'BNB',
    mainColor: '#FCD535',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpc: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org',
      'https://bsc-dataseed4.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://bsc-dataseed4.ninicoin.io',
      'wss://bsc-ws-node.nariox.org',
    ],
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    mainCurrency: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    mainColor: '#6f41d8',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpc: [
      'https://polygon-rpc.com/',
      'https://rpc-mainnet.matic.network',
      'https://matic-mainnet.chainstacklabs.com',
      'https://rpc-mainnet.maticvigil.com',
      'https://rpc-mainnet.matic.quiknode.pro',
      'https://matic-mainnet-full-rpc.bwarelabs.com',
    ],
  },
  mumbai: {
    chainId: 80001,
    name: 'Mumbai',
    mainCurrency: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    mainColor: '#6f41d8',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpc: ['https://matic-mumbai.chainstacklabs.com'],
  },
  fantom: {
    chainId: 250,
    name: 'Fantom',
    mainCurrency: '250-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    rpc: ['https://rpcapi.fantom.network', 'https://fantom.blockpi.network/v1/rpc/public'],
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    mainCurrency: '43114-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpc: ['https://rpc.ankr.com/avalanche', 'https://avalanche.blockpi.network/v1/rpc/public'],
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    mainCurrency: 'ARBITRUM',
    mainColor: '#28a0f0',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'AETH',
      decimals: 18,
    },
    rpc: ['https://arb1.arbitrum.io/rpc'],
  },
  heco: {
    chainId: 128,
    name: 'Heco',
    mainCurrency: '128-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    nativeCurrency: {
      name: 'Huobi',
      symbol: 'HT',
      decimals: 18,
    },
    rpc: ['https://http-mainnet.hecochain.com'],
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    mainCurrency: 'OPTIMISM',
    mainColor: '#FF0615',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'OETH',
      decimals: 18,
    },
    rpc: ['https://mainnet.optimism.io/'],
  },
  optimismKovan: {
    chainId: 69,
    name: 'Optimism Kovan',
    mainCurrency: 'OPTIMISM',
    mainColor: '#FF0615',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'OETH',
      decimals: 18,
    },
    rpc: ['https://kovan.optimism.io/'],
  },
  optimismGoerli: {
    chainId: 420,
    name: 'Optimism Goerli',
    mainCurrency: 'OPTIMISM',
    mainColor: '#FF0615',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'OETH',
      decimals: 18,
    },
    rpc: ['https://goerli.optimism.io/'],
  },
  okex: {
    chainId: 66,
    name: 'OKC',
    mainCurrency: '',
    nativeCurrency: {
      name: 'OKT',
      symbol: 'OKT',
      decimals: 18,
    },
    rpc: ['https://exchainrpc.okex.org'],
  },
  harmony: {
    chainId: 1666600000,
    name: 'Harmony',
    mainCurrency: '1666600000-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    nativeCurrency: {
      name: 'Harmony',
      symbol: 'ONE',
      decimals: 18,
    },
    rpc: ['https://rpc.ankr.com/harmony', 'https://harmony-mainnet.chainstacklabs.com'],
  },
  xdai: {
    chainId: 100,
    name: 'Gnosis Chain',
    mainCurrency: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18,
    },
    rpc: ['https://rpc.gnosischain.com', 'https://rpc.ankr.com/gnosis'],
  },
  baseGoerli: {
    chainId: 84531,
    name: 'Base Goerli',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    mainColor: '#3076F6',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: ['https://goerli.base.org', 'https://base-goerli.public.blastapi.io'],
  },
};

const sdkNetworkToNetworkStruct = ({ chainId, name, publicRPCs, nativeCurrency, wToken, testnet }: Chain) => ({
  chainId,
  name,
  mainCurrency: `${chainId}-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
  nativeCurrency: {
    name: nativeCurrency.name,
    symbol: nativeCurrency.symbol,
    decimals: 18,
  },
  wToken,
  testnet,
  rpc: publicRPCs ? [...publicRPCs] : [],
});

export const NETWORKS: Record<string, NetworkStruct> = getAllChains()
  .filter((chain) => !chain.testnet || chain.ids.includes('base-goerli'))
  .reduce(
    (acc, sdkNetwork) => {
      const foundNetworkKey = findKey(RAW_NETWORKS, { chainId: sdkNetwork.chainId });

      return {
        ...acc,
        [foundNetworkKey || sdkNetwork.ids[0]]: {
          ...sdkNetworkToNetworkStruct(sdkNetwork),
          ...(foundNetworkKey ? RAW_NETWORKS[foundNetworkKey] : {}),
        },
      };
    },
    {
      ...RAW_NETWORKS,
    }
  );

export const TESTNETS = [
  NETWORKS.ropsten.chainId,
  NETWORKS.rinkeby.chainId,
  NETWORKS.goerli.chainId,
  NETWORKS.kovan.chainId,
  NETWORKS.optimismKovan.chainId,
  NETWORKS.optimismGoerli.chainId,
  NETWORKS.mumbai.chainId,
  NETWORKS.baseGoerli.chainId,
];

export const SUPPORTED_GAS_CALCULATOR_NETWORKS = [
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.mainnet.chainId,
  NETWORKS.bsc.chainId,
  NETWORKS.baseGoerli.chainId,
];
export const SUPPORTED_NETWORKS = [
  NETWORKS.mainnet.chainId,
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.bsc.chainId,
  NETWORKS.fantom.chainId,
  NETWORKS.avalanche.chainId,
  NETWORKS.heco.chainId,
  NETWORKS.xdai.chainId,
  NETWORKS.baseGoerli.chainId,
  Chains.POLYGON_ZKEVM.chainId,
];

export const SUPPORTED_NETWORKS_DCA = [
  NETWORKS.mainnet.chainId,
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.bsc.chainId,
  NETWORKS.baseGoerli.chainId,
];

// export const NETWORKS_FOR_MENU = [NETWORKS.optimism.chainId, NETWORKS.polygon.chainId];
export const NETWORKS_FOR_MENU = [
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.mainnet.chainId,
  NETWORKS.bsc.chainId,
  NETWORKS.baseGoerli.chainId,
];

export const DEFAULT_NETWORK_FOR_VERSION: Record<PositionVersions, NetworkStruct> = {
  [POSITION_VERSION_1]: NETWORKS.optimism,
  [POSITION_VERSION_2]: NETWORKS.optimism,
  [POSITION_VERSION_3]: NETWORKS.optimism,
  [POSITION_VERSION_4]: NETWORKS.mainnet,
};

export const DEFAULT_NETWORK_FOR_AGGREGATOR = NETWORKS.mainnet;

export const HUB_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {
    [NETWORKS.optimism.chainId]: '0x24F85583FAa9F8BD0B8Aa7B1D1f4f53F0F450038',
  },
  [POSITION_VERSION_2]: {
    [NETWORKS.kovan.chainId]: '0xA9DFAe8b08eCA017E4f33C0C580b7B5b97974567',
    [NETWORKS.optimismKovan.chainId]: '0xB1EDC6ea9011bCC5318e2b36954008357b59292F',
    [NETWORKS.optimism.chainId]: '0x230C63702D1B5034461ab2ca889a30E343D81349',
    [NETWORKS.mumbai.chainId]: '0x898D220C7cd30bf2DCacc9178ca3463e39cbB803',
    [NETWORKS.polygon.chainId]: '0x230C63702D1B5034461ab2ca889a30E343D81349',
  },
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: '0x059d306A25c4cE8D7437D25743a8B94520536BD5',
    [NETWORKS.optimismKovan.chainId]: '0x059d306A25c4cE8D7437D25743a8B94520536BD5',
    [NETWORKS.optimism.chainId]: '0x059d306A25c4cE8D7437D25743a8B94520536BD5',
    [NETWORKS.mumbai.chainId]: '0x059d306A25c4cE8D7437D25743a8B94520536BD5',
    [NETWORKS.polygon.chainId]: '0x059d306A25c4cE8D7437D25743a8B94520536BD5',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [NETWORKS.optimism.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [NETWORKS.arbitrum.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [NETWORKS.mainnet.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [NETWORKS.bsc.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [NETWORKS.baseGoerli.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
  },
};

export const COMPANION_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {
    [NETWORKS.optimism.chainId]: '0x1eD2957bA1F14c17E01424DD93a258dd2E04cAAC',
  },
  [POSITION_VERSION_2]: {
    [NETWORKS.kovan.chainId]: '0x50ed158bfed47ee565f31404c98a9f9ac0fa0cac',
    [NETWORKS.optimismKovan.chainId]: '0x749Fc5a81B2Fe1470e54E1bF452b71a4fb0e1BBf',
    [NETWORKS.optimism.chainId]: '0x749Fc5a81B2Fe1470e54E1bF452b71a4fb0e1BBf',
    [NETWORKS.mumbai.chainId]: '0x8847480C34C7DceEf73647c57766f28c3A07596B',
    [NETWORKS.polygon.chainId]: '0x9BA4B15f833c70a74e0fCc18f36d3C6157dcf687',
  },
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: '0xa3DB2c0D23720e8CDA0f4d80A53B94d20d02b061',
    [NETWORKS.optimismKovan.chainId]: '0xa3DB2c0D23720e8CDA0f4d80A53B94d20d02b061',
    [NETWORKS.optimism.chainId]: '0xa3DB2c0D23720e8CDA0f4d80A53B94d20d02b061',
    [NETWORKS.mumbai.chainId]: '0xa3DB2c0D23720e8CDA0f4d80A53B94d20d02b061',
    [NETWORKS.polygon.chainId]: '0xa3DB2c0D23720e8CDA0f4d80A53B94d20d02b061',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0x5ad2fED59E8DF461c6164c31B4267Efb7cBaF9C0',
    [NETWORKS.optimism.chainId]: '0x5ad2fED59E8DF461c6164c31B4267Efb7cBaF9C0',
    [NETWORKS.arbitrum.chainId]: '0x5ad2fED59E8DF461c6164c31B4267Efb7cBaF9C0',
    [NETWORKS.mainnet.chainId]: '0x5ad2fED59E8DF461c6164c31B4267Efb7cBaF9C0',
    [NETWORKS.bsc.chainId]: '0x5ad2fED59E8DF461c6164c31B4267Efb7cBaF9C0',
    [NETWORKS.baseGoerli.chainId]: '0x5ad2fED59E8DF461c6164c31B4267Efb7cBaF9C0',
  },
};

const OLD_VERSION_4_COMPANION_ADDRESS = '0x49c590F6a2dfB0f809E82B9e2BF788C0Dd1c31f9';
export const isCompanionAddress = (address: string, chainId: number) => {
  if (address.toLowerCase() === OLD_VERSION_4_COMPANION_ADDRESS.toLowerCase()) {
    return { isCompanion: true, isOldCompanion: true };
  }

  const versionObjects = Object.values(COMPANION_ADDRESS);

  return {
    isCompanion: versionObjects.some(
      (addresses) => addresses[chainId] && addresses[chainId].toLowerCase() === address.toLowerCase()
    ),
    isOldCompanion: false,
  };
};

export const TOKEN_DESCRIPTOR_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {},
  [POSITION_VERSION_2]: {},
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: '0xF3F361C1A84969dB21eB5Ed278BC987B7540923C',
    [NETWORKS.optimismKovan.chainId]: '0xF3F361C1A84969dB21eB5Ed278BC987B7540923C',
    [NETWORKS.optimism.chainId]: '0xF3F361C1A84969dB21eB5Ed278BC987B7540923C',
    [NETWORKS.mumbai.chainId]: '0xF3F361C1A84969dB21eB5Ed278BC987B7540923C',
    [NETWORKS.polygon.chainId]: '0xF3F361C1A84969dB21eB5Ed278BC987B7540923C',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0x4ACd4BC402bc8e6BA8aBDdcA639d8011ef0b8a4b',
    [NETWORKS.optimism.chainId]: '0x4ACd4BC402bc8e6BA8aBDdcA639d8011ef0b8a4b',
    [NETWORKS.arbitrum.chainId]: '0x4ACd4BC402bc8e6BA8aBDdcA639d8011ef0b8a4b',
    [NETWORKS.mainnet.chainId]: '0x4ACd4BC402bc8e6BA8aBDdcA639d8011ef0b8a4b',
    [NETWORKS.bsc.chainId]: '0x4ACd4BC402bc8e6BA8aBDdcA639d8011ef0b8a4b',
    [NETWORKS.baseGoerli.chainId]: '0x4ACd4BC402bc8e6BA8aBDdcA639d8011ef0b8a4b',
  },
};

export const PERMISSION_MANAGER_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {
    [NETWORKS.optimism.chainId]: '0x09AdE44D2E60fCa2270fF32Af5a189f40D29837b',
  },
  [POSITION_VERSION_2]: {
    [NETWORKS.kovan.chainId]: '0xbB3E83D7C2fD7c1D07bb2dCCe435728Da2e42463',
    [NETWORKS.optimismKovan.chainId]: '0xE0af2abE284771Bb73071f4f373Fb5DC1AFF1849',
    [NETWORKS.optimism.chainId]: '0xB4Edfb45446C6A207643Ea846BFA42021cE5ae11',
    [NETWORKS.mumbai.chainId]: '0x8CC0Df843610cefF7f4AFa01100B6abf6756Bdf2',
    [NETWORKS.polygon.chainId]: '0xB4Edfb45446C6A207643Ea846BFA42021cE5ae11',
  },
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: '0x6f54391fE0386D506b51d69Deeb8b04E0544E088',
    [NETWORKS.optimismKovan.chainId]: '0x6f54391fE0386D506b51d69Deeb8b04E0544E088',
    [NETWORKS.optimism.chainId]: '0x6f54391fE0386D506b51d69Deeb8b04E0544E088',
    [NETWORKS.mumbai.chainId]: '0x6f54391fE0386D506b51d69Deeb8b04E0544E088',
    [NETWORKS.polygon.chainId]: '0x6f54391fE0386D506b51d69Deeb8b04E0544E088',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [NETWORKS.optimism.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [NETWORKS.arbitrum.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [NETWORKS.mainnet.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [NETWORKS.bsc.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [NETWORKS.baseGoerli.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
  },
};

export const SMOL_DOMAIN_ADDRESS: Record<number, string> = {
  [NETWORKS.arbitrum.chainId]: '0xd64A2DF9d73CD1Cb50139A3eC3176070e00C67cA',
};

export const MULTICALL_DEFAULT_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

export const MULTICALL_ADDRESS: Record<number, string> = {
  [NETWORKS.optimism.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.polygon.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.arbitrum.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.mainnet.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.bsc.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.baseGoerli.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
};

export const MEAN_GRAPHQL_URL: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {
    [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-ys-beta-optimism',
  },
  [POSITION_VERSION_2]: {
    [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-ys-vulnerable-optimism',
    [NETWORKS.polygon.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-ys-vulnerable-polygon',
  },
  [POSITION_VERSION_3]: {
    [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-ys-optimism',
    [NETWORKS.polygon.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-ys-polygon',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-yf-polygon',
    [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-yf-optimism',
    [NETWORKS.arbitrum.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-yf-arbitrum',
    [NETWORKS.mainnet.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-yf-ethereum',
    [NETWORKS.bsc.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-yf-bnb',
    [NETWORKS.baseGoerli.chainId]: 'https://api.studio.thegraph.com/proxy/35446/dca-v2-yf-base-goerli/v0.0.1/',
  },
};

export const CHAINLINK_GRAPHQL_URL = {
  [NETWORKS.mainnet.chainId]: 'https://gql.graph.chain.link/subgraphs/name/ethereum-mainnet',
};

export const OE_GAS_ORACLE_ADDRESS = '0x420000000000000000000000000000000000000F';

export const EXPLORER_URL = getAllChains().reduce<Record<number, string>>(
  (acc, network) => ({
    ...acc,
    [network.chainId]: network.explorer,
  }),
  {
    [NETWORKS.mainnet.chainId]: 'https://etherscan.io/',
    [NETWORKS.ropsten.chainId]: 'https://ropsten.etherscan.io/',
    [NETWORKS.rinkeby.chainId]: 'https://rinkeby.etherscan.io/',
    [NETWORKS.goerli.chainId]: 'https://goerli.etherscan.io/',
    [NETWORKS.kovan.chainId]: 'https://kovan.etherscan.io/',
    [NETWORKS.meanfinance.chainId]: 'https://etherscan.io/',
    [NETWORKS.bsc.chainId]: 'https://bscscan.com',
    [NETWORKS.polygon.chainId]: 'https://polygonscan.com/',
    [NETWORKS.mumbai.chainId]: 'https://mumbai.polygonscan.com/',
    [NETWORKS.fantom.chainId]: 'https://ftmscan.com/',
    [NETWORKS.avalanche.chainId]: 'https://cchain.explorer.avax.network/',
    [NETWORKS.arbitrum.chainId]: 'https://arbiscan.io/',
    [NETWORKS.heco.chainId]: 'https://scan.hecochain.com/',
    [NETWORKS.optimism.chainId]: 'https://optimistic.etherscan.io/',
    [NETWORKS.optimismKovan.chainId]: 'https://kovan-optimistic.etherscan.io/',
    [NETWORKS.optimismGoerli.chainId]: 'https://goerli-optimistic.etherscan.io/',
    [NETWORKS.okex.chainId]: 'https://www.oklink.com/okexchain/',
    [NETWORKS.harmony.chainId]: 'https://explorer.harmony.one/#/',
    [NETWORKS.xdai.chainId]: 'https://blockscout.com/xdai/mainnet/',
    [NETWORKS.baseGoerli.chainId]: 'https://goerli.basescan.org/',
    [Chains.POLYGON_ZKEVM.chainId]: 'https://zkevm.polygonscan.com/',
  }
);

export const DEFILLAMA_IDS = {
  [NETWORKS.mainnet.chainId]: 'ethereum',
  [NETWORKS.arbitrum.chainId]: 'arbitrum',
  [NETWORKS.polygon.chainId]: 'polygon',
  [NETWORKS.optimism.chainId]: 'optimism',
  [NETWORKS.mumbai.chainId]: 'mumbai',
  [NETWORKS.moonbeam.chainId]: 'moonbeam',
  [NETWORKS.xdai.chainId]: 'gnosis',
  [NETWORKS.baseGoerli.chainId]: 'base-goerli',
  [Chains.ETHEREUM.chainId]: 'ethereum',
  [Chains.BNB_CHAIN.chainId]: 'bsc',
  [Chains.POLYGON.chainId]: 'polygon',
  [Chains.AVALANCHE.chainId]: 'avax',
  [Chains.FANTOM.chainId]: 'fantom',
  [Chains.GNOSIS.chainId]: 'xdai',
  [Chains.HECO.chainId]: 'heco',
  [Chains.ARBITRUM.chainId]: 'arbitrum',
  [Chains.OPTIMISM.chainId]: 'optimism',
  [Chains.CELO.chainId]: 'celo',
  [Chains.CRONOS.chainId]: 'cronos',
  [Chains.BOBA.chainId]: 'boba',
  [Chains.MOONRIVER.chainId]: 'moonriver',
  [Chains.OKC.chainId]: 'okexchain',
  [Chains.ONTOLOGY.chainId]: 'ontology',
  [Chains.KLAYTN.chainId]: 'klaytn',
  [Chains.AURORA.chainId]: 'aurora',
  [Chains.HARMONY_SHARD_0.chainId]: 'harmony',
  [Chains.MOONBEAM.chainId]: 'moonbeam',
  [Chains.VELAS.chainId]: 'velas',
  [Chains.POLYGON_ZKEVM.chainId]: 'polygon-zkevm',
};

export const TOKEN_LISTS = {
  'tokens.1inch.eth': {
    name: '1inch',
    homepage: '',
  },
  'https://www.gemini.com/uniswap/manifest.json': {
    name: 'Gemini Token List',
    homepage: 'https://www.gemini.com/',
  },
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org': {
    name: 'Uniswap Default List',
    homepage: '',
  },
  'https://tokens.coingecko.com/uniswap/all.json': {
    name: 'CoinGecko',
    homepage: '',
  },
};

export const STABLE_COINS = ['DAI', 'USDT', 'USDC', 'BUSD', 'UST', 'jEUR', 'jGBP', 'jCHF'];

export const MEAN_API_URL = 'https://api.mean.finance';

export const MEAN_PROXY_PANEL_URL = 'https://mean-finance-mixpanel-proxy.herokuapp.com';

export const SIGN_VERSION: Record<PositionVersions, string> = {
  [POSITION_VERSION_1]: '1',
  [POSITION_VERSION_2]: '1',
  [POSITION_VERSION_3]: '1',
  [POSITION_VERSION_4]: '2',
};

export const DEFILLAMA_PROTOCOL_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const BLOWFISH_ENABLED_CHAINS = [
  NETWORKS.mainnet.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.bsc.chainId,
  NETWORKS.optimism.chainId,
];

export const ZRX_API_ADDRESS: Record<number, string> = {
  [NETWORKS.mainnet.chainId]: 'https://api.0x.org',
  [NETWORKS.optimism.chainId]: 'https://optimism.api.0x.org',
  [NETWORKS.polygon.chainId]: 'https://polygon.api.0x.org',
  [NETWORKS.bsc.chainId]: 'https://bsc.api.0x.org',
  [NETWORKS.fantom.chainId]: 'https://fantom.api.0x.org',
  [NETWORKS.arbitrum.chainId]: 'https://arbitrum.api.0x.org',
};

export const REMOVED_AGG_CHAINS = [58];

export const getGhTokenListLogoUrl = (chainId: number, address: string) =>
  `https://raw.githubusercontent.com/Mean-Finance/token-list/main/assets/chains/${chainId}/${address.toLowerCase()}.svg`;

// Unsupported wagmi OOTB chains
// fuse: 122,
// heco: 128,
// velas: 106,
// oasis: 42262,

export const UNSUPPORTED_WAGMI_CHAIN = [122, 128, 106, 42262];
/* eslint-enable */
