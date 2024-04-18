import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import {
  TransactionReceipt,
  TransactionTypeDataOptions,
  TransactionAdderPayload,
  TransactionTypes,
  TransactionDetails,
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
export const clearAllTransactions = createAction<{
  chainId: number;
}>('transactions/clearAllTransactions');

export const cleanTransactions = createAction<{
  indexedTransactions: { chainId: number; hash: string }[];
}>('transactions/cleanTransactions');

export const processConfirmedTransactions = createAppAsyncThunk<void, void>(
  'transactions/processConfirmedTransactions',
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
      const isNotIndexed =
        dcaIndexingBlocks[tx.chainId] && tx.receipt!.blockNumber > BigInt(dcaIndexingBlocks[tx.chainId].processedUpTo);

      if (isNotIndexed) {
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
