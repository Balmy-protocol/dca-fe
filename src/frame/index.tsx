import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from 'common/navbar';
import Home from 'home';
import styled from 'styled-components';

interface AppFrameProps {
  isLoading: boolean;
}

const StyledGridContainer = styled(Grid)<{ isLoading: boolean }>`
  ${(props) => (props.isLoading ? 'height: 100%;' : '')}
  background-color: #e9e3ec;
`;

const StyledNavBarGridContainer = styled(Grid)`
  flex: 0;
`;

const StyledAppGridContainer = styled(Grid)<{ isLoading: boolean }>`
  ${(props) => (props.isLoading ? 'height: 100%;' : '')}
  flex: 1;
  margin-top: 85px !important;
`;

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
