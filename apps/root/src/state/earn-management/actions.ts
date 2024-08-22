import { TransactionAction } from '@common/components/transaction-steps';
import { createAction } from '@reduxjs/toolkit';

import { Token } from '@types';

export const setAsset = createAction<Token>('earnDeposit/setAsset');

export const setAssetAmount = createAction<string>('earnDeposit/setAssetAmount');

export const setTransactionSteps = createAction<TransactionAction[]>('earnDeposit/setTransactionSteps');

export const resetEarnDepositForm = createAction('earnDeposit/resetEarnDepositForm');
export const resetEarnWithdrawForm = createAction('earnDeposit/resetEarnWithdrawForm');
