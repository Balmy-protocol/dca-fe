import { createReducer } from '@reduxjs/toolkit';
import { TransactionDetails } from '@types';
import {
  addTransaction,
  checkedTransactionExist,
  checkedTransaction,
  finalizeTransaction,
  transactionFailed,
  removeTransaction,
  setTransactionsChecking,
  cleanTransactions,
} from './actions';

const now = () => new Date().getTime();

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails;
  };
}

export const initialState: TransactionState = {};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(
      addTransaction,
      (state, { payload: { from, hash, approval, summary, claim, type, typeData, chainId, position } }) => {
        if (state[chainId] && state[chainId][hash]) {
          throw Error('Attempted to add existing transaction.');
        }
        if (!state[chainId]) {
          state[chainId] = {};
        }
        state[chainId][hash] = {
          hash,
          approval,
          summary,
          claim,
          from,
          addedTime: Math.floor(Date.now() / 1000),
          type,
          typeData,
          retries: 0,
          chainId,
          position,
          checking: false,
        } as TransactionDetails;
      }
    )
    .addCase(setTransactionsChecking, (state, { payload }) => {
      payload.forEach(({ hash, chainId }) => {
        if (!state[chainId] || !state[chainId][hash]) {
          console.error('Attempted to check inexisting transaction.');
        }

        state[chainId][hash].checking = true;
        state[chainId][hash].lastCheckedAt = Date.now();
      });
    })
    .addCase(checkedTransaction, (state, { payload: { hash, chainId } }) => {
      if (!state[chainId] || !state[chainId][hash]) {
        console.error('Attempted to check inexisting transaction.');
        return;
      }

      state[chainId][hash].checking = false;
    })
    .addCase(checkedTransactionExist, (state, { payload: { hash, blockNumber, chainId } }) => {
      const tx = state[chainId][hash];
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
    .addCase(transactionFailed, (state, { payload: { hash, blockNumber, chainId } }) => {
      const tx = state[chainId][hash];
      if (!tx || !blockNumber) {
        return;
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber;
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
      }
      tx.retries += 1;
      state[chainId][hash].lastCheckedAt = Date.now();
    })
    .addCase(finalizeTransaction, (state, { payload: { hash, receipt, extendedTypeData, chainId, realSafeHash } }) => {
      const tx = state[chainId][hash];
      if (!tx) {
        return;
      }
      tx.receipt = receipt;
      tx.confirmedTime = now();
      tx.typeData = {
        ...tx.typeData,
        ...extendedTypeData,
      };
      tx.realSafeHash = realSafeHash;
    })
    .addCase(removeTransaction, (state, { payload: { hash, chainId } }) => {
      const tx = state[chainId][hash];
      if (!tx) {
        return;
      }
      delete state[chainId][hash];
    })
    .addCase(cleanTransactions, (state, { payload: { indexedTransactions } }) => {
      indexedTransactions.forEach(({ chainId, hash }) => {
        delete state[chainId][hash];
      });
    });
});
