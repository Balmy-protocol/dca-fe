import { createReducer } from '@reduxjs/toolkit';
import { TransactionDetails } from 'types';
import { addTransaction, checkedTransaction, finalizeTransaction, clearAllTransactions } from './actions';

const now = () => new Date().getTime();

export interface TransactionState {
  [txHash: string]: TransactionDetails;
}

export const initialState: TransactionState = {};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTransaction, (transactions, { payload: { from, hash, approval, summary, claim, type, typeData } }) => {
      if (transactions[hash]) {
        throw Error('Attempted to add existing transaction.');
      }
      transactions[hash] = { hash, approval, summary, claim, from, addedTime: now(), type, typeData };
    })
    .addCase(checkedTransaction, (transactions, { payload: { hash, blockNumber } }) => {
      const tx = transactions[hash];
      if (!tx || !blockNumber) {
        return;
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber;
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, receipt, extendedTypeData } }) => {
      const tx = transactions[hash];
      if (!tx) {
        return;
      }
      tx.receipt = receipt;
      tx.confirmedTime = now();
      tx.typeData = {
        ...tx.typeData,
        ...extendedTypeData,
      };
    })
    .addCase(clearAllTransactions, () => {
      return initialState;
    })
);
