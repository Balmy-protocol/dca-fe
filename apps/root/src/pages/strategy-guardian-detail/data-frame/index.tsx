import React from 'react';
import { Grid } from 'ui-library';
import VaultData from '../vault-data';
import InvestmentData from '../investment-data';
import useStrategyDetails from '@hooks/earn/useStrategyDetails';
import StrategyTimeline from '../timeline';

interface VaultDataFrameProps {
  chainId?: number;
  strategyGuardianId?: string;
}

const VaultDataFrame = ({ chainId, strategyGuardianId }: VaultDataFrameProps) => {
  const strategy = useStrategyDetails({ chainId, strategyGuardianId });

  const hasInvestment =
    !!strategy?.userPositions?.length &&
    strategy.userPositions.some((position) => position.balances.some((balance) => balance.amount.amount > 0n));

  const hasHistory = !!strategy?.userPositions?.length;

  return (
    <Grid container direction="column" rowSpacing={6} flexWrap="nowrap">
      {hasInvestment && (
        <Grid item xs={12}>
          <InvestmentData strategy={strategy} />
        </Grid>
      )}
      <Grid item xs={12}>
        <VaultData strategy={strategy} />
      </Grid>
      {hasHistory && (
        <Grid item xs={12}>
          <StrategyTimeline strategy={strategy} />
        </Grid>
      )}
    </Grid>
  );
};

export default VaultDataFrame;
