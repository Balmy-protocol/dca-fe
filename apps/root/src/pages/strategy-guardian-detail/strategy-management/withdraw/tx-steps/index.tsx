import React from 'react';
import TransactionSteps from '@common/components/transaction-steps';
import { useEarnManagementState } from '@state/earn-management/hooks';

const EarnWithdrawTransactionSteps = ({ recapDataProps, ...rest }: Parameters<typeof TransactionSteps>[0]) => {
  const { withdrawAmount, withdrawRewards } = useEarnManagementState();

  const earnRecapDataProps = React.useMemo(
    () => (recapDataProps ? { ...recapDataProps, withdrawAmount, withdrawRewards } : undefined),
    [withdrawAmount, withdrawRewards]
  );

  return <TransactionSteps {...rest} recapDataProps={earnRecapDataProps} />;
};

export default EarnWithdrawTransactionSteps;
