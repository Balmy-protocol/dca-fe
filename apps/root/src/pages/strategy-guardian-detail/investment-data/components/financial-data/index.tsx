import React from 'react';
import { DisplayStrategy } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, DividerBorder1, Typography } from 'ui-library';
import ExpectedReturns, { StrategyReturnPeriods } from '../expected-returns';
import FinancialOverview from '../financial-overview';

interface FinancialDataProps {
  strategy: DisplayStrategy;
}

const FinancialData = ({ strategy }: FinancialDataProps) => {
  return (
    <>
      <FinancialOverview strategy={strategy} />
      <DividerBorder1 />
      <ContainerBox flexDirection="column" gap={2}>
        <Typography variant="bodyBold">
          <FormattedMessage
            defaultMessage="Expected Returns"
            description="strategy-detail.vault-investment-data.expected-returns"
          />
        </Typography>
        <ExpectedReturns strategy={strategy} hidePeriods={[StrategyReturnPeriods.DAY]} />
      </ContainerBox>
    </>
  );
};

export default FinancialData;
