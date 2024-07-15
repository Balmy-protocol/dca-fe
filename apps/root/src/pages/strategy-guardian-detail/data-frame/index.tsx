import React from 'react';
import { Grid } from 'ui-library';
import VaultData from '../vault-data';
import InvestmentData from '../investment-data';
import useStrategyDetails from '@hooks/earn/useStrategyDetails';

interface VaultDataFrameProps {
  chainId?: number;
  strategyGuardianId?: string;
}

const VaultDataFrame = ({ chainId, strategyGuardianId }: VaultDataFrameProps) => {
  const strategy = useStrategyDetails({ chainId, strategyGuardianId });

  const hasInvestment = !!strategy?.userPositions?.length;

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
      {hasInvestment && (
        <Grid item xs={12}>
          {/* Timeline */}
        </Grid>
      )}
    </Grid>
  );
};

export default VaultDataFrame;
