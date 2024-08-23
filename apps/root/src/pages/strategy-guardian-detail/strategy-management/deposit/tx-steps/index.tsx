import React from 'react';
import TransactionSteps from '@common/components/transaction-steps';
import { useEarnManagementState } from '@state/earn-management/hooks';

const EarnTransactionSteps = ({ recapDataProps, ...rest }: Parameters<typeof TransactionSteps>[0]) => {
  const { assetAmount } = useEarnManagementState();

  const earnRecapDataProps = React.useMemo(
    () => (recapDataProps ? { ...recapDataProps, assetAmount } : undefined),
    [assetAmount]
  );

  return <TransactionSteps {...rest} recapDataProps={earnRecapDataProps} />;
};

export default EarnTransactionSteps;
