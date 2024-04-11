import { useCallback, useMemo } from 'react';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import {
  TransactionDetails,
  TransactionTypes,
  Token,
  TransactionAdderCustomData,
  SubmittedTransaction,
  TransactionApiIndexing,
} from '@types';
import { useAppDispatch, useAppSelector } from '@hooks/state';
import useCurrentNetwork from '@hooks/useCurrentNetwork';

import { COMPANION_ADDRESS, DCA_TYPE_TRANSACTIONS, HUB_ADDRESS, LATEST_VERSION } from '@constants';
import pickBy from 'lodash/pickBy';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import usePositionService from '@hooks/usePositionService';
import useArcx from '@hooks/useArcx';
import { addTransaction } from './actions';
import useWallets from '@hooks/useWallets';
import { getWalletsAddresses } from '@common/utils/accounts';
import { Address } from 'viem';
import useDcaIndexingBlocks from '@hooks/useDcaIndexingBlocks';
import { map, orderBy } from 'lodash';

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
          chainId: response.chainId,
          ...customData,
          position: customData.position && { ...customData.position },
        })
      );
      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        arcxClient.transaction({
          chainId: response.chainId,
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
        chainId: response.chainId,
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
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const state = useAppSelector((appState) => appState.transactions);
  const currentNetwork = useCurrentNetwork();
  const wallets = useWallets();
  const returnValue = useMemo(
    () =>
      pickBy(state[currentNetwork.chainId], (tx: TransactionDetails) =>
        wallets.find((wallet) => wallet.address.toLowerCase() === tx.from.toLowerCase())
      ),
    [state[currentNetwork.chainId], currentNetwork.chainId, wallets]
  );
  return returnValue;
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
          // eslint-disable-next-line no-param-reassign
          acc[transaction.hash] = transaction;
          return acc;
        }, {}),
    [transactions]
  );
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
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        const tx = allTransactions[hash];
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

// returns whether a ETH has a pending WRAP transaction
export function useHasPendingWrap(): boolean {
  const allTransactions = useAllTransactions();
  return useMemo(
    () =>
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        const tx = allTransactions[hash];
        if (tx.type !== TransactionTypes.wrapEther) return false;
        return !tx.receipt;
      }),
    [allTransactions]
  );
}

// returns whether a token has a pending approval transaction
export function useHasPendingPairCreation(from: Token | null, to: Token | null): boolean {
  const allTransactions = useAllTransactions();
  const network = useCurrentNetwork();
  const fromAddress =
    (from &&
      (from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : from.address)) ||
    '';
  const toAddress =
    (to && (to.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : to.address)) ||
    '';

  return useMemo(
    () =>
      !!from &&
      !!to &&
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        const tx = allTransactions[hash];
        if (tx.type !== TransactionTypes.newPosition) return false;
        if (tx.receipt) {
          return false;
        }
        let txFrom = tx.typeData.from.address;
        txFrom = txFrom === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : txFrom;
        let txTo = tx.typeData.to.address;
        txTo = txTo === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : txTo;
        return (
          (txFrom === fromAddress || txTo === fromAddress) &&
          (txFrom === toAddress || txTo === toAddress) &&
          tx.typeData.isCreatingPair
        );
      }),
    [allTransactions, fromAddress, toAddress, from, to]
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
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        const tx = allTransactions[hash];
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
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        const tx = allTransactions[hash];
        if (tx.type !== TransactionTypes.claimCampaign) return false;
        if (tx.receipt) {
          return false;
        }
        return tx.typeData.id === campaignId && tx.receipt;
      }),
    [allTransactions, campaignId]
  );
}

export function useTransactionsAfterBockNumber(accountBlockNumbers?: TransactionApiIndexing) {
  const state = useAppSelector((appState) => appState.transactions);
  const dcaIndexingBlocks = useDcaIndexingBlocks();
  const wallets = useWallets();

  const transactions = useMemo<TransactionDetails[]>(() => {
    if (!accountBlockNumbers) return [];
    const chains = Object.keys(state);

    const unsortedTxs = chains.reduce<TransactionDetails[]>((acc, chainIdString) => {
      const chainId = Number(chainIdString);

      const filteredTransactions = Object.values(state[chainId]).filter((transaction) => {
        if (!map(wallets, 'address').includes(transaction.from as Address)) {
          return false;
        }

        if (!transaction.receipt) {
          return true;
        }

        if (DCA_TYPE_TRANSACTIONS.includes(transaction.type)) {
          return (
            dcaIndexingBlocks[chainId] &&
            transaction.receipt.blockNumber > BigInt(dcaIndexingBlocks[chainId].processedUpTo)
          );
        } else {
          return (
            transaction.receipt.blockNumber >
            BigInt(accountBlockNumbers[transaction.from as Address][chainId].processedUpTo)
          );
        }
      });

      acc.push(...filteredTransactions);

      return acc;
    }, []);

    return orderBy(unsortedTxs, [(tx) => !!tx.receipt, (tx) => tx.confirmedTime], ['asc', 'desc']);
  }, [accountBlockNumbers, state, dcaIndexingBlocks, wallets]);

  return transactions;
}
