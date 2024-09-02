import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, Typography } from 'ui-library';
import ExpectedReturnsChangesSummary from '../../components/expected-returns-changes-summary';
import { StrategyReturnPeriods } from '@common/utils/earn/parsing';
import { AmountsOfToken, DisplayStrategy } from 'common-types';
import { useEarnManagementState } from '@state/earn-management/hooks';

interface EarnWithdrawChangesSummaryProps {
  strategy?: DisplayStrategy;
  positionBalance?: AmountsOfToken;
}

const EarnWithdrawChangesSummary = ({ strategy }: EarnWithdrawChangesSummaryProps) => {
  const { withdrawAmount } = useEarnManagementState();
  return (
    <ContainerBox flexDirection="column" gap={3}>
      <Typography variant="bodySmallSemibold">
        <FormattedMessage
          description="earn.strategy-management.withdraw.changes-summary"
          defaultMessage="Changes summary"
        />
      </Typography>
      <ExpectedReturnsChangesSummary
        hidePeriods={[StrategyReturnPeriods.DAY, StrategyReturnPeriods.MONTH]}
        strategy={strategy}
        assetAmount={withdrawAmount}
        size="small"
        isWithdraw
        showTotal
      />
    </ContainerBox>
  );
};

export default EarnWithdrawChangesSummary;
