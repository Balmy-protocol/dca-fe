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
import { useAppDispatch } from 'hooks/state';
import { startFetchingTokenLists } from 'state/token-lists/actions';
import { SnackbarProvider } from 'notistack';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import useWeb3Service from 'hooks/useWeb3Service';
import { NETWORKS, SUPPORTED_NETWORKS } from 'config/constants';
import { setNetwork } from 'state/config/actions';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

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

const StyledBetaContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: #2cc941;
  color: #ffffff;
  justify-content: center;
  align-items: center;
`;

const StyledWarningContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: #f5b000;
  justify-content: center;
  align-items: center;
`;

const AppFrame = ({ isLoading }: AppFrameProps) => {
  const web3Service = useWeb3Service();
  const type = useThemeMode();

  const theme = createMuiTheme({
    palette: {
      type,
    },
  });

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function getNetwork() {
      const currentNetwork = await web3Service.getNetwork();
      if (SUPPORTED_NETWORKS.includes(currentNetwork.chainId)) {
        dispatch(setNetwork(currentNetwork));
      } else {
        dispatch(setNetwork(NETWORKS.optimism));
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getNetwork();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(startFetchingTokenLists());
  }, []);

  const isLoadingNetwork = !currentNetwork;

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme as DefaultTheme}>
        <CssBaseline />
        <StyledBetaContainer>
          <Typography variant="caption">
            <FormattedMessage
              description="betaMessage"
              defaultMessage="Mean Finance v2 is finally launched! If you want to look at your v1 positions visit"
            />
            <Link href="https://v1.mean.finance">{` v1.mean.finance`}</Link>
          </Typography>
        </StyledBetaContainer>
        <SnackbarProvider>
          <TransactionModalProvider>
            {!isLoading && !isLoadingNetwork && (
              <>
                <TransactionUpdater />
                <BlockNumberUpdater />
              </>
            )}
            <Router>
              <StyledContainer>
                <StyledGridContainer container direction="column">
                  <StyledNavBarGridContainer item xs={12}>
                    <NavBar isLoading={isLoading || isLoadingNetwork} />
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
                        <Home isLoading={isLoading || isLoadingNetwork} />
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
        </SnackbarProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};
export default AppFrame;
