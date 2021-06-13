import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import SwapContainer from '../swap-container';
import History from '../history';
import CurrentPositions from '../current-positions';
const HomeFrame = () => (
  <Container>
    <Grid container>
      <Grid xs={12}>Intro goes here</Grid>
      <Grid xs={12}>
        <SwapContainer />
      </Grid>
      <Grid xs={12} style={{ height: 500 }}>
        <CurrentPositions />
      </Grid>
      <Grid xs={12} style={{ height: 500 }}>
        <History />
      </Grid>
    </Grid>
  </Container>
);
export default HomeFrame;
