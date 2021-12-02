import { BigNumber } from 'ethers';
import { TransactionTypesConstant } from 'types';
import { Oracles } from 'types/contracts';

export const NETWORKS = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  ropsten: {
    chainId: 3,
    name: 'Ropsten',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  rinkeby: {
    chainId: 4,
    name: 'Rinkeby',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  goerli: {
    chainId: 5,
    name: 'Goerli',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  kovan: {
    chainId: 42,
    name: 'Kovan',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  meanfinance: {
    chainId: 31337,
    name: 'Mean Finance',
    mainCurrency: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  bsc: {
    chainId: 56,
    name: 'BSC',
    mainCurrency: 'BNB',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    mainCurrency: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  },
  fantom: {
    chainId: 250,
    name: 'Fantom',
    mainCurrency: '',
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    mainCurrency: '',
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum',
    mainCurrency: '',
  },
  heco: {
    chainId: 128,
    name: 'Heco',
    mainCurrency: '',
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    mainCurrency: '',
  },
  okex: {
    chainId: 66,
    name: 'OKEx',
    mainCurrency: '',
  },
  harmony: {
    chainId: 1666600000,
    name: 'Harmony',
    mainCurrency: '',
  },
  xdai: {
    chainId: 100,
    name: 'xDAI',
    mainCurrency: '',
  },
};

export const TESTNETS = [
  NETWORKS.ropsten.chainId,
  NETWORKS.rinkeby.chainId,
  NETWORKS.goerli.chainId,
  NETWORKS.kovan.chainId,
];
export const SUPPORTED_NETWORKS = [
  NETWORKS.mainnet.chainId,
  NETWORKS.ropsten.chainId,
  NETWORKS.rinkeby.chainId,
  NETWORKS.goerli.chainId,
  NETWORKS.kovan.chainId,
];

export const COINGECKO_IDS = {
  [NETWORKS.mainnet.chainId]: 'ethereum',
  [NETWORKS.ropsten.chainId]: 'ethereum',
  [NETWORKS.rinkeby.chainId]: 'ethereum',
  [NETWORKS.goerli.chainId]: 'ethereum',
  [NETWORKS.kovan.chainId]: 'ethereum',
  [NETWORKS.polygon.chainId]: 'polygon-pos',
};

export const NETWORKS_FOR_MENU = [NETWORKS.mainnet.chainId, NETWORKS.polygon.chainId];

export const HUB_ADDRESS = '0xA9DFAe8b08eCA017E4f33C0C580b7B5b97974567';
export const ORACLE_ADDRESS = '0xF8736BB2a48bB5D9dF88b393eC3053a52a440edE';
export const COMPANION_ADDRESS = '0x50ed158bfed47ee565f31404c98a9f9ac0fa0cac';
export const TOKEN_DESCRIPTOR_ADDRESS = '0x0aB7CF8A552Fa296632e280213c392473D6d0933';
export const CHAINLINK_ORACLE_ADDRESS = '0x5aB88a77f609B47AD752dca6d8537746861A5839';
export const UNISWAP_ORACLE_ADDRESS = '0xF929d119a2c108928b20346dAd609751ddc0ad18';

export const MEAN_GRAPHQL_URL = {
  [NETWORKS.mainnet.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v1',
  [NETWORKS.ropsten.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v1-ropsten',
  [NETWORKS.rinkeby.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v1-rinkeby',
  [NETWORKS.goerli.chainId]: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v1-goerli',
  [NETWORKS.kovan.chainId]: 'https://api.thegraph.com/subgraphs/name/storres93/mean-kovan',
  [NETWORKS.meanfinance.chainId]: 'http://3.235.77.84:8000/subgraphs/name/alejoamiras/dca-subgraph',
};

export const UNI_GRAPHQL_URL = {
  [NETWORKS.mainnet.chainId]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  [NETWORKS.ropsten.chainId]: 'https://api.thegraph.com/subgraphs/name/alejoamiras/uniswap-v3-ropsten',
  [NETWORKS.rinkeby.chainId]: 'https://api.thegraph.com/subgraphs/name/alejoamiras/uniswap-v3-rinkeby',
  [NETWORKS.goerli.chainId]: 'https://api.thegraph.com/subgraphs/name/storres93/uniswap-v3-goerli',
  [NETWORKS.kovan.chainId]: 'https://api.thegraph.com/subgraphs/name/fibofinance/uniswap-v3-kovan',
  [NETWORKS.meanfinance.chainId]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
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
  [NETWORKS.okex.chainId]: 'https://www.oklink.com/okexchain/',
  [NETWORKS.harmony.chainId]: 'https://explorer.harmony.one/#/',
  [NETWORKS.xdai.chainId]: 'https://blockscout.com/xdai/mainnet/',
};

export const TRANSACTION_TYPES: TransactionTypesConstant = {
  NEW_POSITION: 'NEW_POSITION',
  NEW_PAIR: 'NEW_PAIR',
  APPROVE_TOKEN: 'APPROVE_TOKEN',
  TERMINATE_POSITION: 'TERMINATE_POSITION',
  WITHDRAW_POSITION: 'WITHDRAW_POSITION',
  ADD_FUNDS_POSITION: 'ADD_FUNDS_POSITION',
  MODIFY_SWAPS_POSITION: 'MODIFY_SWAPS_POSITION',
  MODIFY_RATE_AND_SWAPS_POSITION: 'MODIFY_RATE_AND_SWAPS_POSITION',
  REMOVE_FUNDS: 'REMOVE_FUNDS',
  RESET_POSITION: 'RESET_POSITION',
  WRAP_ETHER: 'WRAP_ETHER',
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

export const STRING_SWAP_INTERVALS = {
  [ONE_MINUTE.toString()]: {
    singular: '1 minute',
    plural: '1 minute',
    adverb: 'every 1 minute',
  },
  [FIVE_MINUTES.toString()]: {
    singular: '5 minutes',
    plural: '5 minutes',
    adverb: 'every 5 minutes',
  },
  [FIFTEEN_MINUTES.toString()]: {
    singular: '15 minutes',
    plural: '15 minutes',
    adverb: 'every 15 minutes',
  },
  [THIRTY_MINUTES.toString()]: {
    singular: '30 minutes',
    plural: '30 minutes',
    adverb: 'every 30 minutes',
  },
  [ONE_HOUR.toString()]: {
    singular: 'hour',
    plural: 'hours',
    adverb: 'hourly',
  },
  [FOUR_HOURS.toString()]: {
    singular: '4 hours',
    plural: '4 hours',
    adverb: 'every 4 hours',
  },
  [ONE_DAY.toString()]: {
    singular: 'day',
    plural: 'days',
    adverb: 'daily',
  },
  [ONE_WEEK.toString()]: {
    singular: 'week',
    plural: 'weeks',
    adverb: 'weekly',
  },
};

export const WHALE_MODE_FREQUENCIES = {
  [NETWORKS.mainnet.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
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
};

export const WHALE_MINIMUM_VALUES = {
  [NETWORKS.mainnet.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
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
};
export const POSITION_ACTIONS = {
  MODIFIED_RATE: 'MODIFIED_RATE',
  MODIFIED_DURATION: 'MODIFIED_DURATION',
  MODIFIED_RATE_AND_DURATION: 'MODIFIED_RATE_AND_DURATION',
  WITHDREW: 'WITHDREW',
  SWAPPED: 'SWAPPED',
  CREATED: 'CREATED',
  TERMINATED: 'TERMINATED',
};

export const ORACLES: Record<'NONE' | 'CHAINLINK' | 'UNISWAP', Oracles> = {
  NONE: 0,
  CHAINLINK: 1,
  UNISWAP: 2,
};
