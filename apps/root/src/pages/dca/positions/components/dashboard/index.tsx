import React from 'react';
import { BackgroundPaper, Grid } from 'ui-library';
import CountDashboard from '../count-dashboard';
import UsdDashboard from '../usd-dashboard';

const PositionDashboard = () => {
  return (
    <BackgroundPaper variant="outlined">
      <Grid container columnSpacing={8} alignItems="stretch">
        <Grid item xs={12} md={5}>
          <CountDashboard />
        </Grid>
        <Grid item xs={12} md={7}>
          <UsdDashboard />
        </Grid>
      </Grid>
    </BackgroundPaper>
  );
};
export default PositionDashboard;
