import { createReducer, nanoid } from '@reduxjs/toolkit';
import { updateBlockNumber } from './actions';

export interface ApplicationState {
  [chainId: number]: {
    readonly blockNumber: number | null;
  };
}

const initialState: ApplicationState = {};

export default createReducer(initialState, (builder) =>
  builder.addCase(updateBlockNumber, (state, action) => {
    const { blockNumber, chainId } = action.payload;
    if (!state[chainId]) {
      state[chainId] = { blockNumber: null };
    }
    state[chainId].blockNumber = blockNumber;
  })
);
