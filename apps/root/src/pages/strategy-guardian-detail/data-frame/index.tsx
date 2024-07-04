import React from 'react';
import { Grid } from 'ui-library';
import VaultData from '../vault-data';
import useStrategyDetails from '@hooks/earn/useStrategyDetails';

interface VaultDataFrameProps {
  chainId?: number;
  strategyGuardianId?: string;
}

const VaultDataFrame = ({ chainId, strategyGuardianId }: VaultDataFrameProps) => {
  const strategy = useStrategyDetails({ chainId, strategyGuardianId });

  return (
    <Grid container direction="column" columnSpacing={6} flexWrap="nowrap">
      <Grid item xs={12}>
        <VaultData strategy={strategy} />
      </Grid>
      <Grid item xs={12}>
        {/* Rest of vault data */}
      </Grid>
    </Grid>
  );
};

export default VaultDataFrame;
