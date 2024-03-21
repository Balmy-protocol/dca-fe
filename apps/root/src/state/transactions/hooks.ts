import { useCallback, useMemo } from 'react';
import find from 'lodash/find';
import { TransactionDetails, TransactionTypes, Token, TransactionAdderCustomData, SubmittedTransaction } from '@types';
import { useAppDispatch, useAppSelector } from '@hooks/state';
import useCurrentNetwork from '@hooks/useCurrentNetwork';

import { COMPANION_ADDRESS, HUB_ADDRESS, LATEST_VERSION } from '@constants';
import pickBy from 'lodash/pickBy';
import usePositionService from '@hooks/usePositionService';
import useArcx from '@hooks/useArcx';
import { addTransaction } from './actions';
import useWallets from '@hooks/useWallets';
import { getWalletsAddresses } from '@common/utils/accounts';
import { values } from 'lodash';

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: SubmittedTransaction,
  customData: TransactionAdderCustomData
) => void {
  const positionService = usePositionService();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const arcxClient = useArcx();

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
          chainId: currentNetwork.chainId,
          ...customData,
          position: customData.position && { ...customData.position },
        })
      );
      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        arcxClient.transaction({
          chainId: currentNetwork.chainId,
          transactionHash: hash,
          metadata: {
            type: customData.type,
            position: customData.position && customData.position.positionId,
          },
        });
      } catch (e) {
        console.error('Error sending transaction event to arcx');
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      positionService.setPendingTransaction({
        hash,
        from,
        chainId: currentNetwork.chainId,
        addedTime: new Date().getTime(),
        retries: 0,
        ...customData,
        position: customData.position && { ...customData.position },
      });
    },
    [dispatch, currentNetwork]
  );
}

export function useTransaction(txHash?: string) {
  const state = useAppSelector((appState) => appState.transactions);
  const currentNetwork = useCurrentNetwork();

  if (!txHash || !state[currentNetwork.chainId]) {
    return null;
  }

  return state[currentNetwork.chainId][txHash];
}

// returns all the transactions for the current chain
export function useAllTransactions(): TransactionDetails[] {
  const state = useAppSelector((appState) => appState.transactions);
  const wallets = useWallets();
  const mappedWallets = getWalletsAddresses(wallets);
  const transactionsByChain = values(state);
  const returnValue = useMemo(
    () =>
      transactionsByChain.reduce(
        (acc, txsOfChain) => [
          ...acc,
          ...values(txsOfChain).filter((tx) => mappedWallets.includes(tx.from.toLowerCase())),
        ],
        []
      ),
    [transactionsByChain, mappedWallets]
  );

  return returnValue || [];
}

// returns all the transactions for the current chain that are not cleared
export function useAllNotClearedTransactions(): { [txHash: string]: TransactionDetails } {
  const state = useAppSelector((appState) => appState.transactions);
  const wallets = useWallets();

  const mappedWallets = getWalletsAddresses(wallets);

  const mergedState = useMemo(
    () =>
      Object.keys(state).reduce<Record<string, TransactionDetails>>(
        (acc, value) => ({
          ...acc,
          ...state[Number(value)],
        }),
        {}
      ),
    [mappedWallets, Object.keys(state)]
  );

  const returnValue = useMemo(
    () =>
      pickBy(
        mergedState,
        (tx: TransactionDetails) => mappedWallets.includes(tx.from.toLowerCase()) && tx.isCleared === false
      ),
    [Object.keys(mergedState || {}), mappedWallets]
  );
  return returnValue || {};
}

export function useAllPendingTransactions(): { [txHash: string]: TransactionDetails } {
  const transactions = useAllTransactions();

  return useMemo(
    () =>
      Object.values(transactions)
        .filter((transaction) => !transaction.receipt)
        .reduce<{ [txHash: string]: TransactionDetails }>((acc, transaction) => {
          return { ...acc, [transaction.hash]: transaction };
        }, {}),
    [transactions]
  );
}

export function useIsTransactionPending(): (transactionHash?: string, chainId?: number) => boolean {
  const transactions = useAllTransactions();

  return useCallback(
    (transactionHash?: string) => {
      const foundTx = transactions.find(({ hash }) => hash === transactionHash);
      if (!transactionHash || !foundTx) return false;
      return !foundTx.receipt;
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

  return useMemo(() => transactions.filter(({ receipt }) => !receipt), [transactions]);
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
export function useHasPendingApproval(
  token: Token | null,
  spender: string | undefined,
  checkForCompanion = false,
  addressToCheckOverride?: string
): boolean {
  const allTransactions = useAllTransactions();
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
export function usePositionHasPendingTransaction(position: string): string | null {
  const allTransactions = useAllTransactions();

  return useMemo(() => {
    const foundTransaction = find(allTransactions, (transaction) => {
      if (!transaction) return false;
      if (
        transaction.type === TransactionTypes.newPair ||
        transaction.type === TransactionTypes.approveToken ||
        transaction.type === TransactionTypes.approveTokenExact ||
        transaction.type === TransactionTypes.swap ||
        transaction.type === TransactionTypes.wrap ||
        transaction.type === TransactionTypes.unwrap ||
        transaction.type === TransactionTypes.wrapEther ||
        transaction.type === TransactionTypes.transferToken
      )
        return false;
      if (transaction.receipt) {
        return false;
      }
      return transaction.typeData.id === position;
    });

    return foundTransaction?.hash || null;
  }, [allTransactions, position]);
}
// return wether a campaign is waiting for the claim
export function useCampaignHasPendingTransaction(campaignId: string): boolean {
  const allTransactions = useAllTransactions();

  return useMemo(
    () =>
      allTransactions.some((tx) => {
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
  const allTransactions = useAllTransactions();

  return useMemo(
    () =>
      allTransactions.some((tx) => {
        if (tx.type !== TransactionTypes.claimCampaign) return false;
        if (tx.receipt) {
          return false;
        }
        return tx.typeData.id === campaignId && tx.receipt;
      }),
    [allTransactions, campaignId]
  );
}
