import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import ActivePosition from './components/position';
import usePromise from 'hooks/usePromise';
import { Web3Service } from 'types';

interface CurrentPositionsProps {
  web3Service: Web3Service;
}

const CurrentPositions = ({ web3Service }: CurrentPositionsProps) => {
  const [currentPositions, isLoadingCurrentPositions, currentPositionErrors] = usePromise(
    web3Service,
    'getCurrentPositions',
    [],
    false
  );
  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">
          <FormattedMessage description="Current positions" defaultMessage="Your current positions" />
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {!isLoadingCurrentPositions
            ? currentPositions.map(({ from, to, remainingDays, startedAt, exercised, remainingLiquidity }, index) => (
                <ActivePosition
                  key={index}
                  from={from}
                  to={to}
                  remainingDays={remainingDays}
                  startedAt={startedAt}
                  exercised={exercised}
                  remainingLiquidity={remainingLiquidity}
                />
              ))
            : null}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default CurrentPositions;
