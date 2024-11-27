import React from 'react';
import useTransactionsHistory from './useTransactionsHistory';
import mergeMultipleReceipts from '@common/utils/transaction-history/transaction-receipt-parser/merge-multiple-receipts';
import { Hash } from 'viem/_types/types/misc';

function useTransactionReceipt({
  transaction,
  mergeTransactionsWithSameHash,
}: {
  transaction?: { hash: Hash; chainId: number };
  mergeTransactionsWithSameHash?: boolean;
}) {
  const transactionsHistory = useTransactionsHistory();

  const transactionReceipt = React.useMemo(() => {
    if (!transaction) return;

    const transactionEvent = transactionsHistory.events.filter(
      (event) => event.tx.txHash === transaction.hash && event.tx.chainId === transaction.chainId
    );

    return mergeMultipleReceipts(transactionEvent, mergeTransactionsWithSameHash);
  }, [transactionsHistory.events, transaction, mergeTransactionsWithSameHash]);

  return transactionReceipt;
}

export default useTransactionReceipt;
