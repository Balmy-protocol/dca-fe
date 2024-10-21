import React from 'react';
import TransactionSteps from '@common/components/transaction-steps';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { defineMessage, useIntl } from 'react-intl';

const EarnWithdrawTransactionSteps = ({ recapDataProps, ...rest }: Parameters<typeof TransactionSteps>[0]) => {
  const { withdrawAmount, withdrawRewards } = useEarnManagementState();
  const intl = useIntl();
  const earnRecapDataProps = React.useMemo(
    () => (recapDataProps ? { ...recapDataProps, withdrawAmount, withdrawRewards } : undefined),
    [withdrawAmount, withdrawRewards]
  );

  return (
    <TransactionSteps
      {...rest}
      recapDataProps={earnRecapDataProps}
      backControlLabel={intl.formatMessage(
        defineMessage({
          description: 'earn.strategy-management.withdraw.tx-steps.back-control',
          defaultMessage: 'Edit withdraw',
        })
      )}
    />
  );
};

export default EarnWithdrawTransactionSteps;
