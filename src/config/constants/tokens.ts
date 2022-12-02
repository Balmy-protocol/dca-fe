import { PermitDomain, PermitType } from 'types';
import { NETWORKS } from './addresses';

export const DAI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x6b175474e89094c44da98b954eedeac495271d0f',
  [NETWORKS.polygon.chainId]: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  [NETWORKS.optimism.chainId]: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  [NETWORKS.arbitrum.chainId]: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
};

export const WETH_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.polygon.chainId]: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  [NETWORKS.optimism.chainId]: '0x4200000000000000000000000000000000000006',
  [NETWORKS.arbitrum.chainId]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
};

export const USDC_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [NETWORKS.polygon.chainId]: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  [NETWORKS.optimism.chainId]: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
  [NETWORKS.arbitrum.chainId]: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
};

export const WMATIC_ADDRESSES = {
  [NETWORKS.polygon.chainId]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
};

export const USDT_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  [NETWORKS.polygon.chainId]: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  [NETWORKS.optimism.chainId]: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
  [NETWORKS.arbitrum.chainId]: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
};

export const WBTC_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  [NETWORKS.polygon.chainId]: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
  [NETWORKS.optimism.chainId]: '0x68f180fcce6836688e9084f035309e29bf0a2095',
  [NETWORKS.arbitrum.chainId]: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
};

export const PERMIT_DOMAIN_TOKENS: Record<number, Record<string, PermitDomain>> = {
  [NETWORKS.mainnet.chainId]: {
    [USDC_ADDRESSES[NETWORKS.mainnet.chainId]]: {
      type: PermitType.AMOUNT,
      name: 'USD Coin',
      version: '2',
      chainId: NETWORKS.mainnet.chainId,
      verifyingContract: USDC_ADDRESSES[NETWORKS.mainnet.chainId],
    },
    [DAI_ADDRESSES[NETWORKS.mainnet.chainId]]: {
      type: PermitType.ALLOWED,
      name: 'Dai Stablecoin',
      version: '1',
      chainId: NETWORKS.mainnet.chainId,
      verifyingContract: DAI_ADDRESSES[NETWORKS.mainnet.chainId],
    },
  },
  [NETWORKS.polygon.chainId]: {
    [USDC_ADDRESSES[NETWORKS.polygon.chainId]]: {
      type: PermitType.AMOUNT,
      name: 'USD Coin (PoS)',
      version: '1',
      chainId: NETWORKS.polygon.chainId,
      verifyingContract: USDC_ADDRESSES[NETWORKS.polygon.chainId],
    },
    [DAI_ADDRESSES[NETWORKS.polygon.chainId]]: {
      type: PermitType.ALLOWED,
      name: '(PoS) Dai Stablecoin',
      version: '1',
      chainId: NETWORKS.polygon.chainId,
      verifyingContract: DAI_ADDRESSES[NETWORKS.polygon.chainId],
    },
  },
  [NETWORKS.optimism.chainId]: {
    [DAI_ADDRESSES[NETWORKS.optimism.chainId]]: {
      type: PermitType.AMOUNT,
      name: 'Dai Stablecoin',
      version: '2',
      chainId: NETWORKS.optimism.chainId,
      verifyingContract: DAI_ADDRESSES[NETWORKS.optimism.chainId],
    },
  },
  [NETWORKS.arbitrum.chainId]: {
    [USDC_ADDRESSES[NETWORKS.arbitrum.chainId]]: {
      type: PermitType.AMOUNT,
      name: 'USD Coin (Arb1)',
      version: '1',
      chainId: NETWORKS.arbitrum.chainId,
      verifyingContract: USDC_ADDRESSES[NETWORKS.arbitrum.chainId],
    },
    [DAI_ADDRESSES[NETWORKS.arbitrum.chainId]]: {
      type: PermitType.AMOUNT,
      name: 'Dai Stablecoin',
      version: '2',
      chainId: NETWORKS.arbitrum.chainId,
      verifyingContract: DAI_ADDRESSES[NETWORKS.arbitrum.chainId],
    },
    [USDT_ADDRESSES[NETWORKS.arbitrum.chainId]]: {
      type: PermitType.AMOUNT,
      name: 'Tether USD',
      version: '1',
      chainId: NETWORKS.arbitrum.chainId,
      verifyingContract: USDT_ADDRESSES[NETWORKS.arbitrum.chainId],
    },
  },
};
