import React, { useCallback, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import useWeb3Service from 'hooks/useWeb3Service';
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
  const web3Service = useWeb3Service();

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
      if (!web3Service.getAccount()) throw new Error('No library or chainId');
      return web3Service.getTransactionReceipt(hash);
    },
    [web3Service]
  );
  const checkIfTransactionExists = useCallback(
    (hash: string) => {
      if (!web3Service.getAccount()) throw new Error('No library or chainId');
      return web3Service.getTransaction(hash).then((tx: ethers.providers.TransactionResponse) => {
        if (!tx) {
          if (transactions[hash].retries > 2) {
            web3Service.handleTransactionRejection({
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
    [web3Service, web3Service.getAccount(), transactions, lastBlockNumber, dispatch, currentNetwork]
  );

  useEffect(() => {
    pendingTransactions.forEach((transaction) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      web3Service.setPendingTransaction(transaction);
    });
    dispatch(setInitialized());
  }, []);

  useEffect(() => {
    if (!web3Service.getAccount() || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach((hash) => {
        const promise = getReceipt(hash);
        promise
          .then((receipt) => {
            if (receipt && !transactions[hash].receipt) {
              let extendedTypeData = {};

              if (transactions[hash].type === TRANSACTION_TYPES.NEW_PAIR) {
                extendedTypeData = {
                  id: ethers.utils.hexValue(receipt.logs[receipt.logs.length - 1].data),
                };
              }
              if (transactions[hash].type === TRANSACTION_TYPES.NEW_POSITION) {
                extendedTypeData = {
                  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                  id: web3Service
                    .parseLog(receipt.logs, currentNetwork.chainId, 'Deposited')
                    .args.positionId.toString(),
                };
              }
              if (transactions[hash].type === TRANSACTION_TYPES.MIGRATE_POSITION) {
                extendedTypeData = {
                  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                  newId: web3Service
                    .parseLog(receipt.logs, currentNetwork.chainId, 'Deposited')
                    .args.positionId.toString(),
                };
              }

              web3Service.handleTransaction({
                ...transactions[hash],
                typeData: {
                  ...transactions[hash].typeData,
                  ...extendedTypeData,
                },
              });

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
  }, [web3Service.getAccount(), transactions, lastBlockNumber, dispatch, getReceipt, checkIfTransactionExists]);

  return null;
}
