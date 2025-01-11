import { createReducer } from '@reduxjs/toolkit';

import { Token } from '@types';
import {
  setAsset,
  setDepositAmount,
  resetEarnForm,
  setWithdrawAmount,
  setWithdrawRewards,
  setDepositAsset,
  setDepositAssetAmount,
  fullyResetEarnForm,
} from './actions';

export interface EarnManagementState {
  asset?: Token;
  depositAmount?: string;
  depositAssetAmount?: string;
  depositAsset?: Token;
  withdrawAmount?: string;
  withdrawRewards: boolean;
  chainId?: number;
}

export const initialState: EarnManagementState = {
  asset: undefined,
  depositAssetAmount: undefined,
  depositAsset: undefined,
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
    .addCase(setDepositAssetAmount, (state, { payload }) => {
      state.depositAssetAmount = payload;
    })
    .addCase(setDepositAsset, (state, { payload }) => {
      state.depositAsset = payload;
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
    })
    .addCase(fullyResetEarnForm, () => {
      return {
        ...initialState,
      };
    });
});
