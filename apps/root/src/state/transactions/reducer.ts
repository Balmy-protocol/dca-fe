import { createReducer } from '@reduxjs/toolkit';
import { Address, TransactionDetails } from '@types';
import keys from 'lodash/keys';
import {
  addTransaction,
  checkedTransactionExist,
  checkedTransaction,
  finalizeTransaction,
  clearAllTransactions,
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
          addedTime: Date.now() / 1000,
          type,
          typeData,
          isCleared: false,
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
    .addCase(clearAllTransactions, (state, { payload: { chainId } }) => {
      const transactionKeys = keys(state[chainId]);
      transactionKeys.forEach((txHash: string) => {
        state[chainId][txHash].isCleared = true;
      });
    })
    .addCase(cleanTransactions, (state, { payload: { indexing } }) => {
      const availableChains = keys(state).map(Number);
      availableChains.forEach((chainId) => {
        const transactionKeys = keys(state[chainId]);
        transactionKeys.forEach((txHash) => {
          const tx = state[chainId][txHash];

          // We dont care about pending transactions here;
          if (!tx.receipt) return;
          const fromAddress = tx.from as Address;
          const indexedAddress = indexing[fromAddress];
          // If the address/chainId is not indexed we keep the transactions
          if (!indexedAddress) return;
          const chainIdIndexing = indexedAddress[chainId];
          if (!chainIdIndexing) return;

          // If the blocknumber of the receipt is less than the blocknumber its already processed we can safely remove the transaction
          if (tx.receipt.blockNumber < Number(chainIdIndexing.processedUpTo)) {
            delete state[chainId][txHash];
          }
        });
      });
    });
});
