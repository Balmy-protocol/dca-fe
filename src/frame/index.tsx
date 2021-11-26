import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import NavBar from 'common/navbar';
import AppFooter from 'common/footer';
import Home from 'home';
import FAQ from 'faq';
import PositionDetail from 'position-detail';
import styled from 'styled-components';

interface AppFrameProps {
  isLoading: boolean;
}

const StyledGridContainer = styled(Grid)`
  background-color: #e5e5e5;
`;

const StyledNavBarGridContainer = styled(Grid)`
  flex: 0;
  margin-top: 40px !important;
`;

const StyledAppGridContainer = styled(Grid)`
  flex: 1;
  margin-top: 40px !important;
`;

const StyledContainer = styled(Container)`
  background-color: #e5e5e5;
  flex: 1;
  display: flex;
`;

const AppFrame = ({ isLoading }: AppFrameProps) => (
  <Router>
    <CssBaseline />
    <StyledContainer>
      <StyledGridContainer container direction="column">
        <StyledNavBarGridContainer item xs={12}>
          <NavBar isLoading={isLoading} />
        </StyledNavBarGridContainer>
        <StyledAppGridContainer item xs={12}>
          <Switch>
            <Route path="/faq">
              <FAQ />
            </Route>
            <Route path="/positions/:positionId">
              <PositionDetail />
            </Route>
            <Route path="/:from?/:to?">
              <Home isLoading={isLoading} />
            </Route>
          </Switch>
        </StyledAppGridContainer>
        <StyledNavBarGridContainer item xs={12}>
          <AppFooter />
        </StyledNavBarGridContainer>
      </StyledGridContainer>
    </StyledContainer>
  </Router>
);
export default AppFrame;
