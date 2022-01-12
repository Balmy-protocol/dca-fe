/* eslint-disable no-template-curly-in-string */
import { BigNumber } from 'ethers';
import { Permission, TransactionTypesConstant } from 'types';
import { Oracles } from 'types/contracts';
import { Duration } from 'luxon';

export const NETWORKS = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
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
    name: 'Arbitrum',
    mainCurrency: '',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpc: [],
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
    name: 'Optimistic Ethereum',
    mainCurrency: 'OPTIMISM',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'OETH',
      decimals: 18,
    },
    rpc: ['https://mainnet.optimism.io/'],
  },
  optimismKovan: {
    chainId: 69,
    name: 'Optimistic Ethereum Kovan',
    mainCurrency: 'OPTIMISM',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'OETH',
      decimals: 18,
    },
    rpc: ['https://kovan.optimism.io/'],
  },
  optimismGoerli: {
    chainId: 420,
    name: 'Optimistic Ethereum Goerli',
    mainCurrency: 'OPTIMISM',
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
];
export const SUPPORTED_NETWORKS = [NETWORKS.kovan.chainId, NETWORKS.optimismKovan.chainId, NETWORKS.optimism.chainId];

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
};

export const NETWORKS_FOR_MENU = [NETWORKS.optimism.chainId];

export const HUB_ADDRESS = {
  [NETWORKS.kovan.chainId]: '0xA9DFAe8b08eCA017E4f33C0C580b7B5b97974567',
  [NETWORKS.optimismKovan.chainId]: '0x19BB8c1130649BD2a114c2f2d4C3a6AFa3Bd4944',
  [NETWORKS.optimism.chainId]: '0x24F85583FAa9F8BD0B8Aa7B1D1f4f53F0F450038',
};
export const ORACLE_ADDRESS = {
  [NETWORKS.kovan.chainId]: '0xF8736BB2a48bB5D9dF88b393eC3053a52a440edE',
  [NETWORKS.optimismKovan.chainId]: '0x4aFd06674E0701F3bfd6f026e4Ec785f5eC3E29f',
  [NETWORKS.optimism.chainId]: '0x579280AcF998A031922421a2f6C62Ba609Be44F7',
};
export const COMPANION_ADDRESS = {
  [NETWORKS.kovan.chainId]: '0x50ed158bfed47ee565f31404c98a9f9ac0fa0cac',
  [NETWORKS.optimismKovan.chainId]: '0x2e2e175406109c2E5Df16a59f615Ee6E7CA87b5c',
  [NETWORKS.optimism.chainId]: '0x1eD2957bA1F14c17E01424DD93a258dd2E04cAAC',
};
export const TOKEN_DESCRIPTOR_ADDRESS = {
  [NETWORKS.kovan.chainId]: '0x0aB7CF8A552Fa296632e280213c392473D6d0933',
  [NETWORKS.optimismKovan.chainId]: '0x579280AcF998A031922421a2f6C62Ba609Be44F7',
  [NETWORKS.optimism.chainId]: '0x0100a1c3020fE97051cBB18636C0f91abCc603cE',
};
export const CHAINLINK_ORACLE_ADDRESS = {
  [NETWORKS.kovan.chainId]: '0x5aB88a77f609B47AD752dca6d8537746861A5839',
  [NETWORKS.optimismKovan.chainId]: '0xC9A965C884c43e849a46A3df4Bb28e036f6C0dB5',
  [NETWORKS.optimism.chainId]: '0x8847480C34C7DceEf73647c57766f28c3A07596B',
};
export const UNISWAP_ORACLE_ADDRESS = {
  [NETWORKS.kovan.chainId]: '0xF929d119a2c108928b20346dAd609751ddc0ad18',
  [NETWORKS.optimismKovan.chainId]: '0x8847480C34C7DceEf73647c57766f28c3A07596B',
  [NETWORKS.optimism.chainId]: '0x4aFd06674E0701F3bfd6f026e4Ec785f5eC3E29f',
};

export const PERMISSION_MANAGER_ADDRESS = {
  [NETWORKS.kovan.chainId]: '0xbB3E83D7C2fD7c1D07bb2dCCe435728Da2e42463',
  [NETWORKS.optimismKovan.chainId]: '0x0100a1c3020fE97051cBB18636C0f91abCc603cE',
  [NETWORKS.optimism.chainId]: '0x09AdE44D2E60fCa2270fF32Af5a189f40D29837b',
};

export const MEAN_GRAPHQL_URL = {
  [NETWORKS.kovan.chainId]: 'https://api.thegraph.com/subgraphs/name/storres93/mean-kovan',
  [NETWORKS.optimismKovan.chainId]: 'https://api.thegraph.com/subgraphs/name/storres93/mean-optimism-kovan',
  [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-optimism',
};

export const UNI_GRAPHQL_URL = {
  [NETWORKS.kovan.chainId]: 'https://api.thegraph.com/subgraphs/name/fibofinance/uniswap-v3-kovan',
  [NETWORKS.optimismKovan.chainId]: 'https://api.thegraph.com/subgraphs/name/storres93/uniswap-v3-optimism-kovan',
  [NETWORKS.optimism.chainId]: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
};

export const CHAINLINK_GRAPHQL_URL = {
  [NETWORKS.mainnet.chainId]: 'https://gql.graph.chain.link/subgraphs/name/ethereum-mainnet',
};

export const EXPLORER_URL = {
  [NETWORKS.mainnet.chainId]: 'https://etherscan.io/',
  [NETWORKS.ropsten.chainId]: 'https://ropsten.etherscan.io/',
  [NETWORKS.rinkeby.chainId]: 'https://rinkeby.etherscan.io/',
  [NETWORKS.goerli.chainId]: 'https://goerli.etherscan.io/',
  [NETWORKS.kovan.chainId]: 'https://kovan.etherscan.io/',
  [NETWORKS.meanfinance.chainId]: 'https://etherscan.io/',
  [NETWORKS.bsc.chainId]: 'https://bscscan.com',
  [NETWORKS.polygon.chainId]: 'https://polygonscan.com',
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

export const TRANSACTION_TYPES: TransactionTypesConstant = {
  NEW_POSITION: 'NEW_POSITION',
  NEW_PAIR: 'NEW_PAIR',
  APPROVE_TOKEN: 'APPROVE_TOKEN',
  TRANSFER_POSITION: 'TRANSFER_POSITION',
  TERMINATE_POSITION: 'TERMINATE_POSITION',
  APPROVE_COMPANION: 'APPROVE_COMPANION',
  WITHDRAW_POSITION: 'WITHDRAW_POSITION',
  ADD_FUNDS_POSITION: 'ADD_FUNDS_POSITION',
  MODIFY_SWAPS_POSITION: 'MODIFY_SWAPS_POSITION',
  MODIFY_RATE_AND_SWAPS_POSITION: 'MODIFY_RATE_AND_SWAPS_POSITION',
  REMOVE_FUNDS: 'REMOVE_FUNDS',
  RESET_POSITION: 'RESET_POSITION',
  WRAP_ETHER: 'WRAP_ETHER',
  MODIFY_PERMISSIONS: 'MODIFY_PERMISSIONS',
  NO_OP: 'NO_OP',
};

export const FULL_DEPOSIT_TYPE = 'full_deposit';
export const RATE_TYPE = 'by_rate';

export const MODE_TYPES = {
  FULL_DEPOSIT: {
    label: 'Full deposit',
    id: FULL_DEPOSIT_TYPE,
  },
  RATE: {
    label: 'By rate',
    id: RATE_TYPE,
  },
};

export const MINIMUM_LIQUIDITY_USD = parseFloat('350000');

export const POSSIBLE_ACTIONS = {
  createPosition: 'createPosition',
  approveToken: 'approveToken',
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

export const STABLE_COINS = ['DAI', 'USDT', 'USDC', 'BUSD', 'UST'];

export const ONE_MINUTE = BigNumber.from(60);
export const FIVE_MINUTES = ONE_MINUTE.mul(BigNumber.from(5));
export const FIFTEEN_MINUTES = FIVE_MINUTES.mul(BigNumber.from(3));
export const THIRTY_MINUTES = FIFTEEN_MINUTES.mul(BigNumber.from(2));
export const ONE_HOUR = THIRTY_MINUTES.mul(BigNumber.from(2));
export const FOUR_HOURS = ONE_HOUR.mul(BigNumber.from(4));
export const ONE_DAY = FOUR_HOURS.mul(BigNumber.from(6));
export const ONE_WEEK = ONE_DAY.mul(BigNumber.from(7));

export const SWAP_INTERVALS = {
  hour: ONE_HOUR,
  day: ONE_DAY,
  week: ONE_WEEK,
};

export const SWAP_INTERVALS_MAP = [
  {
    description: 'One minute',
    key: 1,
    value: ONE_MINUTE,
  },
  {
    description: 'Five minutes',
    key: 2,
    value: FIVE_MINUTES,
  },
  {
    description: 'Fifteen minutes',
    key: 4,
    value: FIFTEEN_MINUTES,
  },
  {
    description: 'Thirty minutes',
    key: 8,
    value: THIRTY_MINUTES,
  },
  {
    description: 'One hour',
    key: 16,
    value: ONE_HOUR,
  },
  {
    description: 'Four hours',
    key: 32,
    value: FOUR_HOURS,
  },
  {
    description: 'One day',
    key: 64,
    value: ONE_DAY,
  },
  {
    description: 'One week',
    key: 128,
    value: ONE_WEEK,
  },
];

const toReadable = (left: number, frequency: number) => {
  const customDuration = Duration.fromMillis(frequency * 1000 * left);
  const asDays = customDuration.as('days');
  const asHours = customDuration.as('hours');
  const asMinutes = customDuration.as('minutes');

  if (asDays >= 1) {
    return `${asDays} days`;
  }

  if (asHours >= 1) {
    return `${asHours} hours`;
  }

  return `${asMinutes} minutes`;
};
export const STRING_SWAP_INTERVALS = {
  [ONE_MINUTE.toString()]: {
    singular: '1 minute (1 swap)',
    singularTime: '1 minute',
    plural: (left: number) => `${toReadable(left, ONE_MINUTE.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_MINUTE.toNumber())}`,
    adverb: 'every 1 minute',
    every: 'every 1 minute',
    subject: 'swaps',
  },
  [FIVE_MINUTES.toString()]: {
    singular: '5 minutes (1 swap)',
    singularTime: '5 minutes',
    plural: (left: number) => `${toReadable(left, FIVE_MINUTES.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, FIVE_MINUTES.toNumber())}`,
    adverb: 'every 5 minutes',
    every: 'every 5 minutes',
    subject: 'swaps',
  },
  [FIFTEEN_MINUTES.toString()]: {
    singular: '15 minutes (1 swap)',
    singularTime: '15 minutes',
    plural: (left: number) => `${toReadable(left, FIFTEEN_MINUTES.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, FIFTEEN_MINUTES.toNumber())}`,
    adverb: 'every 15 minutes',
    every: 'every 15 minutes',
    subject: 'swaps',
  },
  [THIRTY_MINUTES.toString()]: {
    singular: '30 minutes (1 swap)',
    singularTime: '30 minutes',
    plural: (left: number) => `${toReadable(left, THIRTY_MINUTES.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, THIRTY_MINUTES.toNumber())}`,
    adverb: 'every 30 minutes',
    every: 'every 30 minutes',
    subject: 'swaps',
  },
  [ONE_HOUR.toString()]: {
    singular: '1 hour (1 swap)',
    singularTime: '1 hour',
    plural: (left: number) => `${toReadable(left, ONE_HOUR.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_HOUR.toNumber())}`,
    adverb: 'hourly',
    every: 'every hour',
    subject: 'swaps',
  },
  [FOUR_HOURS.toString()]: {
    singular: '4 hours (1 swap)',
    singularTime: '4 hours',
    plural: (left: number) => `${toReadable(left, FOUR_HOURS.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, FOUR_HOURS.toNumber())}`,
    adverb: 'every 4 hours',
    every: 'every 4 hours',
    subject: 'swaps',
  },
  [ONE_DAY.toString()]: {
    singular: '1 day (1 swap)',
    singularTime: '1 day',
    plural: (left: number) => `${toReadable(left, ONE_DAY.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_DAY.toNumber())}`,
    every: 'every day',
    adverb: 'daily',
    subject: 'days',
  },
  [ONE_WEEK.toString()]: {
    singular: '1 week (1 swap)',
    singularTime: '1 week',
    plural: (left: number) => `${toReadable(left, ONE_WEEK.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_WEEK.toNumber())}`,
    every: 'every week',
    adverb: 'weekly',
    subject: 'weeks',
  },
};

export const WHALE_MODE_FREQUENCIES = {
  [NETWORKS.polygon.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
  [NETWORKS.kovan.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
  [NETWORKS.optimismKovan.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
  [NETWORKS.optimism.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
};

export const WHALE_MINIMUM_VALUES = {
  [NETWORKS.kovan.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
  [NETWORKS.polygon.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
  [NETWORKS.optimismKovan.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
  [NETWORKS.optimism.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
};
export const POSITION_ACTIONS = {
  MODIFIED_RATE: 'MODIFIED_RATE',
  MODIFIED_DURATION: 'MODIFIED_DURATION',
  MODIFIED_RATE_AND_DURATION: 'MODIFIED_RATE_AND_DURATION',
  WITHDREW: 'WITHDREW',
  SWAPPED: 'SWAPPED',
  CREATED: 'CREATED',
  TERMINATED: 'TERMINATED',
  TRANSFERED: 'TRANSFERED',
};

export const ORACLES: Record<'NONE' | 'CHAINLINK' | 'UNISWAP', Oracles> = {
  NONE: 0,
  CHAINLINK: 1,
  UNISWAP: 2,
};

export const PERMISSIONS = {
  INCREASE: 0,
  REDUCE: 1,
  WITHDRAW: 2,
  TERMINATE: 3,
};

export const STRING_PERMISSIONS: Record<Permission, string> = {
  INCREASE: 'Increase',
  REDUCE: 'Reduce',
  WITHDRAW: 'Withdraw',
  TERMINATE: 'Terminate',
};

export const MAX_UINT_32 = 4294967295;
/* eslint-enable */
