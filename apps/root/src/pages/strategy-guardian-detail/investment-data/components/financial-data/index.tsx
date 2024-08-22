import React from 'react';
import { DisplayStrategy } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, DividerBorder1, Typography } from 'ui-library';
import ExpectedReturns from '../expected-returns';
import FinancialOverview from '../financial-overview';
import WalletBreakdown from '../wallet-breakdown';
import { StrategyReturnPeriods } from '@common/utils/earn/parsing';

interface FinancialDataProps {
  strategy: DisplayStrategy;
}

const FinancialData = ({ strategy }: FinancialDataProps) => {
  return (
    <>
      <FinancialOverview userPositions={strategy.userPositions} />
      <DividerBorder1 />
      <ContainerBox flexDirection="column" gap={2}>
        <Typography variant="bodyBold">
          <FormattedMessage
            defaultMessage="Expected Returns"
            description="strategy-detail.vault-investment-data.expected-returns"
          />
        </Typography>
        <ExpectedReturns userPositions={strategy.userPositions} hidePeriods={[StrategyReturnPeriods.DAY]} />
      </ContainerBox>
      <WalletBreakdown strategy={strategy} />
    </>
  );
};

export default FinancialData;