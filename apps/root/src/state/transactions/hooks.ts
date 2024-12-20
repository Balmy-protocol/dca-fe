import { useCallback, useMemo } from 'react';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import {
  TransactionDetails,
  TransactionTypes,
  Token,
  TransactionAdderCustomData,
  SubmittedTransaction,
  isDcaType,
  isEarnType,
} from '@types';
import { useAppDispatch, useAppSelector } from '@hooks/state';
import useCurrentNetwork from '@hooks/useCurrentNetwork';

import { COMPANION_ADDRESS, HUB_ADDRESS, LATEST_VERSION } from '@constants';
import usePositionService from '@hooks/usePositionService';
import { addTransaction } from './actions';
import useWallets from '@hooks/useWallets';
import useEarnService from '@hooks/earn/useEarnService';
import { Hash } from 'viem';

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: SubmittedTransaction,
  customData: TransactionAdderCustomData
) => void {
  const positionService = usePositionService();
  const earnService = useEarnService();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  return useCallback(
    (response: SubmittedTransaction, customData: TransactionAdderCustomData) => {
      const { hash, from } = response;
      if (!hash) {
        throw Error('No transaction hash found.');
      }
      dispatch(
        addTransaction({
          hash,
          from,
          chainId: response.chainId,
          ...customData,
          position: customData.position && { ...customData.position },
        })
      );

      const pendingTransaction = {
        hash,
        from,
        chainId: response.chainId,
        addedTime: Math.floor(Date.now() / 1000),
        retries: 0,
        checking: false,
        ...customData,
        position: customData.position && { ...customData.position },
      };
      // eslint-disable-next-line @typescript-eslint/no-floating-promises

      if (isDcaType(pendingTransaction)) {
        positionService.setPendingTransaction(pendingTransaction);
      }

      if (isEarnType(pendingTransaction)) {
        earnService.setPendingTransaction(pendingTransaction);
      }
    },
    [dispatch, currentNetwork]
  );
}

export function useTransaction(transaction?: { hash: Hash; chainId: number }) {
  const state = useAppSelector((appState) => appState.transactions);

  if (!transaction || !state[transaction.chainId]) {
    return null;
  }

  return state[transaction.chainId][transaction.hash];
}

// returns all the transactions
export function useTransactions(): TransactionDetails[] {
  const state = useAppSelector((appState) => appState.transactions);
  const wallets = useWallets();
  const returnValue = useMemo(
    () =>
      Object.keys(state).reduce<TransactionDetails[]>((acc, stateKey) => {
        acc.push(
          ...Object.values(state[Number(stateKey)]).filter((tx) =>
            wallets.find((wallet) => wallet.address.toLowerCase() === tx.from.toLowerCase())
          )
        );
        return acc;
      }, []),
    // pickBy(state[currentNetwork.chainId], (tx: TransactionDetails) =>
    //   wallets.find((wallet) => wallet.address.toLowerCase() === tx.from.toLowerCase())
    // ),
    [state, wallets]
  );
  return returnValue;
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useTransactions();

  return useMemo(() => {
    const tx = transactions.find(({ hash }) => hash.toLowerCase() === transactionHash?.toLowerCase());
    if (!tx) return false;
    return !tx.receipt;
  }, [transactions, transactionHash]);
}

export function useHasPendingTransactions(): boolean {
  const transactions = useTransactions();

  return useMemo(() => transactions.some((tx) => !tx.receipt), [transactions]);
}

export function usePendingTransactions(): TransactionDetails[] {
  const transactions = useTransactions();

  return useMemo(
    () =>
      reduce(
        transactions,
        (acc: TransactionDetails[], tx) => {
          if (!tx?.receipt) {
            acc.push(tx);
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
  return Math.floor(Date.now() / 1000) - tx.addedTime < 86_400_000;
}

export function isTransactionPending(tx: TransactionDetails): boolean {
  return !tx.receipt;
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(
  token: Token | null,
  spender: string | undefined,
  checkForCompanion = false,
  addressToCheckOverride?: string
): boolean {
  const allTransactions = useTransactions();
  const tokenAddress = (token && token.address) || '';
  const currentNetwork = useCurrentNetwork();
  const dcaContract = checkForCompanion
    ? COMPANION_ADDRESS[LATEST_VERSION][currentNetwork.chainId]
    : HUB_ADDRESS[LATEST_VERSION][currentNetwork.chainId];
  const addressToCheck = addressToCheckOverride || dcaContract;

  return useMemo(
    () =>
      !!token &&
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      allTransactions.some((tx) => {
        if (tx.type !== TransactionTypes.approveToken && tx.type !== TransactionTypes.approveTokenExact) return false;

        if (tx.receipt) {
          return false;
        }

        return (
          tx.typeData.token.address === tokenAddress &&
          tx.typeData.addressFor === addressToCheck &&
          tx.from.toLowerCase() === spender.toLowerCase()
        );
      }),
    [allTransactions, spender, tokenAddress, addressToCheck]
  );
}

// returns whether a token has a pending transaction
export function usePositionHasPendingTransaction(position: string, chainId: number): string | null {
  const allTransactions = useTransactions();

  return useMemo(() => {
    const foundTransaction = find(allTransactions, (transaction) => {
      if (!isDcaType(transaction)) {
        return false;
      }
      if (transaction.receipt) {
        return false;
      }
      return transaction.typeData.id === position && chainId === transaction.chainId;
    });

    return foundTransaction?.hash || null;
  }, [allTransactions, position]);
}
// return wether a campaign is waiting for the claim
export function useCampaignHasPendingTransaction(campaignId: string): boolean {
  const allTransactions = useTransactions();

  return useMemo(
    () =>
      allTransactions.some((tx) => {
        if (!tx) return false;
        if (tx.type !== TransactionTypes.claimCampaign) return false;
        if (tx.receipt) {
          return false;
        }
        return tx.typeData.id === campaignId && !tx.receipt;
      }),
    [allTransactions, campaignId]
  );
}
// return wether a campaign is waiting for the claim
export function useCampaignHasConfirmedTransaction(campaignId: string): boolean {
  const allTransactions = useTransactions();

  return useMemo(
    () =>
      allTransactions.some((tx) => {
        if (!tx) return false;
        if (tx.type !== TransactionTypes.claimCampaign) return false;
        if (tx.receipt) {
          return false;
        }
        return tx.typeData.id === campaignId && tx.receipt;
      }),
    [allTransactions, campaignId]
  );
}
