import React from 'react';
import Grid from '@material-ui/core/Grid';
import { FullPosition, PairSwaps } from 'types';
import PositionTimeline from './components/timeline';

interface PositionSwapsProps {
  position: FullPosition;
  swaps: PairSwaps[];
}

const PositionSwaps = ({ position, swaps }: PositionSwapsProps) => (
  <Grid container>
    <Grid item xs={12}>
      <PositionTimeline position={position} swaps={swaps} />
    </Grid>
  </Grid>
);
export default PositionSwaps;
