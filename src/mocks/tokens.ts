import { NETWORKS } from 'config/constants';
import { Token } from 'types';

const DAI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x6b175474e89094c44da98b954eedeac495271d0f',
  [NETWORKS.ropsten.chainId]: '0xad6d458402f60fd3bd25163575031acdce07538d',
  [NETWORKS.rinkeby.chainId]: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  [NETWORKS.meanfinance.chainId]: '0x6b175474e89094c44da98b954eedeac495271d0f',
  [NETWORKS.goerli.chainId]: '0x9d233a907e065855d2a9c7d4b552ea27fb2e5a36',
  [NETWORKS.kovan.chainId]: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
};

export const DAI = (chainId: number): Token => ({
  chainId: chainId,
  decimals: 18,
  address: DAI_ADDRESSES[chainId] || DAI_ADDRESSES[1],
  name: 'Dai stable coin',
  symbol: 'DAI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
});

const WETH_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.ropsten.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.rinkeby.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.meanfinance.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.goerli.chainId]: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
  [NETWORKS.kovan.chainId]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
};

export const WETH = (chainId: number): Token => ({
  chainId: chainId,
  decimals: 18,
  address: WETH_ADDRESSES[chainId] || WETH_ADDRESSES[1],
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
});

const USDC_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [NETWORKS.ropsten.chainId]: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  [NETWORKS.rinkeby.chainId]: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
  [NETWORKS.meanfinance.chainId]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [NETWORKS.goerli.chainId]: '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c',
  [NETWORKS.kovan.chainId]: '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
};

export const USDC = (chainId: number): Token => ({
  chainId: chainId,
  decimals: 6,
  address: USDC_ADDRESSES[chainId] || USDC_ADDRESSES[1],
  name: 'USD Coin',
  symbol: 'USDC',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/usdc.png?1547036627',
});

export const ETH = {
  chainId: 1,
  decimals: 18,
  address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  name: 'Ethereum',
  symbol: 'ETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};

const UNI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.ropsten.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.rinkeby.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.meanfinance.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.goerli.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.kovan.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
};

export const UNI = (chainId: number): Token => ({
  chainId: chainId,
  decimals: 18,
  address: UNI_ADDRESSES[chainId] || UNI_ADDRESSES[1],
  name: 'Uniswap',
  symbol: 'UNI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
});

const YFI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  [NETWORKS.ropsten.chainId]: '0x08936fec5deeaf0cc92ad3e4b0cda2b934451785',
  [NETWORKS.rinkeby.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.meanfinance.chainId]: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  [NETWORKS.goerli.chainId]: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  [NETWORKS.kovan.chainId]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
};

export const YFI = (chainId: number): Token => ({
  chainId: chainId,
  decimals: 18,
  address: YFI_ADDRESSES[chainId] || YFI_ADDRESSES[1],
  name: 'Yearn Finance',
  symbol: 'YFI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
});
