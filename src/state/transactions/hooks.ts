import { TransactionResponse } from '@ethersproject/providers';
import { useCallback, useMemo } from 'react';
import { TransactionDetails, TransactionTypes, TransactionTypeDataOptions } from 'types';
import { useAppDispatch, useAppSelector } from 'hooks/state';

import useWeb3Service from 'hooks/useWeb3Service';
import { addTransaction } from './actions';
import { TRANSACTION_TYPES } from 'config/constants';

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  customData: {
    summary?: string;
    approval?: { tokenAddress: string; spender: string };
    claim?: { recipient: string };
    type: TransactionTypes;
    typeData: TransactionTypeDataOptions;
  }
) => void {
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();

  return useCallback(
    (
      response: TransactionResponse,
      {
        summary,
        approval,
        claim,
        type,
        typeData,
      }: {
        type: TransactionTypes;
        typeData: TransactionTypeDataOptions;
        summary?: string;
        claim?: { recipient: string };
        approval?: { tokenAddress: string; spender: string };
      } = { type: TRANSACTION_TYPES.NO_OP, typeData: { id: 'NO_OP' } }
    ) => {
      if (!web3Service.getAccount()) return;

      const { hash } = response;
      if (!hash) {
        throw Error('No transaction hash found.');
      }
      dispatch(addTransaction({ hash, from: web3Service.getAccount(), approval, summary, claim, type, typeData }));
    },
    [dispatch, web3Service.getAccount()]
  );
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const state = useAppSelector((state) => state.transactions);

  return state || {};
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions();

  if (!transactionHash || !transactions[transactionHash]) return false;

  return !transactions[transactionHash].receipt;
}

export function useHasPendingTransactions(): boolean {
  const transactions = useAllTransactions();

  return useMemo(() => Object.keys(transactions).some((hash) => !transactions[hash].receipt), [transactions]);
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

export function isTransactionPending(tx: TransactionDetails): boolean {
  return !tx.receipt;
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions();
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash];
        if (!tx) return false;
        if (tx.receipt) {
          return false;
        } else {
          const approval = tx.approval;
          if (!approval) return false;
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx);
        }
      }),
    [allTransactions, spender, tokenAddress]
  );
}
