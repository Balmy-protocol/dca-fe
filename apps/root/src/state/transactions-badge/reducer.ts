import { createReducer } from '@reduxjs/toolkit';
import { updateBadgeNumber } from './actions';

export interface BadgeState {
  [chainId: number]: {
    readonly viewedTransactions: number;
  };
}

const initialState: BadgeState = {
  1: {
    viewedTransactions: 0,
  },
};

export default createReducer(initialState, (builder) => {
  builder.addCase(updateBadgeNumber, (state, action) => {
    const { viewedTransactions, chainId } = action.payload;
    if (!state[chainId]) {
      state[chainId] = { viewedTransactions: 0 };
    }
    state[chainId].viewedTransactions = viewedTransactions;
  });
});
