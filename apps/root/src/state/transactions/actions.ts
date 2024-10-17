import { parseUsdPrice } from '@common/utils/currency';
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

export const processConfirmedTransactions = createAppAsyncThunk<void, void>(
  'transactions/processConfirmedTransactions',
  async (_, { extra: { web3Service }, getState }) => {
    const transactionService = web3Service.getTransactionService();
    const positionService = web3Service.getPositionService();
    const earnService = web3Service.getEarnService();
    const priceService = web3Service.getPriceService();
    const dcaIndexingBlocks = transactionService.getDcaIndexingBlocks();
    const earnIndexingBlocks = transactionService.getEarnIndexingBlocks();
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
      const isEarnNotIndexed =
        earnIndexingBlocks[tx.chainId] &&
        tx.receipt!.blockNumber > BigInt(earnIndexingBlocks[tx.chainId].processedUpTo);

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
          console.log('Parsed earn create logs', newEarnPositionParsedLog, newEarnPositionTokenWithPrice);

          if ('positionId' in newEarnPositionParsedLog.args) {
            extendedTypeData = {
              positionId: newEarnPositionParsedLog.args.positionId,
              asset,
              assetAmount: tx.typeData.assetAmount,
              strategyId: tx.typeData.strategyId,
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
