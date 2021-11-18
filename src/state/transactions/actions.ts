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
    chainId: number;
  }>('transactions/addTransaction');
export const finalizeTransaction = createAction<{
  hash: string;
  receipt: TransactionReceipt;
  extendedTypeData: TransactionTypeDataOptions | Record<string, never>;
  chainId: number;
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
