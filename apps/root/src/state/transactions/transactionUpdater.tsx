import React, { useCallback, useEffect, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import omit from 'lodash/omit';
import values from 'lodash/values';
import useBuildTransactionMessage from '@hooks/useBuildTransactionMessage';
import useBuildRejectedTransactionMessage from '@hooks/useBuildRejectedTransactionMessage';
import { Zoom } from 'ui-library';
import { useGetBlockNumber } from '@state/block-number/hooks';
import EtherscanLink from '@common/components/view-on-etherscan';
import { Positions, Token, TransactionDetails, TransactionTypes } from '@types';
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
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';

const getImpactedTokensByTxType = (tx: TransactionDetails, positions: Positions): Token[] => {
  switch (tx.type) {
    case TransactionTypes.transferToken:
      return [tx.typeData.token];

    case TransactionTypes.newPosition:
      return [tx.typeData.from];

    case TransactionTypes.wrapEther:
      return [getProtocolToken(tx.chainId), getWrappedProtocolToken(tx.chainId)];

    case TransactionTypes.terminatePosition:
      const terminatedPosition = positions.find((pos) => pos.id === tx.typeData.id);
      const tokensToUpdate: Token[] = [];
      if (terminatedPosition) {
        if (!BigNumber.from(tx.typeData.remainingLiquidity).isZero()) {
          tokensToUpdate.push(terminatedPosition.from);
        }
        if (!BigNumber.from(tx.typeData.toWithdraw).isZero()) {
          tokensToUpdate.push(terminatedPosition.to);
        }
      }
      return tokensToUpdate;

    case TransactionTypes.withdrawPosition:
    case TransactionTypes.modifyRateAndSwapsPosition:
    case TransactionTypes.withdrawFunds:
      const withdrawnPosition = positions.find((pos) => pos.id === tx.typeData.id);
      return withdrawnPosition ? [withdrawnPosition.from] : [];

    case TransactionTypes.swap:
    case TransactionTypes.wrap:
    case TransactionTypes.unwrap:
      const { from, to } = tx.typeData;
      return [from, to];

    default:
      return [];
  }
};

export default function Updater(): null {
  const transactionService = useTransactionService();
  const positionService = usePositionService();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const safeService = useSafeService();
  const activeWallet = useActiveWallet();

  const getBlockNumber = useGetBlockNumber();

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
    (hash: string, chainId: number) => {
      if (!activeWallet?.address) throw new Error('No library or chainId');
      return transactionService.getTransactionReceipt(hash, chainId);
    },
    [activeWallet?.address]
  );
  const checkIfTransactionExists = useCallback(
    (hash: string, chainId: number) => {
      if (!activeWallet?.address) throw new Error('No library or chainId');
      return transactionService.getTransaction(hash, chainId).then((tx: ethers.providers.TransactionResponse) => {
        const lastBlockNumberForChain = getBlockNumber(chainId);
        if (!tx) {
          const txToCheck = transactions[hash];
          if (txToCheck.retries > 2) {
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
              transactionFailed({ hash, blockNumber: lastBlockNumberForChain, chainId: transactions[hash].chainId })
            );
          }
        } else {
          dispatch(
            checkedTransactionExist({ hash, blockNumber: lastBlockNumberForChain, chainId: transactions[hash].chainId })
          );
        }

        return true;
      });
    },
    [transactions, getBlockNumber, dispatch, activeWallet?.address]
  );

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
      (hash) => !transactions[hash].receipt && !transactions[hash].checking
    );

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
          if (receipt && !tx.receipt && receipt.status !== 0) {
            let extendedTypeData = {};

            if (tx.type === TransactionTypes.newPair) {
              extendedTypeData = {
                id: ethers.utils.hexValue(receipt.logs[receipt.logs.length - 1].data),
              };
            }

            if (tx.type === TransactionTypes.newPosition) {
              const parsedLog = await transactionService.parseLog({
                logs: receipt.logs,
                chainId: tx.chainId,
                eventToSearch: 'Deposited',
                ownerAddress: receipt.from,
              });
              extendedTypeData = {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                id: parsedLog.args.positionId.toString(),
              };
            }

            if (tx.type === TransactionTypes.migratePosition || tx.type === TransactionTypes.migratePositionYield) {
              const parsedLog = await transactionService.parseLog({
                logs: receipt.logs,
                chainId: tx.chainId,
                eventToSearch: 'Deposited',
                ownerAddress: receipt.from,
              });

              extendedTypeData = {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                newId: parsedLog.args.positionId.toString(),
              };
            }

            let realSafeHash;
            try {
              if (loadedAsSafeApp) {
                realSafeHash = await safeService.getHashFromSafeTxHash(hash);
              }
            } catch (e) {
              console.error('Unable to fetch real tx hash from safe hash');
            }

            positionService.handleTransaction({
              ...tx,
              typeData: {
                ...tx.typeData,
                ...extendedTypeData,
              },
            } as TransactionDetails);

            dispatch(
              updatePosition({
                ...tx,
                typeData: {
                  ...tx.typeData,
                  ...extendedTypeData,
                },
              } as TransactionDetails)
            );

            dispatch(
              finalizeTransaction({
                hash,
                receipt: {
                  ...omit(receipt, ['gasUsed', 'cumulativeGasUsed', 'effectiveGasPrice']),
                  chainId: tx.chainId,
                  gasUsed: (receipt.gasUsed || 0).toString(),
                  cumulativeGasUsed: (receipt.cumulativeGasUsed || 0).toString(),
                  effectiveGasPrice: (receipt.effectiveGasPrice || 0).toString(),
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

            // TODO: What about transfering to own accounts?
            const positions = positionService.getCurrentPositions();
            const tokens = getImpactedTokensByTxType(tx, positions);
            if (!!tokens.length) {
              void dispatch(
                updateTokensAfterTransaction({ tokens, chainId: tx.chainId, walletAddress: tx.from.toLowerCase() })
              );
            }
          } else if (receipt && !tx.receipt && receipt?.status === 0) {
            if (receipt?.status === 0) {
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
          console.error(`Failed to check transaction hash: ${hash}`, error);
        })
        .finally(() => {
          dispatch(checkedTransaction({ hash, chainId: transactions[hash].chainId }));
        });
    });
  }, [transactions, dispatch, getReceipt, checkIfTransactionExists, loadedAsSafeApp, activeWallet?.address]);

  useInterval(transactionChecker, 1000);

  return null;
}
