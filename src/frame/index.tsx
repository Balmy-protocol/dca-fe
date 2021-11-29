import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import NavBar from 'common/navbar';
import AppFooter from 'common/footer';
import Home from 'home';
import FAQ from 'faq';
import TransactionUpdater from 'state/transactions/transactionUpdater';
import BlockNumberUpdater from 'state/block-number/blockNumberUpdater';
import { MuiThemeProvider, createMuiTheme, Theme } from '@material-ui/core/styles';
import PositionDetail from 'position-detail';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { useThemeMode } from 'state/config/hooks';
import TransactionModalProvider from 'common/transaction-modal';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}

interface AppFrameProps {
  isLoading: boolean;
}

const StyledGridContainer = styled(Grid)`
  // background-color: #e5e5e5;
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
  // background-color: #e5e5e5;
  flex: 1;
  display: flex;
`;

const AppFrame = ({ isLoading }: AppFrameProps) => {
  const type = useThemeMode();

  const theme = createMuiTheme({
    palette: {
      type,
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme as DefaultTheme}>
        <CssBaseline />
        <TransactionModalProvider>
          {!isLoading && (
            <>
              <TransactionUpdater />
              <BlockNumberUpdater />
            </>
          )}
          <Router>
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
        </TransactionModalProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};
export default AppFrame;
