import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
import SwapContainer from '../swap-container';
import History from '../history';
import CurrentPositions from '../current-positions';

interface HomeFrameProps {
  isLoading: boolean;
}

const StyledContainer = styled(Container)<HomeFrameProps>`
  height: ${(props) => (props.isLoading ? '100%' : 'auto')};
`;

const StyledGridContainer = styled(Grid)<HomeFrameProps>`
  height: ${(props) => (props.isLoading ? `calc(100% + ${(props?.spacing || 0) * 4}px)` : 'auto')}; ;
`;

const HomeFrame = ({ isLoading }: HomeFrameProps) => (
  <StyledContainer isLoading={isLoading}>
    <StyledGridContainer container spacing={8} isLoading={isLoading}>
      {isLoading ? (
        <Grid item xs={12} alignItems="center" justify="center" style={{ display: 'flex' }}>
          <CircularProgress size={70} />
        </Grid>
      ) : (
        <>
          <Grid item xs={12}></Grid>
          <Grid item xs={12}>
            <SwapContainer />
          </Grid>
          <Grid item xs={12}>
            <CurrentPositions />
          </Grid>
          <Grid item xs={12}>
            <History />
          </Grid>
        </>
      )}
    </StyledGridContainer>
  </StyledContainer>
);
export default HomeFrame;
