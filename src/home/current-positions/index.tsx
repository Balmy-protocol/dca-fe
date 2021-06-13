import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';

const CurrentPositions = () => (
  <Grid container direction="column" alignItems="flex-start" justify="center">
    <Grid xs={12}>
      <Typography variant="h3">
        <FormattedMessage description="Current positions" defaultMessage="Your current positions" />
      </Typography>
    </Grid>
    <Grid xs={12}>Table here</Grid>
  </Grid>
);
export default CurrentPositions;
