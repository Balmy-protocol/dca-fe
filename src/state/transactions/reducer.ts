import { createReducer } from '@reduxjs/toolkit';
import { TransactionDetails } from 'types';
import keys from 'lodash/keys';
import {
  addTransaction,
  checkedTransaction,
  finalizeTransaction,
  clearAllTransactions,
  transactionFailed,
  removeTransaction,
} from './actions';

const now = () => new Date().getTime();

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails;
  };
}

export const initialState: TransactionState = {};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      addTransaction,
      (transactions, { payload: { from, hash, approval, summary, claim, type, typeData, chainId } }) => {
        if (transactions[chainId] && transactions[chainId][hash]) {
          throw Error('Attempted to add existing transaction.');
        }
        if (!transactions[chainId]) {
          transactions[chainId] = {};
        }
        transactions[chainId][hash] = {
          hash,
          approval,
          summary,
          claim,
          from,
          addedTime: now(),
          type,
          typeData,
          isCleared: false,
          retries: 0,
        };
      }
    )
    .addCase(checkedTransaction, (transactions, { payload: { hash, blockNumber, chainId } }) => {
      const tx = transactions[chainId][hash];
      if (!tx || !blockNumber) {
        return;
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber;
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
      }
      tx.retries = 0;
    })
    .addCase(transactionFailed, (transactions, { payload: { hash, blockNumber, chainId } }) => {
      const tx = transactions[chainId][hash];
      if (!tx || !blockNumber) {
        return;
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber;
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
      }
      tx.retries = tx.retries + 1;
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, receipt, extendedTypeData, chainId } }) => {
      const tx = transactions[chainId][hash];
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
    .addCase(removeTransaction, (transactions, { payload: { hash, chainId } }) => {
      const tx = transactions[chainId][hash];
      if (!tx) {
        return;
      }
      delete transactions[chainId][hash];
    })
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      const transactionKeys = keys(transactions[chainId]);
      transactionKeys.forEach((txHash: string) => (transactions[chainId][txHash].isCleared = true));
    })
);
