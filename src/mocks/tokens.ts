import { NETWORKS } from 'config/constants';

const DAI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x6b175474e89094c44da98b954eedeac495271d0f',
  [NETWORKS.ropsten.chainId]: '0xad6d458402f60fd3bd25163575031acdce07538d',
  [NETWORKS.rinkeby.chainId]: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  [NETWORKS.meanfinance.chainId]: '0x6b175474e89094c44da98b954eedeac495271d0f',
};

export const DAI = (chainId: number) => ({
  chainId: 1,
  decimals: 18,
  address: DAI_ADDRESSES[chainId],
  name: 'Dai stable coin',
  symbol: 'DAI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
  totalValueLockedUSD: 0,
});

const WETH_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.ropsten.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.rinkeby.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.meanfinance.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

export const WETH = (chainId: number) => ({
  chainId: 1,
  decimals: 18,
  address: WETH_ADDRESSES[chainId],
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
  totalValueLockedUSD: 0,
});

const USDC_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [NETWORKS.ropsten.chainId]: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
  [NETWORKS.rinkeby.chainId]: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
  [NETWORKS.meanfinance.chainId]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
};

export const USDC = (chainId: number) => ({
  chainId: 1,
  decimals: 6,
  address: USDC_ADDRESSES[chainId],
  name: 'USD Coin',
  symbol: 'USDC',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/usdc.png?1547036627',
  pairableTokens: [],
  totalValueLockedUSD: 0,
});

export const ETH = {
  chainId: 1,
  decimals: 18,
  address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  name: 'Ethereum',
  symbol: 'ETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
  totalValueLockedUSD: 0,
};

const UNI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.ropsten.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.rinkeby.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.meanfinance.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
};

export const UNI = (chainId: number) => ({
  chainId: 1,
  decimals: 18,
  address: UNI_ADDRESSES[chainId],
  name: 'Uniswap',
  symbol: 'UNI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
  totalValueLockedUSD: 0,
});

const YFI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  [NETWORKS.ropsten.chainId]: '0x08936fec5deeaf0cc92ad3e4b0cda2b934451785',
  [NETWORKS.rinkeby.chainId]: '0x664d6fdcbfc04bb8459c593112daff546653bf3b',
  [NETWORKS.meanfinance.chainId]: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
};

export const YFI = (chainId: number) => ({
  chainId: 1,
  decimals: 18,
  address: YFI_ADDRESSES[chainId],
  name: 'Yearn Finance',
  symbol: 'YFI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
  totalValueLockedUSD: 0,
});
