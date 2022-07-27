import React, { useCallback, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import omit from 'lodash/omit';
import useBuildTransactionMessage from 'hooks/useBuildTransactionMessage';
import useBuildRejectedTransactionMessage from 'hooks/useBuildRejectedTransactionMessage';
import Zoom from '@mui/material/Zoom';
import { useBlockNumber } from 'state/block-number/hooks';
import { updateBlockNumber } from 'state/block-number/actions';
import { TRANSACTION_TYPES } from 'config/constants';
import EtherscanLink from 'common/view-on-etherscan';
import { TransactionReceipt } from 'types';
import { setInitialized } from 'state/initializer/actions';
import useTransactionService from 'hooks/useTransactionService';
import useWalletService from 'hooks/useWalletService';
import usePositionService from 'hooks/usePositionService';
import { updatePosition } from 'state/position-details/actions';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { usePendingTransactions } from './hooks';
import { checkedTransaction, finalizeTransaction, removeTransaction, transactionFailed } from './actions';
import { useAppDispatch, useAppSelector } from '../hooks';

interface TxInterface {
  addedTime: number;
  receipt?: TransactionReceipt;
  lastCheckedBlockNumber?: number;
}

export function shouldCheck(lastBlockNumber: number, tx: TxInterface): boolean {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  }
  if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  }
  // otherwise every block
  return true;
}

export default function Updater(): null {
  const transactionService = useTransactionService();
  const walletService = useWalletService();
  const positionService = usePositionService();

  const currentNetwork = useCurrentNetwork();

  const lastBlockNumber = useBlockNumber(currentNetwork.chainId);

  const dispatch = useAppDispatch();
  const state = useAppSelector((appState) => appState.transactions);

  const transactions = useMemo(() => state[currentNetwork.chainId] || {}, [state, currentNetwork]);

  const { enqueueSnackbar } = useSnackbar();

  const buildTransactionMessage = useBuildTransactionMessage();
  const buildRejectedTransactionMessage = useBuildRejectedTransactionMessage();

  const pendingTransactions = usePendingTransactions();

  const getReceipt = useCallback(
    (hash: string) => {
      if (!walletService.getAccount()) throw new Error('No library or chainId');
      return transactionService.getTransactionReceipt(hash);
    },
    [walletService]
  );
  const checkIfTransactionExists = useCallback(
    (hash: string) => {
      if (!walletService.getAccount()) throw new Error('No library or chainId');
      return transactionService.getTransaction(hash).then((tx: ethers.providers.TransactionResponse) => {
        if (!tx) {
          if (transactions[hash].retries > 2) {
            positionService.handleTransactionRejection({
              ...transactions[hash],
              typeData: {
                ...transactions[hash].typeData,
              },
            });
            dispatch(removeTransaction({ hash, chainId: currentNetwork.chainId }));
            enqueueSnackbar(
              buildRejectedTransactionMessage({
                ...transactions[hash],
                typeData: {
                  ...transactions[hash].typeData,
                },
              }),
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
            dispatch(transactionFailed({ hash, blockNumber: lastBlockNumber, chainId: currentNetwork.chainId }));
          }
        } else {
          dispatch(checkedTransaction({ hash, blockNumber: lastBlockNumber, chainId: currentNetwork.chainId }));
        }

        return true;
      });
    },
    [walletService, walletService.getAccount(), transactions, lastBlockNumber, dispatch, currentNetwork]
  );

  useEffect(() => {
    pendingTransactions.forEach((transaction) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      positionService.setPendingTransaction(transaction);
    });
    dispatch(setInitialized());
  }, []);

  useEffect(() => {
    if (!walletService.getAccount() || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach((hash) => {
        const promise = getReceipt(hash);
        promise
          .then(async (receipt) => {
            if (receipt && !transactions[hash].receipt) {
              let extendedTypeData = {};

              if (transactions[hash].type === TRANSACTION_TYPES.NEW_PAIR) {
                extendedTypeData = {
                  id: ethers.utils.hexValue(receipt.logs[receipt.logs.length - 1].data),
                };
              }
              if (transactions[hash].type === TRANSACTION_TYPES.NEW_POSITION) {
                const parsedLog = await transactionService.parseLog(receipt.logs, currentNetwork.chainId, 'Deposited');
                extendedTypeData = {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                  id: parsedLog.args.positionId.toString(),
                };
              }
              if (transactions[hash].type === TRANSACTION_TYPES.MIGRATE_POSITION) {
                const parsedLog = await transactionService.parseLog(receipt.logs, currentNetwork.chainId, 'Deposited');

                extendedTypeData = {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                  newId: parsedLog.args.positionId.toString(),
                };
              }

              positionService.handleTransaction({
                ...transactions[hash],
                typeData: {
                  ...transactions[hash].typeData,
                  ...extendedTypeData,
                },
              });

              dispatch(
                updatePosition({
                  ...transactions[hash],
                  typeData: {
                    ...transactions[hash].typeData,
                    ...extendedTypeData,
                  },
                })
              );

              dispatch(
                finalizeTransaction({
                  hash,
                  receipt: {
                    ...omit(receipt, ['gasUsed', 'cumulativeGasUsed', 'effectiveGasPrice']),
                    chainId: currentNetwork.chainId,
                  },
                  extendedTypeData,
                  chainId: currentNetwork.chainId,
                })
              );

              enqueueSnackbar(
                buildTransactionMessage({
                  ...transactions[hash],
                  typeData: {
                    ...transactions[hash].typeData,
                    ...extendedTypeData,
                  },
                }),
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

              // the receipt was fetched before the block, fast forward to that block to trigger balance updates
              if (receipt.blockNumber > lastBlockNumber) {
                dispatch(updateBlockNumber({ blockNumber: receipt.blockNumber, chainId: currentNetwork.chainId }));
              }
            } else {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              checkIfTransactionExists(hash);
            }
            return true;
          })
          .catch((error) => {
            console.error(`Failed to check transaction hash: ${hash}`, error);
          });
      });
  }, [walletService.getAccount(), transactions, lastBlockNumber, dispatch, getReceipt, checkIfTransactionExists]);

  return null;
}
