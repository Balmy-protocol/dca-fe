import { getGhTokenListLogoUrl, NETWORKS, TESTNETS } from '@constants';
import find from 'lodash/find';
import { ChainId, Token, TokenType } from '@types';
import { toToken } from '@common/utils/currency';
import { Address } from 'viem';

const DAI_ADDRESSES: Record<number, Address> = {
  [NETWORKS.mainnet.chainId]: '0x6b175474e89094c44da98b954eedeac495271d0f',
  [NETWORKS.ropsten.chainId]: '0xad6d458402f60fd3bd25163575031acdce07538d',
  [NETWORKS.rinkeby.chainId]: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  [NETWORKS.meanfinance.chainId]: '0x6b175474e89094c44da98b954eedeac495271d0f',
  [NETWORKS.goerli.chainId]: '0x9d233a907e065855d2a9c7d4b552ea27fb2e5a36',
  [NETWORKS.kovan.chainId]: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
  [NETWORKS.optimism.chainId]: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
};

export const DAI = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: DAI_ADDRESSES[chainId] || DAI_ADDRESSES[1],
  name: 'Dai stable coin',
  symbol: 'DAI',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  chainAddresses: [],
});

const WETH_ADDRESSES: Record<number, Address> = {
  [NETWORKS.mainnet.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.ropsten.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.rinkeby.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.meanfinance.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.goerli.chainId]: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
  [NETWORKS.kovan.chainId]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  [NETWORKS.optimismKovan.chainId]: '0x4200000000000000000000000000000000000006',
  [NETWORKS.optimism.chainId]: '0x4200000000000000000000000000000000000006',
  [NETWORKS.arbitrum.chainId]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  [NETWORKS.baseGoerli.chainId]: '0x4200000000000000000000000000000000000006',
};

const WETH_CHAIN_ADDRESSES = Object.keys(WETH_ADDRESSES)
  .filter((chainId) => !TESTNETS.includes(Number(chainId)))
  .map((chainId) => ({
    chainId: Number(chainId),
    address: WETH_ADDRESSES[Number(chainId)],
  }));

export const WETH = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: WETH_ADDRESSES[chainId] || WETH_ADDRESSES[1],
  name: 'Wrapped Ether',
  symbol: 'WETH',
  type: TokenType.WRAPPED_PROTOCOL_TOKEN,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  chainAddresses: WETH_CHAIN_ADDRESSES,
});

const USDC_ADDRESSES: Record<number, Address> = {
  [NETWORKS.mainnet.chainId]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [NETWORKS.ropsten.chainId]: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  [NETWORKS.rinkeby.chainId]: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
  [NETWORKS.meanfinance.chainId]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [NETWORKS.goerli.chainId]: '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c',
  [NETWORKS.kovan.chainId]: '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
  [NETWORKS.optimismKovan.chainId]: '0x4e62882864fB8CE54AFfcAf8D899A286762B011B',
  [NETWORKS.optimism.chainId]: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
};

export const USDC = (chainId: number): Token => ({
  chainId,
  decimals: 6,
  address: USDC_ADDRESSES[chainId] || USDC_ADDRESSES[1],
  name: 'USD Coin',
  symbol: 'USDC',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  chainAddresses: [],
});

export const ETH_COMPANION_ADDRESS: Address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const PROTOCOL_TOKEN_ADDRESS: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

const ETH_CHAINS = [
  NETWORKS.mainnet.chainId,
  NETWORKS.ropsten.chainId,
  NETWORKS.rinkeby.chainId,
  NETWORKS.goerli.chainId,
  NETWORKS.kovan.chainId,
  NETWORKS.optimismKovan.chainId,
  NETWORKS.optimism.chainId,
  NETWORKS.optimismGoerli.chainId,
  NETWORKS.arbitrum.chainId,
  NETWORKS.baseGoerli.chainId,
];

const ETH_CHAIN_ADDRESSES = ETH_CHAINS.filter((chainId) => !TESTNETS.includes(chainId)).map((chainId) => ({
  chainId,
  address: PROTOCOL_TOKEN_ADDRESS,
}));

export const ETH = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Ethereum',
  symbol: 'ETH',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  chainAddresses: ETH_CHAIN_ADDRESSES,
});

export const BNB = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'BNB',
  symbol: 'BNB',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
});

export const FTM = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Fantom',
  symbol: 'FTM',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
});

export const AVAX = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Avalanche',
  symbol: 'AVAX',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
});

export const HT = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Huobi',
  symbol: 'HT',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
});

export const XDAI = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'xDAI',
  symbol: 'xDAI',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
});

export const MATIC = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Matic',
  symbol: 'MATIC',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png',
  chainAddresses: [],
});

const WMATIC_ADDRESSES: Record<number, Address> = {
  [NETWORKS.polygon.chainId]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  [NETWORKS.mumbai.chainId]: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
};

export const WMATIC = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: WMATIC_ADDRESSES[chainId] || WMATIC_ADDRESSES[1],
  name: 'Wrapped Matic',
  symbol: 'WMATIC',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI: 'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
  chainAddresses: [],
});

export const WXDAI = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
  name: 'Wrapped XDAI',
  symbol: 'WXDAI',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI: 'https://assets.coingecko.com/coins/images/14584/standard/wrapped-xdai-logo.png',
  chainAddresses: [],
});

export const WGLMR = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: '0xacc15dc74880c9944775448304b263d191c6077f',
  name: 'Wrapped Glimmer',
  symbol: 'WGLMR',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI: 'https://assets.coingecko.com/coins/images/23688/standard/wglmr.jpg',
  chainAddresses: [],
});

const generateChainBasedTokens = (chains: number[], token: (chainId: number) => Token) => {
  return chains.reduce<Record<ChainId, (chainId: number) => Token>>((acc, chainId) => {
    // eslint-disable-next-line no-param-reassign
    acc[chainId] = token;
    return acc;
  }, {});
};

export const PROTOCOL_TOKEN = {
  ...generateChainBasedTokens(ETH_CHAINS, ETH),
  [NETWORKS.polygon.chainId]: MATIC,
  [NETWORKS.mumbai.chainId]: MATIC,
  [NETWORKS.bsc.chainId]: BNB,
  [NETWORKS.fantom.chainId]: FTM,
  [NETWORKS.avalanche.chainId]: AVAX,
  [NETWORKS.heco.chainId]: HT,
  [NETWORKS.xdai.chainId]: XDAI,
};

export const WRAPPED_PROTOCOL_TOKEN = {
  ...generateChainBasedTokens(ETH_CHAINS, WETH),
  [NETWORKS.polygon.chainId]: WMATIC,
  [NETWORKS.mumbai.chainId]: WMATIC,
  [NETWORKS.xdai.chainId]: WXDAI,
  [NETWORKS.moonbeam.chainId]: WGLMR,
};

export const getProtocolToken = (chainId: number) => {
  const supportedToken = PROTOCOL_TOKEN[chainId] && PROTOCOL_TOKEN[chainId](chainId);

  if (supportedToken) {
    return supportedToken;
  }

  const foundNetwork = find(NETWORKS, { chainId });

  if (foundNetwork) {
    return toToken({
      ...foundNetwork.nativeCurrency,
      chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
      logoURI: getGhTokenListLogoUrl(chainId, PROTOCOL_TOKEN_ADDRESS),
    });
  }

  return PROTOCOL_TOKEN[NETWORKS.mainnet.chainId](NETWORKS.mainnet.chainId);
};

export const getWrappedProtocolToken = (chainId: number) => {
  const supportedToken = WRAPPED_PROTOCOL_TOKEN[chainId] && WRAPPED_PROTOCOL_TOKEN[chainId](chainId);

  if (supportedToken) {
    return supportedToken;
  }

  const foundNetwork = find(NETWORKS, { chainId });

  if (foundNetwork) {
    return toToken({
      address: foundNetwork.wToken,
      name: `Wrapped ${foundNetwork.nativeCurrency.name || ''}`,
      symbol: `W${foundNetwork.nativeCurrency.symbol || ''}`,
      chainId,
      logoURI: getGhTokenListLogoUrl(chainId, PROTOCOL_TOKEN_ADDRESS),
    });
  }

  return WRAPPED_PROTOCOL_TOKEN[NETWORKS.mainnet.chainId](NETWORKS.mainnet.chainId);
};

export const EMPTY_TOKEN: Token = {
  chainId: -1,
  decimals: 18,
  address: '0xnone',
  name: 'EMPTY',
  symbol: 'EMTPY',
  logoURI: '',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
};

export const TOKEN_MAP_SYMBOL: Record<string, string> = {
  '0x3082cc23568ea640225c2467653db90e9250aaa0': 'RDNT V2',
};
