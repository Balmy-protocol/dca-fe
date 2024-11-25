import { createReducer } from '@reduxjs/toolkit';

import { Token } from '@types';
import { setAsset, setDepositAmount, resetEarnForm, setWithdrawAmount, setWithdrawRewards } from './actions';

export interface EarnManagementState {
  asset?: Token;
  depositAmount?: string;
  withdrawAmount?: string;
  withdrawRewards: boolean;
  chainId?: number;
}

export const initialState: EarnManagementState = {
  asset: undefined,
  depositAmount: undefined,
  withdrawAmount: undefined,
  withdrawRewards: false,
  chainId: undefined,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setAsset, (state, { payload }) => {
      state.asset = payload;
      state.chainId = payload.chainId;
    })
    .addCase(setDepositAmount, (state, { payload }) => {
      state.depositAmount = payload;
    })
    .addCase(setWithdrawAmount, (state, { payload }) => {
      state.withdrawAmount = payload;
    })
    .addCase(setWithdrawRewards, (state, { payload }) => {
      state.withdrawRewards = payload;
    })
    .addCase(resetEarnForm, (state) => {
      return {
        ...initialState,
        asset: state.asset,
        chainId: state.chainId,
      };
    });
});
