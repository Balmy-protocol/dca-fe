import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from 'common/navbar';
import Home from 'home';
import { styled as materialStyled } from '@material-ui/core/styles';

interface AppFrameProps {
  isLoading: boolean;
}

const StyledGridContainer = materialStyled(Grid)(({ isLoading }: AppFrameProps) => ({
  ...(isLoading ? { height: '100%' } : {}),
  backgroundColor: '#e9e3ec',
}));

const StyledNavBarGridContainer = materialStyled(Grid)({
  flex: 0,
});

const StyledAppGridContainer = materialStyled(Grid)(({ isLoading }: AppFrameProps) => ({
  flex: 1,
  ...(isLoading ? { height: '100%' } : {}),
}));

const AppFrame = ({ isLoading }: AppFrameProps) => (
  <Router>
    <CssBaseline />
    <StyledGridContainer container direction="column" isLoading={isLoading}>
      <StyledNavBarGridContainer item xs={12}>
        <NavBar isLoading={isLoading} />
      </StyledNavBarGridContainer>
      <StyledAppGridContainer item xs={12} isLoading={isLoading}>
        <Switch>
          <Route path="/swap/:from?/:to?">
            <Home isLoading={isLoading} />
          </Route>
          <Route path="*">
            <Home isLoading={isLoading} />
          </Route>
        </Switch>
      </StyledAppGridContainer>
    </StyledGridContainer>
  </Router>
);
export default AppFrame;
