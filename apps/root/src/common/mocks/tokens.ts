import { getGhTokenListLogoUrl, NETWORKS, TESTNETS } from '@constants';
import find from 'lodash/find';
import { ChainId, Token, TokenType } from '@types';
import { toToken } from '@common/utils/currency';
import { Address } from 'viem';
import { Chains, getAllChains } from '@balmy/sdk';

const RAW_WETH_ADDRESSES: Record<number, Address> = {
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
  [Chains.BASE.chainId]: Chains.BASE.wToken,
};

const WETH_ADDRESSES = getAllChains().reduce(
  (acc, sdkNetwork) => {
    // eslint-disable-next-line no-param-reassign
    acc[sdkNetwork.chainId] = RAW_WETH_ADDRESSES[sdkNetwork.chainId] || sdkNetwork.wToken;
    return acc;
  },
  {
    ...RAW_WETH_ADDRESSES,
  }
);

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

export const WRBTC: Token = {
  chainId: 30,
  decimals: 18,
  address: Chains.ROOTSTOCK.wToken,
  name: 'Wrapped BTC',
  symbol: 'WRBTC',
  type: TokenType.WRAPPED_PROTOCOL_TOKEN,
  underlyingTokens: [],
  logoURI: 'https://raw.githubusercontent.com/balmy-protocol/token-list/main/assets/chains/30/logo.svg',
  chainAddresses: [],
};

export const WMNT: Token = {
  chainId: Chains.MANTLE.chainId,
  decimals: 18,
  address: Chains.MANTLE.wToken,
  name: 'Wrapped Mantle',
  symbol: 'WMNT',
  type: TokenType.WRAPPED_PROTOCOL_TOKEN,
  underlyingTokens: [],
  logoURI: 'https://raw.githubusercontent.com/balmy-protocol/token-list/main/assets/chains/5000/logo.svg',
  chainAddresses: [],
};

export const ETH_COMPANION_ADDRESS: Address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const PROTOCOL_TOKEN_ADDRESS: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const ETH_CHAINS = [
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
  NETWORKS.base.chainId,
  NETWORKS.mode.chainId,
  NETWORKS.scroll.chainId,
  NETWORKS.blast.chainId,
  NETWORKS.linea.chainId,
  Chains.MODE.chainId,
  Chains.BLAST.chainId,
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

export const RBTC: Token = {
  chainId: Chains.ROOTSTOCK.chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Rootstock BTC',
  symbol: 'RBTC',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/balmy-protocol/token-list/main/assets/chains/30/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.svg',
  chainAddresses: [
    {
      chainId: Chains.ROOTSTOCK.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
};

export const BNB = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'BNB',
  symbol: 'BNB',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [
    {
      chainId: NETWORKS.bsc.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
});

export const FTM = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Fantom',
  symbol: 'FTM',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [
    {
      chainId: NETWORKS.fantom.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
});

export const AVAX = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Avalanche',
  symbol: 'AVAX',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [
    {
      chainId: NETWORKS.avalanche.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
});

export const HT = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Huobi',
  symbol: 'HT',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [
    {
      chainId: NETWORKS.heco.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
});

export const XDAI = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'xDAI',
  symbol: 'xDAI',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [
    {
      chainId: NETWORKS.xdai.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
});

export const MATIC = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Polygon Ecosystem Token',
  symbol: 'POL',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png',
  chainAddresses: [
    {
      chainId: NETWORKS.polygon.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
});

const WMATIC_ADDRESSES: Record<number, Address> = {
  [NETWORKS.polygon.chainId]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
};

export const WMATIC = (chainId: number): Token => ({
  chainId,
  decimals: 18,
  address: WMATIC_ADDRESSES[chainId] || WMATIC_ADDRESSES[1],
  name: 'Wrapped POL',
  symbol: 'WPOL',
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

export const MNT: Token = {
  chainId: Chains.MANTLE.chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Mantle',
  symbol: 'MNT',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI:
    'https://raw.githubusercontent.com/balmy-protocol/token-list/main/assets/chains/5000/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.svg',
  chainAddresses: [],
};

export const SONIC: Token = {
  chainId: Chains.SONIC.chainId,
  decimals: 18,
  address: PROTOCOL_TOKEN_ADDRESS,
  name: 'Sonic',
  symbol: 'S',
  type: TokenType.BASE,
  logoURI:
    'https://raw.githubusercontent.com/balmy-protocol/token-list/main/assets/chains/146/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.svg',
  underlyingTokens: [],
  chainAddresses: [
    {
      chainId: Chains.SONIC.chainId,
      address: PROTOCOL_TOKEN_ADDRESS,
    },
  ],
};

export const WRAPPED_SONIC: Token = {
  chainId: Chains.SONIC.chainId,
  decimals: 18,
  address: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
  name: 'Wrapped Sonic',
  symbol: 'wS',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
};

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
  [Chains.ROOTSTOCK.chainId]: () => RBTC,
  [Chains.MANTLE.chainId]: () => MNT,
  [Chains.SONIC.chainId]: () => SONIC,
};

export const WRAPPED_PROTOCOL_TOKEN = {
  ...generateChainBasedTokens(ETH_CHAINS, WETH),
  [NETWORKS.polygon.chainId]: WMATIC,
  [NETWORKS.mumbai.chainId]: WMATIC,
  [NETWORKS.xdai.chainId]: WXDAI,
  [NETWORKS.moonbeam.chainId]: WGLMR,
  [Chains.ROOTSTOCK.chainId]: () => WRBTC,
  [Chains.MANTLE.chainId]: () => WMNT,
  [Chains.SONIC.chainId]: () => WRAPPED_SONIC,
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
