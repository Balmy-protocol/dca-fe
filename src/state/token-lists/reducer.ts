import { createReducer } from '@reduxjs/toolkit';
import { enableTokenList } from './actions';

export interface TokenListsState {
  [tokenListName: string]: boolean;
}

export const initialState: TokenListsState = {
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org': true,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(enableTokenList, (state, { payload: { tokenList, enabled } }) => {
    state[tokenList] = enabled;
  })
);
