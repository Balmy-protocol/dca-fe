import { createReducer } from '@reduxjs/toolkit';
import find from 'lodash/find';
import { TokensLists, Token } from 'types';
import {
  addCustomToken,
  enableAggregatorTokenList,
  enableTokenList,
  fetchGraphTokenList,
  fetchTokenList,
} from './actions';

export interface TokenListsWithParser extends TokensLists {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parser?: (list: any) => Token[];
  chainId?: number;
}

export interface TokenListsState {
  byUrl: { [tokenListUrl: string]: TokenListsWithParser };
  activeLists: string[];
  activeAggregatorLists: string[];
  hasLoaded: boolean;
  customTokens: TokensLists;
}

export const getDefaultByUrl = () => ({
  'https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json': {
    name: 'Mean Finance',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'tokens.1inch.eth': {
    name: '1inch',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://www.gemini.com/uniswap/manifest.json': {
    name: 'Gemini Token List',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org': {
    name: 'Uniswap Default List',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://tokens.coingecko.com/uniswap/all.json': {
    name: 'CoinGecko',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://static.optimism.io/optimism.tokenlist.json': {
    name: 'Optimism',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://tokens.1inch.io/v1.1/56': {
    name: '1Inch BSC',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 56,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
  'https://tokens.1inch.io/v1.1/250': {
    name: '1Inch FANTOM',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 250,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
  'https://tokens.1inch.io/v1.1/43114': {
    name: '1Inch AVALANCHE',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 43114,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
  'https://tokens.1inch.io/v1.1/100': {
    name: '1Inch xDAI',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 100,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
  'https://tokens.1inch.io/v1.1/42161': {
    name: '1Inch Arbitrum',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 42161,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
  'https://celo-org.github.io/celo-token-list/celo.tokenlist.json': {
    name: 'Celo token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  // 'https://extendedtokens.uniswap.org': {
  //   name: 'Uniswap extended',
  //   logoURI: '',
  //   timestamp: new Date().getTime(),
  //   tokens: [],
  //   version: { major: 0, minor: 0, patch: 0 },
  //   hasLoaded: false,
  //   requestId: '',
  //   fetchable: true,
  // },
  'https://swap.crodex.app/tokens.json': {
    name: 'Cronos',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://raw.githubusercontent.com/wagyuswapapp/wagyu-frontend/wagyu/src/config/constants/tokenLists/pancake-default.tokenlist.json':
    {
      name: 'Pancake swap wagyu',
      logoURI: '',
      timestamp: new Date().getTime(),
      tokens: [],
      version: { major: 0, minor: 0, patch: 0 },
      hasLoaded: false,
      requestId: '',
      fetchable: true,
    },
  'https://token-list.sushi.com/': {
    name: 'Sushiswap token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json': {
    name: 'Compound token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://raw.githubusercontent.com/BeamSwap/beamswap-tokenlist/main/tokenlist.json': {
    name: 'Beamswap Moonriver token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
  },
  'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=1313161554&isWhitelisted=true&pageSize=100&page=1': {
    name: 'Kyberswap aurora',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 1313161554,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: { data: { tokens: Token[] } }) => list.data.tokens,
  },
  'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=42262&isWhitelisted=true&pageSize=100&page=1': {
    name: 'Kyberswap oasis',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 42262,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: { data: { tokens: Token[] } }) => list.data.tokens,
  },
  'https://tokens.1inch.io/v1.1/8217': {
    name: '1Inch Klaytn',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 8217,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
  'https://raw.githubusercontent.com/cronaswap/default-token-list/main/assets/tokens/cronos.json': {
    name: 'Cronos cronaswap',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 25,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: Token[]) => list,
  },
  'https://tokens.1inch.io/v1.1/1313161554': {
    name: '1Inch Aurora',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 1313161554,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
});
export const initialState: TokenListsState = {
  activeLists: ['Mean Finance Graph Allowed Tokens'],
  activeAggregatorLists: [
    'https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json',
    'tokens.1inch.eth',
    'https://tokens.1inch.io/v1.1/56',
    'https://tokens.1inch.io/v1.1/250',
    'https://tokens.1inch.io/v1.1/43114',
    'https://tokens.1inch.io/v1.1/42161',
    'https://tokens.1inch.io/v1.1/100',
    'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=1313161554&isWhitelisted=true&pageSize=100&page=1',
    'https://swap.crodex.app/tokens.json',
    'https://token-list.sushi.com/',
    'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=42262&isWhitelisted=true&pageSize=100&page=1',
    'https://raw.githubusercontent.com/wagyuswapapp/wagyu-frontend/wagyu/src/config/constants/tokenLists/pancake-default.tokenlist.json',
    'https://celo-org.github.io/celo-token-list/celo.tokenlist.json',
    'https://raw.githubusercontent.com/BeamSwap/beamswap-tokenlist/main/tokenlist.json',
    // 'https://extendedtokens.uniswap.org',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://tokens.1inch.io/v1.1/8217',
    'https://tokens.1inch.io/v1.1/1313161554',
    'https://raw.githubusercontent.com/cronaswap/default-token-list/main/assets/tokens/cronos.json',
    'custom-tokens',
  ],
  byUrl: getDefaultByUrl(),
  customTokens: {
    name: 'custom-tokens',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: true,
    requestId: '',
    fetchable: true,
  },
  hasLoaded: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(enableTokenList, (state, { payload: { tokenList, enabled } }) => {
      if (enabled && !state.activeLists.includes(tokenList)) {
        state.activeLists.push(tokenList);
      }
      if (!enabled && state.activeLists.includes(tokenList)) {
        state.activeLists = state.activeLists.filter((item) => item !== tokenList);
      }
    })
    .addCase(enableAggregatorTokenList, (state, { payload: { tokenList, enabled } }) => {
      if (enabled && !state.activeAggregatorLists.includes(tokenList)) {
        state.activeAggregatorLists.push(tokenList);
      }
      if (!enabled && state.activeAggregatorLists.includes(tokenList)) {
        state.activeAggregatorLists = state.activeAggregatorLists.filter((item) => item !== tokenList);
      }
    })
    .addCase(fetchTokenList.pending, (state, { meta: { requestId, arg } }) => {
      state.byUrl[arg].requestId = requestId;
    })
    .addCase(fetchTokenList.rejected, (state, { meta: { arg } }) => {
      state.byUrl[arg] = {
        ...state.byUrl[arg],
        tokens: [],
        hasLoaded: true,
      };
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload, meta: { arg } }) => {
      let tokens = [];

      try {
        if (state.byUrl[arg].parser) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tokens = state.byUrl[arg].parser(payload as unknown as TokensLists);
        } else {
          tokens = payload.tokens;
        }

        const mappedTokens: Token[] = tokens.map<Token>((token) => ({
          ...token,
          address: token.address.toLowerCase(),
          chainId: state.byUrl[arg].chainId || token.chainId,
        }));

        state.byUrl[arg] = {
          ...state.byUrl[arg],
          ...payload,
          tokens: mappedTokens,
          hasLoaded: true,
        };
      } catch {
        state.byUrl[arg] = {
          ...state.byUrl[arg],
          ...payload,
          tokens: [],
          hasLoaded: true,
        };
      }
    })
    .addCase(fetchGraphTokenList.pending, (state, { meta: { requestId } }) => {
      state.byUrl['Mean Finance Graph Allowed Tokens'] = {
        name: 'Mean Finance',
        logoURI: '',
        timestamp: new Date().getTime(),
        tokens: [],
        version: { major: 0, minor: 0, patch: 0 },
        hasLoaded: false,
        requestId,
        fetchable: false,
      };
    })
    .addCase(fetchGraphTokenList.fulfilled, (state, { payload }) => {
      state.byUrl['Mean Finance Graph Allowed Tokens'] = {
        ...state.byUrl['Mean Finance Graph Allowed Tokens'],
        tokens: payload,
        hasLoaded: true,
      };
    })
    .addCase(addCustomToken, (state, { payload }) => {
      const foundToken = find(state.customTokens.tokens, { address: payload.address.toLowerCase() });

      if (!foundToken) {
        state.customTokens.tokens.push({
          ...payload,
          address: payload.address.toLowerCase(),
        });
      }
    })
);
