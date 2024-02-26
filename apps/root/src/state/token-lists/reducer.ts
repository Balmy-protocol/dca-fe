import { createReducer } from '@reduxjs/toolkit';
import find from 'lodash/find';
import { TokensLists, Token } from '@types';
import { addCustomToken, enableAllTokenList, fetchTokenList } from './actions';
import { Address } from 'viem';

export interface TokenListsWithParser extends TokensLists {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parser?: (list: any) => Token[];
  chainId?: number;
}

export interface TokenListsState {
  byUrl: { [tokenListUrl: string]: TokenListsWithParser };
  activeAllTokenLists: string[];
  hasLoaded: boolean;
  customTokens: TokensLists;
}

export const getDefaultByUrl = () => ({
  /* -------------------------------------------------------------------------- */
  /*                                   General                                  */
  /* -------------------------------------------------------------------------- */
  'https://raw.githubusercontent.com/Mean-Finance/token-lister/main/token-list-complete.json': {
    name: 'Mean Finance be',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 999,
  },
});
export const initialState: TokenListsState = {
  activeAllTokenLists: [
    // General
    'https://raw.githubusercontent.com/Mean-Finance/token-lister/main/token-list-complete.json',
    // Custom tokens
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
    priority: 0,
  },
  hasLoaded: false,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(enableAllTokenList, (state, { payload: { tokenList, enabled } }) => {
      if (enabled && !state.activeAllTokenLists.includes(tokenList)) {
        state.activeAllTokenLists.push(tokenList);
      }
      if (!enabled && state.activeAllTokenLists.includes(tokenList)) {
        state.activeAllTokenLists = state.activeAllTokenLists.filter((item) => item !== tokenList);
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
        const parser = state.byUrl[arg].parser;
        if (parser) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tokens = parser(payload as unknown as TokensLists);
        } else {
          tokens = payload.tokens;
        }

        const mappedTokens: Token[] = tokens
          .filter((token) => !!token.address)
          .map<Token>((token) => ({
            ...token,
            address: token.address.toLowerCase() as Address,
            chainId: state.byUrl[arg].chainId || token.chainId,
          }));

        state.byUrl[arg] = {
          ...state.byUrl[arg],
          ...(parser ? {} : payload),
          tokens: mappedTokens,
          hasLoaded: true,
        };
      } catch {
        state.byUrl[arg] = {
          ...state.byUrl[arg],
          tokens: [],
          hasLoaded: true,
        };
      }
    })
    .addCase(addCustomToken, (state, { payload }) => {
      const foundToken = find(state.customTokens.tokens, { address: payload.address.toLowerCase() });

      if (!foundToken) {
        state.customTokens.tokens.push({
          ...payload,
          address: payload.address.toLowerCase() as Address,
        });
      }
    });
});
