import { createReducer } from '@reduxjs/toolkit';
import { enableTokenList } from './actions';

export interface TokenListsState {
  [tokenListName: string]: boolean;
}

export const initialState: TokenListsState = {};

export default createReducer(initialState, (builder) =>
  builder.addCase(enableTokenList, (tokenLists, { payload: { tokenList, enabled } }) => {
    tokenLists[tokenList] = enabled;
  })
);
