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
  parser?: (list: TokensLists) => Token[];
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
});
export const initialState: TokenListsState = {
  activeLists: ['Mean Finance Graph Allowed Tokens'],
  activeAggregatorLists: [
    'https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json',
    'tokens.1inch.eth',
    'https://tokens.1inch.io/v1.1/56',
    'https://tokens.1inch.io/v1.1/250',
    'https://tokens.1inch.io/v1.1/43114',
    'https://tokens.1inch.io/v1.1/100',
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
    .addCase(fetchTokenList.fulfilled, (state, { payload, meta: { arg } }) => {
      let tokens = [];

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
