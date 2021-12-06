import { createReducer } from '@reduxjs/toolkit';
import { TokensLists, Token } from 'types';
import { enableTokenList, fetchTokenList } from './actions';

export interface TokenListsState {
  byUrl: { [tokenListUrl: string]: TokensLists };
  activeLists: string[];
}

export const getDefaultByUrl = () => ({
  'https://gateway.pinata.cloud/ipfs/QmRhveZ2UB68XUhMjT7eNjgnku4AkyhKSKAJZ3i2KReHuL': {
    name: 'Mean Finance',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
  },
  'tokens.1inch.eth': {
    name: '1inch',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
  },
  'https://www.gemini.com/uniswap/manifest.json': {
    name: 'Gemini Token List',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
  },
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org': {
    name: 'Uniswap Default List',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
  },
  'https://tokens.coingecko.com/uniswap/all.json': {
    name: 'CoinGecko',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
  },
  'https://static.optimism.io/optimism.tokenlist.json': {
    name: 'Optimism',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
  },
});
export const initialState: TokenListsState = {
  activeLists: [
    'https://gateway.pinata.cloud/ipfs/QmRhveZ2UB68XUhMjT7eNjgnku4AkyhKSKAJZ3i2KReHuL',
    'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
    'https://static.optimism.io/optimism.tokenlist.json',
  ],
  byUrl: getDefaultByUrl(),
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
    .addCase(fetchTokenList.pending, (state, { meta: { requestId, arg } }) => {
      state.byUrl[arg].requestId = requestId;
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload, meta: { arg } }) => {
      const mappedTokens: Token[] = payload.tokens.map<Token>((token) => ({
        ...token,
        address: token.address.toLowerCase(),
      }));

      state.byUrl[arg] = {
        ...state.byUrl[arg],
        ...payload,
        tokens: mappedTokens,
        hasLoaded: true,
      };
    })
);
