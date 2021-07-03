import { createAction } from '@reduxjs/toolkit';
import { TransactionReceipt } from 'types';

export const addTransaction =
  createAction<{
    hash: string;
    from: string;
    approval?: { tokenAddress: string; spender: string };
    claim?: { recipient: string };
    summary?: string;
  }>('transactions/addTransaction');
export const finalizeTransaction = createAction<{
  hash: string;
  receipt: TransactionReceipt;
}>('transactions/finalizeTransaction');
export const checkedTransaction = createAction<{
  hash: string;
  blockNumber: number;
}>('transactions/checkedTransaction');
