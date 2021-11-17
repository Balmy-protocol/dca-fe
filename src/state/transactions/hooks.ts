import { TransactionResponse } from '@ethersproject/providers';
import { useCallback, useMemo } from 'react';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import {
  TransactionDetails,
  TransactionTypes,
  TransactionTypeDataOptions,
  ApproveTokenTypeData,
  NewPairTypeData,
  Token,
  TransactionPositionTypeDataOptions,
} from 'types';
import { useAppDispatch, useAppSelector } from 'hooks/state';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

import useWeb3Service from 'hooks/useWeb3Service';
import { TRANSACTION_TYPES } from 'config/constants';
import pickBy from 'lodash/pickBy';
import { addTransaction } from './actions';

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
  const currentNetwork = useCurrentNetwork();

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
      dispatch(
        addTransaction({
          hash,
          from: web3Service.getAccount(),
          approval,
          summary,
          claim,
          type,
          typeData,
          chainId: currentNetwork.chainId,
        })
      );
      web3Service.setPendingTransaction({
        hash,
        from: web3Service.getAccount(),
        approval,
        summary,
        claim,
        type,
        typeData,
        addedTime: new Date().getTime(),
        retries: 0,
      });
    },
    [dispatch, web3Service.getAccount(), currentNetwork]
  );
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const state = useAppSelector((state) => state.transactions);
  const web3Service = useWeb3Service();
  const currentNetwork = useCurrentNetwork();

  const returnValue = useMemo(
    () => pickBy(state[currentNetwork.chainId], (tx: TransactionDetails) => tx.from === web3Service.getAccount()),
    [Object.keys(state[currentNetwork.chainId] || {}), web3Service.getAccount(), currentNetwork]
  );
  return returnValue || {};
}

// returns all the transactions for the current chain that are not cleared
export function useAllNotClearedTransactions(): { [txHash: string]: TransactionDetails } {
  const state = useAppSelector((state) => state.transactions);
  const web3Service = useWeb3Service();
  const currentNetwork = useCurrentNetwork();

  const returnValue = useMemo(
    () =>
      pickBy(
        state[currentNetwork.chainId],
        (tx: TransactionDetails) => tx.from === web3Service.getAccount() && tx.isCleared === false
      ),
    [Object.keys(state[currentNetwork.chainId] || {}), web3Service.getAccount(), currentNetwork]
  );
  return returnValue || {};
}

export function useIsTransactionPending(): (transactionHash?: string) => boolean {
  const transactions = useAllTransactions();

  return useCallback(
    (transactionHash?: string) => {
      if (!transactionHash || !transactions[transactionHash]) return false;
      return !transactions[transactionHash].receipt;
    },
    [transactions]
  );
}

export function useHasPendingTransactions(): boolean {
  const transactions = useAllNotClearedTransactions();

  return useMemo(() => Object.keys(transactions).some((hash) => !transactions[hash].receipt), [transactions]);
}

export function usePendingTransactions(): TransactionDetails[] {
  const transactions = useAllTransactions();

  return useMemo(
    () =>
      reduce(
        Object.keys(transactions),
        (acc: TransactionDetails[], hash) => {
          if (!transactions[hash].receipt) {
            acc.push(transactions[hash]);
          }

          return acc;
        },
        []
      ),
    [transactions]
  );
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
export function useHasPendingApproval(token: Token, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions();
  const tokenAddress = token.address;
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        if (allTransactions[hash].type !== TRANSACTION_TYPES.APPROVE_TOKEN) return false;
        const tx = allTransactions[hash];
        if (tx.receipt) {
          return false;
        }
        return (
          (<ApproveTokenTypeData>tx.typeData).pair === spender &&
          (<ApproveTokenTypeData>tx.typeData).token.address === tokenAddress
        );
      }),
    [allTransactions, spender, tokenAddress]
  );
}

// returns whether a ETH has a pending WRAP transaction
export function useHasPendingWrap(): boolean {
  const allTransactions = useAllTransactions();
  return useMemo(
    () =>
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        if (allTransactions[hash].type !== TRANSACTION_TYPES.WRAP_ETHER) return false;
        const tx = allTransactions[hash];
        return !tx.receipt;
      }),
    [allTransactions]
  );
}

// returns whether a token has a pending approval transaction
export function useHasPendingPairCreation(from: Token, to: Token): boolean {
  const allTransactions = useAllTransactions();
  const fromAddress = from.address;
  const toAddress = to.address;

  return useMemo(
    () =>
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        if (allTransactions[hash].type !== TRANSACTION_TYPES.NEW_PAIR) return false;
        const tx = allTransactions[hash];
        if (tx.receipt) {
          return false;
        }
        return (
          (<NewPairTypeData>tx.typeData).token0.address === fromAddress &&
          (<NewPairTypeData>tx.typeData).token1.address === toAddress
        );
      }),
    [allTransactions, fromAddress, toAddress]
  );
}

// returns whether a token has a pending approval transaction
export function usePositionHasPendingTransaction(position: string): string | null {
  const allTransactions = useAllTransactions();

  return useMemo(() => {
    const foundTransaction = find(allTransactions, (transaction) => {
      if (!transaction) return false;
      if (
        transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
        transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
        transaction.type === TRANSACTION_TYPES.WRAP_ETHER
      )
        return false;
      if (transaction.receipt) {
        return false;
      }
      return (<TransactionPositionTypeDataOptions>transaction.typeData).id === position;
    });

    return foundTransaction?.hash || null;
  }, [allTransactions, position]);
}

// returns whether a token has been approved transaction
export function useHasConfirmedApproval(token: Token, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions();
  const tokenAddress = token.address;
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        if (allTransactions[hash].type !== TRANSACTION_TYPES.APPROVE_TOKEN) return false;
        const tx = allTransactions[hash];
        return (
          tx.receipt &&
          (<ApproveTokenTypeData>tx.typeData).pair === spender &&
          (<ApproveTokenTypeData>tx.typeData).token.address === tokenAddress
        );
      }),
    [allTransactions, spender, tokenAddress]
  );
}
