import { createAction } from '@reduxjs/toolkit';
import { TransactionReceipt, TransactionTypes, TransactionTypeDataOptions } from 'types';

export const addTransaction =
  createAction<{
    hash: string;
    from: string;
    approval?: { tokenAddress: string; spender: string };
    claim?: { recipient: string };
    summary?: string;
    type: TransactionTypes;
    typeData: TransactionTypeDataOptions;
  }>('transactions/addTransaction');
export const finalizeTransaction = createAction<{
  hash: string;
  receipt: TransactionReceipt;
  extendedTypeData: TransactionTypeDataOptions | {};
}>('transactions/finalizeTransaction');
export const checkedTransaction = createAction<{
  hash: string;
  blockNumber?: number;
}>('transactions/checkedTransaction');
export const transactionFailed = createAction<{
  hash: string;
  blockNumber?: number;
}>('transactions/transactionFailed');
export const removeTransaction = createAction<{
  hash: string;
}>('transactions/removeTransaction');
export const clearAllTransactions = createAction('transactions/clearAllTransactions');
