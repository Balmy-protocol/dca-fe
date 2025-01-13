import { parseUsdPrice } from '@common/utils/currency';
import { getSdkEarnPositionId } from '@common/utils/earn/parsing';
import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import {
  TransactionReceipt,
  TransactionTypeDataOptions,
  TransactionAdderPayload,
  TransactionTypes,
  TransactionDetails,
  isEarnType,
  EarnCreateTypeData,
} from '@types';
import { values } from 'lodash';

export const addTransaction = createAction<TransactionAdderPayload>('transactions/addTransaction');
export const finalizeTransaction = createAction<{
  hash: string;
  receipt: TransactionReceipt;
  extendedTypeData: TransactionTypeDataOptions | Record<string, never>;
  chainId: number;
  realSafeHash?: string;
}>('transactions/finalizeTransaction');
export const setTransactionsChecking = createAction<{ chainId: number; hash: string }[]>(
  'transactions/setTransactionsChecking'
);
export const checkedTransaction = createAction<{
  hash: string;
  chainId: number;
}>('transactions/checkedTransaction');
export const checkedTransactionExist = createAction<{
  hash: string;
  blockNumber?: number;
  chainId: number;
}>('transactions/checkedTransactionExist');
export const transactionFailed = createAction<{
  hash: string;
  blockNumber?: number;
  chainId: number;
}>('transactions/transactionFailed');
export const removeTransaction = createAction<{
  hash: string;
  chainId: number;
}>('transactions/removeTransaction');

export const cleanTransactions = createAction<{
  indexedTransactions: { chainId: number; hash: string }[];
}>('transactions/cleanTransactions');

export const processConfirmedTransactionsForDca = createAppAsyncThunk<void, void>(
  'transactions/processConfirmedTransactionsForDca',
  async (_, { extra: { web3Service }, getState }) => {
    const transactionService = web3Service.getTransactionService();
    const positionService = web3Service.getPositionService();
    const dcaIndexingBlocks = transactionService.getDcaIndexingBlocks();
    const state = getState().transactions;

    const confirmedTransactions = values(state)
      .reduce<TransactionDetails[]>((acc, chainTxs) => {
        acc.push(...values(chainTxs));
        return acc;
      }, [])
      .filter((tx) => !!tx.receipt);

    for (const tx of confirmedTransactions) {
      const isDcaNotIndexed =
        dcaIndexingBlocks[tx.chainId] && tx.receipt!.blockNumber > BigInt(dcaIndexingBlocks[tx.chainId].processedUpTo);

      if (isDcaNotIndexed) {
        let extendedTypeData = {};
        if (tx.type === TransactionTypes.newPosition) {
          const parsedLog = await transactionService.parseLog({
            logs: tx.receipt!.logs,
            chainId: tx.chainId,
            eventToSearch: 'Deposited',
          });

          if ('positionId' in parsedLog.args) {
            extendedTypeData = {
              id: parsedLog.args.positionId.toString(),
            };
          }
        }

        positionService.handleTransaction({
          ...tx,
          typeData: {
            ...tx.typeData,
            ...extendedTypeData,
          },
        } as TransactionDetails);
      }
    }
  }
);

export const processConfirmedTransactionsForEarn = createAppAsyncThunk<void, void>(
  'transactions/processConfirmedTransactionsForEarn',
  async (_, { extra: { web3Service }, getState }) => {
    const transactionService = web3Service.getTransactionService();
    const earnService = web3Service.getEarnService();
    const priceService = web3Service.getPriceService();
    const earnIndexingBlocks = transactionService.getEarnIndexingBlocks();
    const state = getState().transactions;

    const confirmedTransactions = values(state)
      .reduce<TransactionDetails[]>((acc, chainTxs) => {
        acc.push(...values(chainTxs));
        return acc;
      }, [])
      .filter((tx) => !!tx.receipt);

    for (const tx of confirmedTransactions) {
      const isEarnNotIndexed =
        earnIndexingBlocks[tx.chainId] &&
        tx.receipt!.blockNumber > BigInt(earnIndexingBlocks[tx.chainId].processedUpTo);

      if (isEarnNotIndexed) {
        let extendedTypeData = {};
        if (tx.type === TransactionTypes.earnCreate) {
          const newEarnpositionParsedLogs = transactionService.parseLog({
            logs: tx.receipt!.logs,
            chainId: tx.chainId,
            eventToSearch: 'PositionCreated',
          });

          const token = tx.typeData.asset;

          const newEarnpositionTokenWithPricePromise = priceService.getUsdHistoricPrice(
            [token],
            undefined,
            token.chainId
          );

          const [newEarnPositionParsedLog, newEarnPositionTokenWithPrice] = await Promise.all([
            newEarnpositionParsedLogs,
            newEarnpositionTokenWithPricePromise,
          ]);

          const tokenPrice = parseUsdPrice(
            token,
            10n ** BigInt(token.decimals),
            newEarnPositionTokenWithPrice[token.address]
          );
          const asset = { ...token, price: tokenPrice };

          if ('positionId' in newEarnPositionParsedLog.args) {
            extendedTypeData = {
              positionId: getSdkEarnPositionId({
                chainId: tx.chainId,
                vault: tx.typeData.vault,
                positionId: newEarnPositionParsedLog.args.positionId,
              }),
              asset,
              assetAmount: tx.typeData.assetAmount,
              strategyId: tx.typeData.strategyId,
              vault: tx.typeData.vault,
              amountInUsd: tx.typeData.amountInUsd,
              isMigration: tx.typeData.isMigration,
            } satisfies Partial<EarnCreateTypeData>['typeData'];
          }
        }

        if (isEarnType(tx)) {
          earnService.handleTransaction({
            ...tx,
            typeData: {
              ...tx.typeData,
              ...extendedTypeData,
            },
          } as TransactionDetails);
        }
      }
    }
  }
);
