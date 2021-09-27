import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import PastPosition from './components/position';
import { TokenList, Web3Service, Positions } from 'types';
import usePromise from 'hooks/usePromise';
import usePastPositions from 'hooks/usePastPositions';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import EmptyPositions from 'common/empty-positions';
import EmptyPosition from 'common/empty-position';

interface HistoryProps {
  web3Service: Web3Service;
}

const POSITIONS_PER_ROW = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
};
const History = ({ web3Service }: HistoryProps) => {
  const pastPositions = usePastPositions();
  const currentBreakPoint = useCurrentBreakpoint();

  const positionsPerRow = POSITIONS_PER_ROW[currentBreakPoint];
  const positionsToFill =
    pastPositions.length % positionsPerRow !== 0 ? positionsPerRow - (pastPositions.length % positionsPerRow) : 0;
  const emptyPositions = [];

  for (let i = 0; i < positionsToFill; i++) {
    emptyPositions.push(i);
  }

  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="flex-start">
          {pastPositions
            ? (pastPositions as Positions).map((position) => (
                <Grid item xs={12} sm={6} md={3} key={position.id}>
                  <PastPosition position={position} />
                </Grid>
              ))
            : null}
          {pastPositions &&
            !!pastPositions.length &&
            emptyPositions.map((id) => (
              <Grid item xs={12} sm={6} md={3} key={id}>
                <EmptyPosition />
              </Grid>
            ))}
          {pastPositions && !pastPositions.length && (
            <Grid item xs={12}>
              <EmptyPositions isClosed />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default History;
