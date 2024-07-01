/* eslint-disable no-template-curly-in-string */

import { Chains, getAllChains } from '@balmy/sdk';
import { NetworkStruct, PositionVersions } from '@types';
import findKey from 'lodash/findKey';
import { Chain } from '@balmy/sdk/dist/types';
import { POSITION_VERSION_2, POSITION_VERSION_3, POSITION_VERSION_4, POSITION_VERSION_1 } from './common';
import { Address } from 'viem';

type AddressMap<K extends PositionVersions> = {
  [k in K]: Record<number, Address>;
};

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
  moonbeam: {
    chainId: 1284,
    name: 'Moonbeam',
    mainCurrency: '0xacc15dc74880c9944775448304b263d191c6077f',
    mainColor: '#E1147B',
    nativeCurrency: {
      name: 'Moonbeam',
      symbol: 'GLMR',
      decimals: 18,
    },
    rpc: ['https://rpc.ankr.com/moonbeam', 'https://moonbeam.unitedbloc.com:3000', 'https://rpc.api.moonbeam.network'],
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
    testnet: true,
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
    testnet: true,
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
    testnet: true,
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
    testnet: true,
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
    testnet: true,
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
    testnet: true,
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
    testnet: true,
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
    testnet: true,
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
    testnet: true,
  },
  base: {
    chainId: 8453,
    name: 'Base',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    mainColor: '#3076F6',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: ['https://mainnet.base.org', 'https://base.meowrpc.com'],
  },
  kava: {
    chainId: 2222,
    name: 'Kava',
    mainCurrency: '',
    mainColor: '#FF433E',
    nativeCurrency: {
      name: 'Kava',
      symbol: 'KAVA',
      decimals: 18,
    },
    rpc: ['https://evm.kava.io', 'https://evm2.kava.io'],
  },
};

export const sdkNetworkToNetworkStruct = ({ chainId, name, publicRPCs, nativeCurrency, wToken, testnet }: Chain) => ({
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
  .filter((chain) => !chain.testnet)
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

// Mainnets (Non-testnets)
export const MAIN_NETWORKS = Object.entries(NETWORKS)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .filter(([_, networkValue]) => !networkValue.testnet)
  .reduce<typeof NETWORKS>((acc, [networkKey, networkValue]) => ({ ...acc, [networkKey]: networkValue }), {});

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
  NETWORKS.moonbeam.chainId,
  NETWORKS.baseGoerli.chainId,
  Chains.BLAST.chainId,
  Chains.SCROLL.chainId,
];

export const SUPPORTED_NETWORKS_DCA = [
  NETWORKS.mainnet.chainId,
  NETWORKS.optimism.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.bsc.chainId,
  NETWORKS.xdai.chainId,
  NETWORKS.moonbeam.chainId,
  Chains.ROOTSTOCK.chainId,
];

export const DEFAULT_NETWORK_FOR_VERSION: Record<PositionVersions, NetworkStruct> = {
  [POSITION_VERSION_1]: NETWORKS.optimism,
  [POSITION_VERSION_2]: NETWORKS.optimism,
  [POSITION_VERSION_3]: NETWORKS.optimism,
  [POSITION_VERSION_4]: NETWORKS.mainnet,
};

export const DEFAULT_NETWORK_FOR_AGGREGATOR = NETWORKS.mainnet;

export const DEFAULT_NETWORK_FOR_TRANSFER = NETWORKS.mainnet;

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
    [NETWORKS.xdai.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [NETWORKS.moonbeam.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [NETWORKS.baseGoerli.chainId]: '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345',
    [Chains.ROOTSTOCK.chainId]: '0x8CC0Df843610cefF7f4AFa01100B6abf6756Bdf2',
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
    [NETWORKS.polygon.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [NETWORKS.optimism.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [NETWORKS.arbitrum.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [NETWORKS.mainnet.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [NETWORKS.bsc.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [NETWORKS.xdai.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [NETWORKS.moonbeam.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [NETWORKS.baseGoerli.chainId]: '0x6C615481E96806edBd9987B6E522A4Ea85d13659',
    [Chains.ROOTSTOCK.chainId]: '0x5872E8D5Ec9Dbf67949FdD4B5e05707644D60876',
  },
};

export const OLD_VERSION_4_COMPANION_ADDRESSES = [
  '0xDf0dbc66f85979a1d54671c4D9e439F306Be27EE',
  '0x49c590F6a2dfB0f809E82B9e2BF788C0Dd1c31f9',
  '0x5ad2fED59E8DF461c6164c31B4267Efb7cBaF9C0',
  '0x1547d2b570916270e4922a6397f92E8fC9708b4a',
  '0xa392e0e0B6C2AD6D65b05F2B8036AA397483CAae',
].map((address) => address.toLowerCase());
export const isCompanionAddress = (address: string, chainId: number) => {
  if (OLD_VERSION_4_COMPANION_ADDRESSES.includes(address.toLowerCase())) {
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
    [NETWORKS.xdai.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [NETWORKS.moonbeam.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [NETWORKS.baseGoerli.chainId]: '0x20bdAE1413659f47416f769a4B27044946bc9923',
    [Chains.ROOTSTOCK.chainId]: '0x1EE410Fc840cC13C4e1b17DC6f93E245a918c19e',
  },
};

export const PERMIT_2_ADDRESS: Record<number, Address> = {
  [NETWORKS.polygon.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.optimism.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.arbitrum.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.mainnet.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.bsc.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.baseGoerli.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3 ',
  [NETWORKS.avalanche.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.fantom.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.moonbeam.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.moonriver.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.fuse.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.evmos.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.celo.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.xdai.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.kava.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.heco.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [NETWORKS.okex.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [Chains.POLYGON_ZKEVM.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [Chains.BASE.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [Chains.LINEA.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [Chains.ROOTSTOCK.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [Chains.BLAST.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  [Chains.SCROLL.chainId]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
};

export const MEAN_PERMIT_2_ADDRESS: Record<number, Address> = {
  [NETWORKS.polygon.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.optimism.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.arbitrum.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.mainnet.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.bsc.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.avalanche.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.fantom.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.moonbeam.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.moonriver.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.fuse.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.evmos.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.celo.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.xdai.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.kava.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [NETWORKS.okex.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [Chains.BASE.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [Chains.LINEA.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [Chains.ROOTSTOCK.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [Chains.POLYGON_ZKEVM.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [Chains.BLAST.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
  [Chains.SCROLL.chainId]: '0xED306e38BB930ec9646FF3D917B2e513a97530b1',
};

export const SMOL_DOMAIN_ADDRESS: Record<number, Address> = {
  [NETWORKS.arbitrum.chainId]: '0xd64A2DF9d73CD1Cb50139A3eC3176070e00C67cA',
};

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
    [NETWORKS.xdai.chainId]: 'https://gnosisscan.io/',
    [NETWORKS.baseGoerli.chainId]: 'https://goerli.basescan.org/',
  }
);

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

export const STABLE_COINS = ['DAI', 'USDT', 'USDC', 'BUSD', 'UST', 'jEUR', 'jGBP', 'jCHF', 'USDC.e'];

export const MEAN_API_URL = process.env.MEAN_API_URL;

export const MEAN_PROXY_PANEL_URL = 'https://mean-finance-mixpanel-proxy.herokuapp.com';

export const SIGN_VERSION: Record<PositionVersions, string> = {
  [POSITION_VERSION_1]: '1',
  [POSITION_VERSION_2]: '1',
  [POSITION_VERSION_3]: '1',
  [POSITION_VERSION_4]: '2',
};

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const BLOWFISH_ENABLED_CHAINS = [
  NETWORKS.mainnet.chainId,
  NETWORKS.polygon.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.bsc.chainId,
  NETWORKS.optimism.chainId,
];

export const getGhTokenListLogoUrl = (chainId: number, address: string) =>
  `https://raw.githubusercontent.com/balmy-protocol/token-list/main/assets/chains/${chainId}/${address.toLowerCase()}.svg`;

// Unsupported wagmi OOTB chains
// fuse: 122,
// heco: 128,
// velas: 106,
// oasis: 42262,

export const UNSUPPORTED_WAGMI_CHAIN = [122, 128, 106, 42262];
/* eslint-enable */

const tokenAddressesForPriceFetching: Record<number, Record<string, Address>> = {
  [NETWORKS.arbitrum.chainId]: {
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // Bridged USDC (USDC.e): Native USDC
  },
  [NETWORKS.optimism.chainId]: {
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607': '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // Bridged USDC (USDC.e): Native USDC
  },
  [NETWORKS.polygon.chainId]: {
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // Bridged USDC (USDC.e): Native USDC
  },
};

export const getTokenAddressForPriceFetching = (chainId: number, address: Address): Address => {
  const chainRecord = tokenAddressesForPriceFetching[chainId];
  return (chainRecord && chainRecord[address]) || address;
};
