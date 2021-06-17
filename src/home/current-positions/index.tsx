import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import ActivePosition from './components/position';

const mockedCurrentPositions = [
  {
    from: 'ETH',
    to: 'DAI',
    remainingDays: 6,
    startedAt: new Date(1623624089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
  {
    from: 'ETH',
    to: 'DAI',
    remainingDays: 4,
    startedAt: new Date(1623462089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
  {
    from: 'DAI',
    to: 'ETH',
    remainingDays: 2,
    startedAt: new Date(1623289289 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
  {
    from: 'ETH',
    to: 'DAI',
    remainingDays: 1,
    startedAt: new Date(1623030089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
];

const CurrentPositions = () => (
  <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h3">
        <FormattedMessage description="Current positions" defaultMessage="Your current positions" />
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Grid container spacing={2}>
        {mockedCurrentPositions.map(({ from, to, remainingDays, startedAt, exercised, remainingLiquidity }, index) => (
          <ActivePosition
            key={index}
            from={from}
            to={to}
            remainingDays={remainingDays}
            startedAt={startedAt}
            exercised={exercised}
            remainingLiquidity={remainingLiquidity}
          />
        ))}
      </Grid>
    </Grid>
  </Grid>
);
export default CurrentPositions;
