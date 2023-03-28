import { getGhTokenListLogoUrl, NETWORKS, TOKEN_TYPE_BASE, TOKEN_TYPE_WRAPPED } from 'config/constants';
import find from 'lodash/find';
import { Token } from 'types';
import { toToken } from 'utils/currency';

const DAI_ADDRESSES = {
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
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
});

const WETH_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.ropsten.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.rinkeby.chainId]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [NETWORKS.meanfinance.chainId]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [NETWORKS.goerli.chainId]: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
  [NETWORKS.kovan.chainId]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  [NETWORKS.optimismKovan.chainId]: '0x4200000000000000000000000000000000000006',
  [NETWORKS.optimism.chainId]: '0x4200000000000000000000000000000000000006',
  [NETWORKS.arbitrum.chainId]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
};

export const WETH = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: WETH_ADDRESSES[chainId] || WETH_ADDRESSES[1],
  name: 'Wrapped Ether',
  symbol: 'WETH',
  type: TOKEN_TYPE_WRAPPED,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
});

const USDC_ADDRESSES = {
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
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
});

export const ETH_COMPANION_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const PROTOCOL_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const ETH = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Ethereum',
  symbol: 'ETH',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
});

export const BNB = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'BNB',
  symbol: 'BNB',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
});

export const FTM = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Fantom',
  symbol: 'FTM',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
});

export const AVAX = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Avalanche',
  symbol: 'AVAX',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
});

export const HT = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Huobi',
  symbol: 'HT',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
});

export const XDAI = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'xDAI',
  symbol: 'xDAI',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
});

export const MATIC = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Matic',
  symbol: 'MATIC',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png',
});

const WMATIC_ADDRESSES = {
  [NETWORKS.polygon.chainId]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  [NETWORKS.mumbai.chainId]: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
};

export const WMATIC = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: WMATIC_ADDRESSES[chainId] || WMATIC_ADDRESSES[1],
  name: 'Wrapped Matic',
  symbol: 'WMATIC',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI: 'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
});

export const PROTOCOL_TOKEN = {
  [NETWORKS.mainnet.chainId]: ETH,
  [NETWORKS.ropsten.chainId]: ETH,
  [NETWORKS.rinkeby.chainId]: ETH,
  [NETWORKS.goerli.chainId]: ETH,
  [NETWORKS.kovan.chainId]: ETH,
  [NETWORKS.polygon.chainId]: MATIC,
  [NETWORKS.mumbai.chainId]: MATIC,
  [NETWORKS.optimismKovan.chainId]: ETH,
  [NETWORKS.optimism.chainId]: ETH,
  [NETWORKS.optimismGoerli.chainId]: ETH,
  [NETWORKS.arbitrum.chainId]: ETH,
  [NETWORKS.bsc.chainId]: BNB,
  [NETWORKS.fantom.chainId]: FTM,
  [NETWORKS.avalanche.chainId]: AVAX,
  [NETWORKS.heco.chainId]: HT,
  [NETWORKS.xdai.chainId]: XDAI,
};

export const WRAPPED_PROTOCOL_TOKEN = {
  [NETWORKS.mainnet.chainId]: WETH,
  [NETWORKS.ropsten.chainId]: WETH,
  [NETWORKS.rinkeby.chainId]: WETH,
  [NETWORKS.goerli.chainId]: WETH,
  [NETWORKS.kovan.chainId]: WETH,
  [NETWORKS.polygon.chainId]: WMATIC,
  [NETWORKS.mumbai.chainId]: WMATIC,
  [NETWORKS.optimismKovan.chainId]: WETH,
  [NETWORKS.optimismGoerli.chainId]: WETH,
  [NETWORKS.optimism.chainId]: WETH,
  [NETWORKS.arbitrum.chainId]: WETH,
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

const UNI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.ropsten.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.rinkeby.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.meanfinance.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.goerli.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  [NETWORKS.kovan.chainId]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
};

export const UNI = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: UNI_ADDRESSES[chainId] || UNI_ADDRESSES[1],
  name: 'Uniswap',
  symbol: 'UNI',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
});

const USDT_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  [NETWORKS.kovan.chainId]: '0x07de306ff27a2b630b1141956844eb1552b956b5',
};

export const USDT = (chainId: number): Token => ({
  chainId,
  decimals: 6,
  address: USDT_ADDRESSES[chainId] || USDT_ADDRESSES[1],
  name: 'Tether USD',
  symbol: 'USDT',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
});

const WBTC_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  [NETWORKS.kovan.chainId]: '0x68f180fcce6836688e9084f035309e29bf0a2095',
};

export const WBTC = (chainId: number): Token => ({
  chainId,
  decimals: 8,
  address: WBTC_ADDRESSES[chainId] || WBTC_ADDRESSES[1],
  name: 'Wrapped BTC',
  symbol: 'WBTC',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
});

const CDAI_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
  [NETWORKS.kovan.chainId]: '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad',
};

export const CDAI = (chainId: number): Token => ({
  chainId,
  decimals: 8,
  address: CDAI_ADDRESSES[chainId] || CDAI_ADDRESSES[1],
  name: 'Compound DAI',
  symbol: 'cDAI',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
});

const CUSDC_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
  [NETWORKS.kovan.chainId]: '0x4a92e71227d294f041bd82dd8f78591b75140d63',
};

export const CUSDC = (chainId: number): Token => ({
  chainId,
  decimals: 8,
  address: CUSDC_ADDRESSES[chainId] || CUSDC_ADDRESSES[1],
  name: 'Compound USDC',
  symbol: 'cUSDC',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
});

const MKR_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  [NETWORKS.kovan.chainId]: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
};

export const MKR = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: MKR_ADDRESSES[chainId] || MKR_ADDRESSES[1],
  name: 'MakerDAO',
  symbol: 'MKR',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2/logo.png',
});

const COMP_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xc00e94cb662c3520282e6f5717214004a7f26888',
  [NETWORKS.kovan.chainId]: '0x61460874a7196d6a22d1ee4922473664b3e95270',
};

export const COMP = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: COMP_ADDRESSES[chainId] || COMP_ADDRESSES[1],
  name: 'Compound',
  symbol: 'COMP',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png',
});

const LINK_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0x514910771af9ca656af840dff83e8264ecf986ca',
  [NETWORKS.kovan.chainId]: '0xa36085f69e2889c224210f603d836748e7dc0088',
};

export const LINK = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: LINK_ADDRESSES[chainId] || LINK_ADDRESSES[1],
  name: 'ChainLink',
  symbol: 'LINK',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
});

const SNX_ADDRESSES = {
  [NETWORKS.mainnet.chainId]: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  [NETWORKS.kovan.chainId]: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
};

export const SNX = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: SNX_ADDRESSES[chainId] || SNX_ADDRESSES[1],
  name: 'SNX',
  symbol: 'SNX',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
});

export const EMPTY_TOKEN: Token = {
  chainId: -1,
  decimals: 18,
  address: 'none',
  name: 'EMPTY',
  symbol: 'EMTPY',
  logoURI: '',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
};

export const KOVAN_TOKENS = {
  [PROTOCOL_TOKEN_ADDRESS]: ETH(NETWORKS.kovan.chainId),
  [DAI_ADDRESSES[NETWORKS.kovan.chainId]]: DAI(NETWORKS.kovan.chainId),
  [WETH_ADDRESSES[NETWORKS.kovan.chainId]]: WETH(NETWORKS.kovan.chainId),
  [USDC_ADDRESSES[NETWORKS.kovan.chainId]]: USDC(NETWORKS.kovan.chainId),
  [UNI_ADDRESSES[NETWORKS.kovan.chainId]]: UNI(NETWORKS.kovan.chainId),
  [USDT_ADDRESSES[NETWORKS.kovan.chainId]]: USDT(NETWORKS.kovan.chainId),
  [WBTC_ADDRESSES[NETWORKS.kovan.chainId]]: WBTC(NETWORKS.kovan.chainId),
  [CDAI_ADDRESSES[NETWORKS.kovan.chainId]]: CDAI(NETWORKS.kovan.chainId),
  [CUSDC_ADDRESSES[NETWORKS.kovan.chainId]]: CUSDC(NETWORKS.kovan.chainId),
  [MKR_ADDRESSES[NETWORKS.kovan.chainId]]: MKR(NETWORKS.kovan.chainId),
  [COMP_ADDRESSES[NETWORKS.kovan.chainId]]: COMP(NETWORKS.kovan.chainId),
  [LINK_ADDRESSES[NETWORKS.kovan.chainId]]: LINK(NETWORKS.kovan.chainId),
  [SNX_ADDRESSES[NETWORKS.kovan.chainId]]: SNX(NETWORKS.kovan.chainId),
};

export const TOKEN_MAP_SYMBOL: Record<string, string> = {
  '0x3082cc23568ea640225c2467653db90e9250aaa0': 'RDNT V2',
};
