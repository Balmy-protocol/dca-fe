import React from 'react';
import useTransactionsHistory from './useTransactionsHistory';
import mergeMultipleReceipts from '@common/utils/transaction-history/transaction-receipt-parser/merge-multiple-receipts';

function useTransactionReceipt({
  chainId,
  txHash,
  mergeTransactionsWithSameHash,
}: {
  chainId: number;
  txHash: string;
  mergeTransactionsWithSameHash?: boolean;
}) {
  const transactionsHistory = useTransactionsHistory();

  const transactionReceipt = React.useMemo(() => {
    if (!txHash || !chainId) return;

    const transactionEvent = transactionsHistory.events.filter(
      (event) => event.tx.txHash === txHash && event.tx.chainId === chainId
    );

    return mergeMultipleReceipts(transactionEvent, mergeTransactionsWithSameHash);
  }, [transactionsHistory.events, txHash, chainId, mergeTransactionsWithSameHash]);

  return transactionReceipt;
}

export default useTransactionReceipt;
