import React, { useCallback, useEffect, useMemo } from 'react';
import { Address, Transaction, toHex } from 'viem';
import omit from 'lodash/omit';
import values from 'lodash/values';
import useBuildTransactionMessage from '@hooks/useBuildTransactionMessage';
import useBuildRejectedTransactionMessage from '@hooks/useBuildRejectedTransactionMessage';
import { Zoom, useSnackbar } from 'ui-library';
import EtherscanLink from '@common/components/view-on-etherscan';
import { TransactionDetails, TransactionTypes } from '@types';
import { setInitialized } from '@state/initializer/actions';
import useTransactionService from '@hooks/useTransactionService';
import useSafeService from '@hooks/useSafeService';
import usePositionService from '@hooks/usePositionService';
import { updatePosition } from '@state/position-details/actions';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useInterval from '@hooks/useInterval';
import { usePendingTransactions } from './hooks';
import {
  checkedTransaction,
  checkedTransactionExist,
  finalizeTransaction,
  removeTransaction,
  setTransactionsChecking,
  transactionFailed,
} from './actions';
import { useAppDispatch, useAppSelector } from '../hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import { updateTokensAfterTransaction } from '@state/balances/actions';
import useWallets from '@hooks/useWallets';
import { isUndefined, map } from 'lodash';
import { getImpactedTokensByTxType, getImpactedTokenForOwnWallet } from '@common/utils/transactions';
import { Chains } from '@mean-finance/sdk';
import useDcaIndexingBlocks from '@hooks/useDcaIndexingBlocks';
import { ONE_DAY, SUPPORTED_NETWORKS_DCA } from '@constants';

export default function Updater(): null {
  const transactionService = useTransactionService();
  const positionService = usePositionService();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const safeService = useSafeService();
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const dcaIndexingBlocks = useDcaIndexingBlocks();

  const dispatch = useAppDispatch();
  const state = useAppSelector((appState) => appState.transactions);

  const transactions = useMemo(
    () =>
      values(state).reduce<{
        [txHash: string]: TransactionDetails;
      }>((acc, chainState) => ({ ...acc, ...chainState }), {}) || {},
    [state]
  );

  const { enqueueSnackbar } = useSnackbar();

  const buildTransactionMessage = useBuildTransactionMessage();
  const buildRejectedTransactionMessage = useBuildRejectedTransactionMessage();

  const pendingTransactions = usePendingTransactions();

  const getReceipt = useCallback(
    (hash: Address, chainId: number) => {
      if (!activeWallet?.address) throw new Error('No library or chainId');
      return transactionService.getTransactionReceipt(hash, chainId);
    },
    [activeWallet?.address]
  );
  const checkIfTransactionExists = useCallback(
    (hash: Address, chainId: number) => {
      if (!activeWallet?.address) throw new Error('No library or chainId');
      return transactionService.getTransaction(hash, chainId).finally(async (tx?: Transaction) => {
        const lastBlockNumberForChain = await transactionService.getBlockNumber(chainId);
        if (!tx) {
          const txToCheck = transactions[hash];
          if (txToCheck.retries > 10) {
            positionService.handleTransactionRejection({
              ...txToCheck,
              typeData: {
                ...txToCheck.typeData,
              },
            } as TransactionDetails);
            dispatch(removeTransaction({ hash, chainId: transactions[hash].chainId }));
            enqueueSnackbar(
              buildRejectedTransactionMessage({
                ...txToCheck,
                typeData: {
                  ...txToCheck.typeData,
                },
              } as TransactionDetails),
              {
                variant: 'error',
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right',
                },
                TransitionComponent: Zoom,
              }
            );
          } else {
            dispatch(
              transactionFailed({
                hash,
                blockNumber: Number(lastBlockNumberForChain),
                chainId: transactions[hash].chainId,
              })
            );
          }
        } else {
          dispatch(
            checkedTransactionExist({
              hash,
              blockNumber: Number(lastBlockNumberForChain),
              chainId: transactions[hash].chainId,
            })
          );
        }
      });
    },
    [transactions, dispatch, activeWallet?.address]
  );

  const parseTxExtendedTypeData = useCallback(async (tx: TransactionDetails) => {
    let extendedTypeData = {};

    if (!tx.receipt) {
      return extendedTypeData;
    }

    if (tx.type === TransactionTypes.newPair) {
      extendedTypeData = {
        id: toHex(tx.receipt.logs[tx.receipt.logs.length - 1].data),
      };
    }

    if (tx.type === TransactionTypes.newPosition) {
      const parsedLog = await transactionService.parseLog({
        logs: tx.receipt.logs,
        chainId: tx.chainId,
        eventToSearch: 'Deposited',
      });

      if ('positionId' in parsedLog.args) {
        extendedTypeData = {
          id: parsedLog.args.positionId.toString(),
        };
      }
    }

    if (tx.type === TransactionTypes.migratePosition || tx.type === TransactionTypes.migratePositionYield) {
      const parsedLog = await transactionService.parseLog({
        logs: tx.receipt.logs,
        chainId: tx.chainId,
        eventToSearch: 'Deposited',
      });

      if ('positionId' in parsedLog.args) {
        extendedTypeData = {
          newId: parsedLog.args.positionId.toString(),
        };
      }
    }

    return extendedTypeData;
  }, []);

  useEffect(() => {
    pendingTransactions.forEach((transaction) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      positionService.setPendingTransaction(transaction);
    });

    dispatch(setInitialized());
    dispatch(setTransactionsChecking(pendingTransactions.map(({ hash, chainId }) => ({ hash, chainId }))));
  }, []);

  const transactionChecker = React.useCallback(() => {
    const transactionsToCheck = Object.keys(transactions).filter(
      (hash) =>
        !transactions[hash].receipt &&
        (!transactions[hash].checking || Date.now() - (transactions[hash].lastCheckedAt || 0) > ONE_DAY * 1000n)
    ) as Address[];

    if (transactionsToCheck.length) {
      dispatch(
        setTransactionsChecking(transactionsToCheck.map((hash) => ({ hash, chainId: transactions[hash].chainId })))
      );
    }

    transactionsToCheck.forEach((hash) => {
      const promise = getReceipt(hash, transactions[hash].chainId);

      promise
        .then(async (receipt) => {
          const tx = transactions[hash];
          if (receipt && !tx.receipt && receipt.status === 'success') {
            const extendedTypeData = await parseTxExtendedTypeData(tx);

            let realSafeHash;
            try {
              if (loadedAsSafeApp) {
                realSafeHash = await safeService.getHashFromSafeTxHash(hash);
              }
            } catch (e) {
              console.error('Unable to fetch real tx hash from safe hash');
            }

            if (
              SUPPORTED_NETWORKS_DCA.includes(tx.chainId) &&
              !isUndefined(dcaIndexingBlocks[tx.chainId]?.processedUpTo) &&
              receipt.blockNumber > BigInt(dcaIndexingBlocks[tx.chainId].processedUpTo)
            ) {
              positionService.handleTransaction({
                ...tx,
                typeData: {
                  ...tx.typeData,
                  ...extendedTypeData,
                },
              } as TransactionDetails);
            }

            dispatch(
              updatePosition({
                ...tx,
                typeData: {
                  ...tx.typeData,
                  ...extendedTypeData,
                },
              } as TransactionDetails)
            );

            let effectiveGasPrice = receipt.effectiveGasPrice || 0n;

            try {
              if (tx.chainId === Chains.ROOTSTOCK.chainId) {
                const txByHash = await transactionService.getTransaction(hash, tx.chainId);

                if (txByHash.gasPrice) {
                  effectiveGasPrice = txByHash.gasPrice;
                }
              }
            } catch (e) {
              console.error('Unable to fetch gas price for rootstock', e);
            }

            dispatch(
              finalizeTransaction({
                hash,
                receipt: {
                  ...omit(receipt, ['gasUsed', 'cumulativeGasUsed', 'effectiveGasPrice']),
                  chainId: tx.chainId,
                  gasUsed: receipt.gasUsed || 0n,
                  cumulativeGasUsed: receipt.cumulativeGasUsed || 0n,
                  effectiveGasPrice: effectiveGasPrice,
                },
                extendedTypeData,
                chainId: tx.chainId,
                realSafeHash,
              })
            );

            enqueueSnackbar(
              buildTransactionMessage({
                ...tx,
                typeData: {
                  ...tx.typeData,
                  ...extendedTypeData,
                },
              } as TransactionDetails),
              {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right',
                },
                action: () => <EtherscanLink hash={hash} />,
                TransitionComponent: Zoom,
              }
            );

            const positions = positionService.getCurrentPositions();
            const tokens = getImpactedTokensByTxType(tx, positions);
            if (!!tokens.length) {
              void dispatch(
                updateTokensAfterTransaction({ tokens, chainId: tx.chainId, walletAddress: tx.from.toLowerCase() })
              );
            }

            const { token, recipient } = getImpactedTokenForOwnWallet(tx, map(wallets, 'address'));
            if (token && recipient) {
              void dispatch(
                updateTokensAfterTransaction({
                  tokens: [token],
                  chainId: tx.chainId,
                  walletAddress: recipient,
                })
              );
            }
          } else if (receipt && !tx.receipt && receipt?.status === 'reverted') {
            if (receipt?.status === 'reverted') {
              positionService.handleTransactionRejection({
                ...tx,
                typeData: {
                  ...tx.typeData,
                },
              } as TransactionDetails);
              dispatch(removeTransaction({ hash, chainId: tx.chainId }));
              enqueueSnackbar(
                buildRejectedTransactionMessage({
                  ...tx,
                  typeData: {
                    ...tx.typeData,
                  },
                } as TransactionDetails),
                {
                  variant: 'error',
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                  },
                  TransitionComponent: Zoom,
                }
              );
            } else {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              checkIfTransactionExists(hash, transactions[hash].chainId);
            }
          }
          return true;
        })
        .catch((error) => {
          console.error(`Failed to check transaction hash: ${hash} (network ${transactions[hash].chainId})`, error);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          checkIfTransactionExists(hash, transactions[hash].chainId);
        })
        .finally(() => {
          dispatch(checkedTransaction({ hash, chainId: transactions[hash].chainId }));
        });
    });
  }, [transactions, dispatch, getReceipt, checkIfTransactionExists, loadedAsSafeApp, activeWallet?.address]);

  useInterval(transactionChecker, 1000);

  return null;
}
