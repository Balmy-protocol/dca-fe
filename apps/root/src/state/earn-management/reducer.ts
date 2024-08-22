import { createReducer } from '@reduxjs/toolkit';

import { Token } from '@types';
import { setAsset, setAssetAmount, resetEarnDepositForm, resetEarnWithdrawForm, setTransactionSteps } from './actions';
import { TransactionAction } from '@common/components/transaction-steps';

export enum EarnActionType {
  deposit = 'deposit',
  withdraw = 'withdraw',
}
export interface EarnManagementState {
  asset?: Token;
  assetAmount?: string;
  chainId?: number;
  type: EarnActionType;
  transactionSteps: TransactionAction[];
}

export const initialState: EarnManagementState = {
  asset: undefined,
  assetAmount: undefined,
  chainId: undefined,
  type: EarnActionType.deposit,
  transactionSteps: [],
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setAsset, (state, { payload }) => {
      state.asset = payload;
      state.chainId = payload.chainId;
    })
    .addCase(setAssetAmount, (state, { payload }) => {
      state.assetAmount = payload;
    })
    .addCase(setTransactionSteps, (state, { payload }) => {
      state.transactionSteps = payload;
    })
    .addCase(resetEarnDepositForm, (state) => {
      return {
        ...initialState,
        asset: state.asset,
        chainId: state.chainId,
        type: EarnActionType.deposit,
      };
    })
    .addCase(resetEarnWithdrawForm, (state) => {
      return {
        ...initialState,
        asset: state.asset,
        chainId: state.chainId,
        type: EarnActionType.withdraw,
      };
    });
});
