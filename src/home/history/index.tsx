import React from 'react';
import Grid from '@mui/material/Grid';
import usePastPositions from 'hooks/usePastPositions';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import EmptyPositions from 'common/empty-positions';
import PastPosition from './components/position';

const POSITIONS_PER_ROW = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
};
const History = () => {
  const pastPositions = usePastPositions();
  const currentBreakPoint = useCurrentBreakpoint();

  const positionsPerRow = POSITIONS_PER_ROW[currentBreakPoint];
  const positionsToFill =
    pastPositions.length % positionsPerRow !== 0 ? positionsPerRow - (pastPositions.length % positionsPerRow) : 0;
  const emptyPositions = [];

  for (let i = 0; i < positionsToFill; i += 1) {
    emptyPositions.push(i);
  }

  return (
    <Grid container direction="column" alignItems="flex-start" justifyContent="center" spacing={3}>
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container alignItems="stretch">
          {pastPositions
            ? pastPositions.map((position) => (
                <Grid item xs={12} key={position.id}>
                  <PastPosition position={position} />
                </Grid>
              ))
            : null}
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
