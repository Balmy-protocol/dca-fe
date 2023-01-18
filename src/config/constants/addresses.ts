/* eslint-disable no-template-curly-in-string */

import { NetworkStruct } from 'types';
import {
  POSITION_VERSION_2,
  POSITION_VERSION_3,
  PositionVersions,
  POSITION_VERSION_4,
  POSITION_VERSION_1,
} from './common';

// type WithKey<K extends string | number | symbol> = {
//   [k in K]: boolean
// }
type AddressMap<K extends PositionVersions> = {
  [k in K]: Record<number, string>;
};
// type AddressMap<PositionVersions> = Record<PositionVersions, Record<number, string>>

export const NETWORKS: Record<string, NetworkStruct> = {
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
    name: 'BSC',
    mainCurrency: 'BNB',
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
    mainCurrency: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [],
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    mainCurrency: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [],
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
    mainCurrency: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [],
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
    name: 'OKEx',
    mainCurrency: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [],
  },
  harmony: {
    chainId: 1666600000,
    name: 'Harmony',
    mainCurrency: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [],
  },
  xdai: {
    chainId: 100,
    name: 'xDAI',
    mainCurrency: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [],
  },
};

export const TESTNETS = [
  NETWORKS.ropsten.chainId,
  NETWORKS.rinkeby.chainId,
  NETWORKS.goerli.chainId,
  NETWORKS.kovan.chainId,
  NETWORKS.optimismKovan.chainId,
  NETWORKS.optimismGoerli.chainId,
  NETWORKS.mumbai.chainId,
];

export const SUPPORTED_GAS_CALCULATOR_NETWORKS = [
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.mainnet.chainId,
];
export const SUPPORTED_NETWORKS = [
  NETWORKS.mainnet.chainId,
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
];

export const COINGECKO_IDS = {
  [NETWORKS.mainnet.chainId]: 'ethereum',
  [NETWORKS.ropsten.chainId]: 'ethereum',
  [NETWORKS.rinkeby.chainId]: 'ethereum',
  [NETWORKS.goerli.chainId]: 'ethereum',
  [NETWORKS.kovan.chainId]: 'ethereum',
  [NETWORKS.polygon.chainId]: 'polygon-pos',
  [NETWORKS.optimism.chainId]: 'optimistic-ethereum',
  [NETWORKS.optimismGoerli.chainId]: 'optimistic-ethereum',
  [NETWORKS.optimismKovan.chainId]: 'optimistic-ethereum',
  [NETWORKS.mumbai.chainId]: 'mumbai',
  [NETWORKS.arbitrum.chainId]: 'arbitrum-one',
};

// export const NETWORKS_FOR_MENU = [NETWORKS.optimism.chainId, NETWORKS.polygon.chainId];
export const NETWORKS_FOR_MENU = [
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.mainnet.chainId,
];

export const DEFAULT_NETWORK_FOR_VERSION: Record<PositionVersions, NetworkStruct> = {
  [POSITION_VERSION_1]: NETWORKS.optimism,
  [POSITION_VERSION_2]: NETWORKS.optimism,
  [POSITION_VERSION_3]: NETWORKS.optimism,
  [POSITION_VERSION_4]: NETWORKS.polygon,
};

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
  },
};

export const ORACLE_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {},
  [POSITION_VERSION_2]: {},
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: '0x4b0C54236B86f41C5e5A5dc5d020f832692ff06d',
    [NETWORKS.optimismKovan.chainId]: '0x4b0C54236B86f41C5e5A5dc5d020f832692ff06d',
    [NETWORKS.optimism.chainId]: '0x4b0C54236B86f41C5e5A5dc5d020f832692ff06d',
    [NETWORKS.mumbai.chainId]: '0x4b0C54236B86f41C5e5A5dc5d020f832692ff06d',
    [NETWORKS.polygon.chainId]: '0x4b0C54236B86f41C5e5A5dc5d020f832692ff06d',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0x9e1ca4Cd00ED059C5d34204DCe622549583545d9',
    [NETWORKS.optimism.chainId]: '0x9e1ca4Cd00ED059C5d34204DCe622549583545d9',
    [NETWORKS.arbitrum.chainId]: '0x9e1ca4Cd00ED059C5d34204DCe622549583545d9',
    [NETWORKS.mainnet.chainId]: '0x9e1ca4Cd00ED059C5d34204DCe622549583545d9',
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
    [NETWORKS.polygon.chainId]: '0x49c590F6a2dfB0f809E82B9e2BF788C0Dd1c31f9',
    [NETWORKS.optimism.chainId]: '0x49c590F6a2dfB0f809E82B9e2BF788C0Dd1c31f9',
    [NETWORKS.arbitrum.chainId]: '0x49c590F6a2dfB0f809E82B9e2BF788C0Dd1c31f9',
    [NETWORKS.mainnet.chainId]: '0x49c590F6a2dfB0f809E82B9e2BF788C0Dd1c31f9',
  },
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
  },
};

export const CHAINLINK_ORACLE_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {},
  [POSITION_VERSION_2]: {},
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: '0x86E8cB7Cd38F7dE6Ef7fb62A5D7cCEe350C40310',
    [NETWORKS.optimismKovan.chainId]: '0x86E8cB7Cd38F7dE6Ef7fb62A5D7cCEe350C40310',
    [NETWORKS.optimism.chainId]: '0x86E8cB7Cd38F7dE6Ef7fb62A5D7cCEe350C40310',
    [NETWORKS.mumbai.chainId]: '0x86E8cB7Cd38F7dE6Ef7fb62A5D7cCEe350C40310',
    [NETWORKS.polygon.chainId]: '0x86E8cB7Cd38F7dE6Ef7fb62A5D7cCEe350C40310',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0x5587d300d41E418B3F4DC7c273351748a116d78B',
    [NETWORKS.optimism.chainId]: '0x5587d300d41E418B3F4DC7c273351748a116d78B',
    [NETWORKS.arbitrum.chainId]: '0x5587d300d41E418B3F4DC7c273351748a116d78B',
    [NETWORKS.mainnet.chainId]: '0x5587d300d41E418B3F4DC7c273351748a116d78B',
  },
};

export const UNISWAP_ORACLE_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {},
  [POSITION_VERSION_2]: {},
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: '0x14AF365e0825B835C60867C985724e1DF11449ad',
    [NETWORKS.optimismKovan.chainId]: '0x14AF365e0825B835C60867C985724e1DF11449ad',
    [NETWORKS.optimism.chainId]: '0x14AF365e0825B835C60867C985724e1DF11449ad',
    [NETWORKS.mumbai.chainId]: '0x14AF365e0825B835C60867C985724e1DF11449ad',
    [NETWORKS.polygon.chainId]: '0x14AF365e0825B835C60867C985724e1DF11449ad',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0xD741623299413d02256aAC2101f8B30873fED1d2',
    [NETWORKS.optimism.chainId]: '0xD741623299413d02256aAC2101f8B30873fED1d2',
    [NETWORKS.arbitrum.chainId]: '0xD741623299413d02256aAC2101f8B30873fED1d2',
    [NETWORKS.mainnet.chainId]: '0xD741623299413d02256aAC2101f8B30873fED1d2',
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
  },
};

export const TRANSFORMER_REGISTRY_ADDRESS: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {},
  [POSITION_VERSION_2]: {},
  [POSITION_VERSION_3]: {},
  [POSITION_VERSION_4]: {
    [NETWORKS.polygon.chainId]: '0xC0136591Df365611B1452B5F8823dEF69Ff3A685',
    [NETWORKS.optimism.chainId]: '0xC0136591Df365611B1452B5F8823dEF69Ff3A685',
    [NETWORKS.arbitrum.chainId]: '0xC0136591Df365611B1452B5F8823dEF69Ff3A685',
    [NETWORKS.mainnet.chainId]: '0xC0136591Df365611B1452B5F8823dEF69Ff3A685',
  },
};

export const SMOL_DOMAIN_ADDRESS: Record<number, string> = {
  [NETWORKS.arbitrum.chainId]: '0xd64A2DF9d73CD1Cb50139A3eC3176070e00C67cA',
};

export const MULTICALL_ADDRESS: Record<number, string> = {
  [NETWORKS.optimism.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.polygon.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.arbitrum.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [NETWORKS.mainnet.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',
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
  },
};

export const UNI_GRAPHQL_URL: AddressMap<PositionVersions> = {
  [POSITION_VERSION_1]: {},
  [POSITION_VERSION_2]: {},
  [POSITION_VERSION_3]: {
    [NETWORKS.kovan.chainId]: 'https://api.thegraph.com/subgraphs/name/fibofinance/uniswap-v3-kovan',
    [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
    [NETWORKS.mumbai.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
    [NETWORKS.polygon.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
    [NETWORKS.arbitrum.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
  },
  [POSITION_VERSION_4]: {
    [NETWORKS.kovan.chainId]: 'https://api.thegraph.com/subgraphs/name/fibofinance/uniswap-v3-kovan',
    [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
    [NETWORKS.mumbai.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
    [NETWORKS.polygon.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
    [NETWORKS.arbitrum.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
    [NETWORKS.mainnet.chainId]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  },
};

export const CHAINLINK_GRAPHQL_URL = {
  [NETWORKS.mainnet.chainId]: 'https://gql.graph.chain.link/subgraphs/name/ethereum-mainnet',
};

export const OE_GAS_ORACLE_ADDRESS = '0x420000000000000000000000000000000000000F';

export const EXPLORER_URL = {
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
};

export const DEFILLAMA_IDS = {
  [NETWORKS.mainnet.chainId]: 'ethereum',
  [NETWORKS.arbitrum.chainId]: 'arbitrum',
  [NETWORKS.polygon.chainId]: 'polygon',
  [NETWORKS.optimism.chainId]: 'optimism',
  [NETWORKS.mumbai.chainId]: 'mumbai',
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

export const MEAN_API_URL = 'http://api.mean.finance';

export const SIGN_VERSION: Record<PositionVersions, string> = {
  [POSITION_VERSION_1]: '1',
  [POSITION_VERSION_2]: '1',
  [POSITION_VERSION_3]: '1',
  [POSITION_VERSION_4]: '2',
};

export const DEFILLAMA_PROTOCOL_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const BLOWFISH_ENABLED_CHAINS = [NETWORKS.mainnet.chainId, NETWORKS.polygon.chainId];

export const ZRX_API_ADDRESS: Record<number, string> = {
  [NETWORKS.mainnet.chainId]: 'https://api.0x.org',
  [NETWORKS.optimism.chainId]: 'https://optimism.api.0x.org',
  [NETWORKS.polygon.chainId]: 'https://polygon.api.0x.org',
  [NETWORKS.bsc.chainId]: 'https://bsc.api.0x.org',
  [NETWORKS.fantom.chainId]: 'https://fantom.api.0x.org',
  [NETWORKS.arbitrum.chainId]: 'https://arbitrum.api.0x.org',
};
/* eslint-enable */
