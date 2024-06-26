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

const TOKEN_LIST_URL = process.env.TOKEN_LIST_URL;
export const TOKEN_LIST_CURATED_URL = `${TOKEN_LIST_URL}/token-list.json`;
export const TOKEN_LIST_COMPLETE_URL = `${TOKEN_LIST_URL}/token-list-complete.json`;

export const CURATED_LISTS = [TOKEN_LIST_CURATED_URL, 'custom-tokens'];
const ALLOWED_MULTICHAIN_LISTS = [TOKEN_LIST_CURATED_URL];

export const getDefaultByUrl = () => ({
  /* -------------------------------------------------------------------------- */
  /*                                   Complete                                 */
  /* -------------------------------------------------------------------------- */
  [`${TOKEN_LIST_COMPLETE_URL}`]: {
    name: 'Balmy be',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 998,
  },
  /* -------------------------------------------------------------------------- */
  /*                                   Curated                                  */
  /* -------------------------------------------------------------------------- */
  [`${TOKEN_LIST_CURATED_URL}`]: {
    name: 'Balmy be curated',
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
    // Complete
    `${TOKEN_LIST_COMPLETE_URL}`,
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
            chainAddresses: ALLOWED_MULTICHAIN_LISTS.includes(arg) ? token.chainAddresses : [],
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
