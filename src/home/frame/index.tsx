import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import SwapContainer from '../swap-container';
import History from '../history';
import CurrentPositions from '../current-positions';

const HomeFrame = () => (
  <Container>
    <Grid container spacing={8}>
      <Grid item xs={12}>
        Intro goes here
      </Grid>
      <Grid item xs={12}>
        <SwapContainer />
      </Grid>
      <Grid item xs={12}>
        <CurrentPositions />
      </Grid>
      <Grid item xs={12}>
        <History />
      </Grid>
    </Grid>
  </Container>
);
export default HomeFrame;
