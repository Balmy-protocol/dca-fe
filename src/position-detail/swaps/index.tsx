import React from 'react';
import Grid from '@material-ui/core/Grid';
import { FullPosition } from 'types';
import PositionTimeline from './components/timeline';

interface PositionSwapsProps {
  position: FullPosition;
}

const PositionSwaps = ({ position }: PositionSwapsProps) => (
  <Grid container>
    <Grid item xs={12}>
      <PositionTimeline position={position} />
    </Grid>
  </Grid>
);
export default PositionSwaps;
