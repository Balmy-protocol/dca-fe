import React from 'react';
import { TransactionModalContext, TransactionModalContextValue } from 'common/components/transaction-modal';

function useTransactionModal(): (
  | TransactionModalContextValue['setLoadingConfig']
  | TransactionModalContextValue['setSuccessConfig']
  | TransactionModalContextValue['setErrorConfig']
  | TransactionModalContextValue['setClosedConfig']
)[] {
  const context = React.useContext(TransactionModalContext);

  return [context.setSuccessConfig, context.setLoadingConfig, context.setErrorConfig, context.setClosedConfig];
}

export default useTransactionModal;
