import React from 'react';
import parseTransactionEventToTransactionReceipt from '@common/utils/transaction-history/transaction-receipt-parser';
import useTransactionsHistory from './useTransactionsHistory';

function useTransactionReceipt(txHash: string) {
  const transactionsHistory = useTransactionsHistory();

  const transactionReceipt = React.useMemo(() => {
    const transactionEvent = transactionsHistory.events.find((event) => event.tx.txHash === txHash);
    return parseTransactionEventToTransactionReceipt(transactionEvent);
  }, [transactionsHistory.events, txHash]);

  return transactionReceipt;
}

export default useTransactionReceipt;
