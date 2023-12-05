import { createReducer } from '@reduxjs/toolkit';
import { Token } from '@types';
import { DEFAULT_NETWORK_FOR_TRANSFER } from '@constants';
import { setChainId, setToken, setAmount, setRecipient, resetForm } from './actions';

export interface TransferState {
  network: number;
  token: Token | null;
  amount: string;
  recipient: string;
}

const initialState: TransferState = {
  network: DEFAULT_NETWORK_FOR_TRANSFER.chainId,
  token: null,
  amount: '',
  recipient: '',
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setToken, (state, { payload }) => {
      state.token = payload;
      state.amount = '';
    })
    .addCase(setChainId, (state, { payload }) => {
      state.network = payload;
      state.token = null;
      state.amount = '';
    })
    .addCase(setAmount, (state, { payload }) => {
      state.amount = payload;
    })
    .addCase(setRecipient, (state, { payload }) => {
      state.recipient = payload;
    })
    .addCase(resetForm, (state) => {
      state.token = null;
      state.amount = '';
      state.recipient = '';
    })
);
