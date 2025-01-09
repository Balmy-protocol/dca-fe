import React, { useCallback, useEffect, useMemo } from 'react';
import { Address, Transaction, toHex } from 'viem';
import omit from 'lodash/omit';
import values from 'lodash/values';
import useBuildTransactionMessage from '@hooks/useBuildTransactionMessage';
import useBuildRejectedTransactionMessage from '@hooks/useBuildRejectedTransactionMessage';
import { Zoom, useSnackbar } from 'ui-library';
import EtherscanLink from '@common/components/view-on-etherscan';
import { EarnCreateTypeData, isDcaType, isEarnType, Token, TransactionDetails, TransactionTypes } from '@types';
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
import { Chains } from '@balmy/sdk';
import useDcaIndexingBlocks from '@hooks/useDcaIndexingBlocks';
// import useEarnIndexingBlocks from '@hooks/useEarnIndexingBlocks';
import { ONE_DAY, SUPPORTED_NETWORKS_DCA, getTransactionRetries } from '@constants';
import usePriceService from '@hooks/usePriceService';
import { parseUsdPrice } from '@common/utils/currency';
import useEarnService from '@hooks/earn/useEarnService';
import useHasFetchedUserStrategies from '@hooks/earn/useHasFetchedUserStrategies';
import { getSdkEarnPositionId } from '@common/utils/earn/parsing';
import useTierService from '@hooks/tiers/useTierService';

export default function Updater(): null {
  const transactionService = useTransactionService();
  const positionService = usePositionService();
  const earnService = useEarnService();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const priceService = usePriceService();
  const safeService = useSafeService();
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const dcaIndexingBlocks = useDcaIndexingBlocks();
  const hasFetchedUserStrategies = useHasFetchedUserStrategies();
  const tierService = useTierService();
  // const earnIndexingBlocks = useEarnIndexingBlocks();

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
          if (txToCheck.retries > getTransactionRetries(chainId)) {
            positionService.handleTransactionRejection({
              ...txToCheck,
              typeData: {
                ...txToCheck.typeData,
              },
            } as TransactionDetails);
            earnService.handleTransactionRejection({
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

    const getTokenWithPrice = async (token: Token) => {
      const tokenBasePrice = await priceService.getUsdHistoricPrice([token], undefined, token.chainId);
      const tokenPrice = parseUsdPrice(token, 10n ** BigInt(token.decimals), tokenBasePrice[token.address]);
      return { ...token, price: tokenPrice };
    };

    try {
      switch (tx.type) {
        case TransactionTypes.newPair:
          extendedTypeData = {
            id: toHex(tx.receipt.logs[tx.receipt.logs.length - 1].data),
          };
          break;
        case TransactionTypes.newPosition:
          const newPositionparsedLogPromise = transactionService.parseLog({
            logs: tx.receipt.logs,
            chainId: tx.chainId,
            eventToSearch: 'Deposited',
          });
          const newPositionTokenWithPricePromise = getTokenWithPrice(tx.typeData.from);

          const [newPositionparsedLog, newPositionTokenWithPrice] = await Promise.all([
            newPositionparsedLogPromise,
            newPositionTokenWithPricePromise,
          ]);

          if ('positionId' in newPositionparsedLog.args) {
            extendedTypeData = {
              id: newPositionparsedLog.args.positionId.toString(),
              from: newPositionTokenWithPrice,
            };
          }
          break;
        case TransactionTypes.earnCreate:
          // parse the logs
          const newEarnpositionParsedLogs = transactionService.parseLog({
            logs: tx.receipt.logs,
            chainId: tx.chainId,
            eventToSearch: 'PositionCreated',
          });
          const newEarnpositionTokenWithPricePromise = getTokenWithPrice(tx.typeData.asset);

          const [newEarnPositionParsedLog, newEarnPositionTokenWithPrice] = await Promise.all([
            newEarnpositionParsedLogs,
            newEarnpositionTokenWithPricePromise,
          ]);

          if ('positionId' in newEarnPositionParsedLog.args) {
            extendedTypeData = {
              positionId: getSdkEarnPositionId({
                chainId: tx.chainId,
                vault: tx.typeData.vault,
                positionId: newEarnPositionParsedLog.args.positionId,
              }),
              asset: newEarnPositionTokenWithPrice,
              assetAmount: tx.typeData.assetAmount,
              strategyId: tx.typeData.strategyId,
              vault: tx.typeData.vault,
              amountInUsd: tx.typeData.amountInUsd,
              isMigration: tx.typeData.isMigration,
            } satisfies Partial<EarnCreateTypeData>['typeData'];
          }
          break;
        case TransactionTypes.migratePosition:
        case TransactionTypes.migratePositionYield:
          const migrateParsedLog = await transactionService.parseLog({
            logs: tx.receipt.logs,
            chainId: tx.chainId,
            eventToSearch: 'Deposited',
          });

          if ('positionId' in migrateParsedLog.args) {
            extendedTypeData = {
              newId: migrateParsedLog.args.positionId.toString(),
            };
          }
          break;
        case TransactionTypes.terminatePosition:
          if (tx.position) {
            const terminatePositionFromTokenWithPricePromise = getTokenWithPrice(tx.position.from);
            const terminatePositionToTokenWithPricePromise = getTokenWithPrice(tx.position.to);
            const [terminatePositionFromTokenWithPrice, terminatePositionToTokenWithPrice] = await Promise.all([
              terminatePositionFromTokenWithPricePromise,
              terminatePositionToTokenWithPricePromise,
            ]);

            extendedTypeData = {
              position: {
                ...tx.position,
                from: terminatePositionFromTokenWithPrice,
                to: terminatePositionToTokenWithPrice,
              },
            };
          }
          break;
        case TransactionTypes.modifyRateAndSwapsPosition:
          if (tx.position) {
            const modifyPositionTokenWithPrice = await getTokenWithPrice(tx.position.from);

            extendedTypeData = {
              from: modifyPositionTokenWithPrice,
            };
          }
          break;
        case TransactionTypes.withdrawPosition:
          if (tx.position) {
            const withdrawPositionTokenWithPrice = await getTokenWithPrice(tx.position.to);

            extendedTypeData = {
              position: {
                ...tx.position,
                to: withdrawPositionTokenWithPrice,
              },
            };
          }
          break;
        case TransactionTypes.earnIncrease:
          const increaseEarnPositionTokenWithPrice = await getTokenWithPrice(tx.typeData.asset);

          extendedTypeData = {
            asset: increaseEarnPositionTokenWithPrice,
          };
          break;
        case TransactionTypes.earnWithdraw: {
          const withdrawnTokensWithPrices = await Promise.all(
            tx.typeData.withdrawn.map(async (withdrawnToken) => {
              const withdrawnTokenWithPrice = await getTokenWithPrice(withdrawnToken.token);
              return {
                ...withdrawnToken,
                token: withdrawnTokenWithPrice,
              };
            })
          );

          extendedTypeData = {
            withdrawn: withdrawnTokensWithPrices,
          };
          break;
        }
        case TransactionTypes.earnClaimDelayedWithdraw: {
          const claimDelayedWithdrawTokenWithPrice = await getTokenWithPrice(tx.typeData.claim);

          extendedTypeData = {
            claim: claimDelayedWithdrawTokenWithPrice,
          };
          break;
        }
        case TransactionTypes.swap:
          const swapFromTokenWithPricePromise = getTokenWithPrice(tx.typeData.from);
          const swapToTokenWithPricePromise = getTokenWithPrice(tx.typeData.to);

          const [swapFromTokenWithPrice, swapToTokenWithPrice] = await Promise.all([
            swapFromTokenWithPricePromise,
            swapToTokenWithPricePromise,
          ]);

          extendedTypeData = {
            from: swapFromTokenWithPrice,
            to: swapToTokenWithPrice,
          };
          break;
        case TransactionTypes.transferToken:
          const transferedTokenWithPrice = await getTokenWithPrice(tx.typeData.token);

          extendedTypeData = {
            token: transferedTokenWithPrice,
          };
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
    } finally {
      return extendedTypeData;
    }
  }, []);

  useEffect(() => {
    pendingTransactions.forEach((transaction) => {
      if (isDcaType(transaction)) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        positionService.setPendingTransaction(transaction);
      }
    });

    dispatch(setInitialized());
    dispatch(setTransactionsChecking(pendingTransactions.map(({ hash, chainId }) => ({ hash, chainId }))));
  }, []);

  useEffect(() => {
    // We need to have the data loaded
    if (hasFetchedUserStrategies) {
      pendingTransactions.forEach((transaction) => {
        if (isEarnType(transaction)) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          earnService.setPendingTransaction(transaction);
        }
      });
    }
  }, [hasFetchedUserStrategies]);

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
            const extendedTypeData = await parseTxExtendedTypeData({
              ...tx,
              receipt: { ...receipt, chainId: tx.chainId },
            });

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
            if (
              isEarnType(tx)
              // Commenting until we have the earn indexing blocks
              // && !isUndefined(earnIndexingBlocks[tx.chainId]?.processedUpTo) &&
              // receipt.blockNumber > BigInt(earnIndexingBlocks[tx.chainId].processedUpTo)
            ) {
              earnService.handleTransaction({
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

            tierService.updateAchievements(tx);

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

              if (isEarnType(tx)) {
                earnService.handleTransactionRejection({
                  ...tx,
                  typeData: {
                    ...tx.typeData,
                  },
                } as TransactionDetails);
              }
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
