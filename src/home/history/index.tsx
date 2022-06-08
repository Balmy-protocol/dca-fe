import React from 'react';
import Grid from '@mui/material/Grid';
import usePastPositions from 'hooks/usePastPositions';
import EmptyPositions from 'common/empty-positions';
import PastPosition from './components/position';

const History = () => {
  const pastPositions = usePastPositions();

  return (
    <Grid container direction="column" alignItems="flex-start" justifyContent="center" spacing={3}>
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container alignItems="stretch" spacing={2}>
          {pastPositions
            ? pastPositions.map((position) => (
                <Grid item xs={12} sm={6} md={4} key={position.id}>
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
