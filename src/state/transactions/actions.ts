import { createAction } from '@reduxjs/toolkit';
import { TransactionReceipt, TransactionTypeDataOptions, TransactionAdderPayload } from '@types';

export const addTransaction = createAction<TransactionAdderPayload>('transactions/addTransaction');
export const finalizeTransaction = createAction<{
  hash: string;
  receipt: TransactionReceipt;
  extendedTypeData: TransactionTypeDataOptions | Record<string, never>;
  chainId: number;
  realSafeHash?: string;
}>('transactions/finalizeTransaction');
export const checkedTransaction = createAction<{
  hash: string;
  blockNumber?: number;
  chainId: number;
}>('transactions/checkedTransaction');
export const transactionFailed = createAction<{
  hash: string;
  blockNumber?: number;
  chainId: number;
}>('transactions/transactionFailed');
export const removeTransaction = createAction<{
  hash: string;
  chainId: number;
}>('transactions/removeTransaction');
export const clearAllTransactions = createAction<{
  chainId: number;
}>('transactions/clearAllTransactions');
