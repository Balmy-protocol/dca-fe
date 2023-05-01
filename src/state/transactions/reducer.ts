import { createReducer } from '@reduxjs/toolkit';
import { TransactionDetails } from '@types';
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
          addedTime: now(),
          type,
          typeData,
          isCleared: false,
          retries: 0,
          chainId,
          position,
        };
      }
    )
    .addCase(checkedTransaction, (state, { payload: { hash, blockNumber, chainId } }) => {
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
    .addCase(clearAllTransactions, (state, { payload: { chainId } }) => {
      const transactionKeys = keys(state[chainId]);
      transactionKeys.forEach((txHash: string) => {
        state[chainId][txHash].isCleared = true;
      });
    })
);
