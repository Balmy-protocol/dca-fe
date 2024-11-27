import React from 'react';
import TransactionSteps from '@common/components/transaction-steps';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { defineMessage, useIntl } from 'react-intl';

const EarnTransactionSteps = ({ recapDataProps, ...rest }: Parameters<typeof TransactionSteps>[0]) => {
  const { depositAmount } = useEarnManagementState();
  const intl = useIntl();
  const earnRecapDataProps = React.useMemo(
    () => (recapDataProps ? { ...recapDataProps, assetAmount: depositAmount } : undefined),
    [depositAmount]
  );

  return (
    <TransactionSteps
      {...rest}
      recapDataProps={earnRecapDataProps}
      backControlLabel={intl.formatMessage(
        defineMessage({
          description: 'earn.strategy-management.deposit.tx-steps.back-control',
          defaultMessage: 'Edit deposit',
        })
      )}
    />
  );
};

export default EarnTransactionSteps;
