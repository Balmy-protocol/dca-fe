import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import NavBar from 'common/navbar';
import AppFooter from 'common/footer';
import Home from 'home';
import Aggregator from 'aggregator';
import FAQ from 'faq';
import TransactionUpdater from 'state/transactions/transactionUpdater';
import BlockNumberUpdater from 'state/block-number/blockNumberUpdater';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import PositionDetail from 'position-detail';
import styled, { DefaultTheme, ThemeProvider as SCThemeProvider } from 'styled-components';
import { useThemeMode } from 'state/config/hooks';
import TransactionModalProvider from 'common/transaction-modal';
import { useAppDispatch } from 'hooks/state';
import { startFetchingTokenLists } from 'state/token-lists/actions';
import { SnackbarProvider } from 'notistack';
import { NETWORKS, SUPPORTED_NETWORKS } from 'config/constants';
import { setNetwork } from 'state/config/actions';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import Leaderboard from 'leaderboard';
import Vector1 from 'assets/svg/vector1.svg';
import Vector2 from 'assets/svg/vector2.svg';
import find from 'lodash/find';
import { NetworkStruct } from 'types';
import useWalletService from 'hooks/useWalletService';
import useWeb3Service from 'hooks/useWeb3Service';
import ErrorBoundary from 'common/error-boundary/indext';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}

const StyledVector1Container = styled.div`
  position: fixed;
  bottom: -5px;
  left: 0px;
  z-index: -99;
`;
const StyledVector2Container = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  z-index: -99;
`;

interface AppFrameProps {
  isLoading: boolean;
  initializationError: Error | null;
}

const StyledGridContainer = styled(Grid)`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
`;

const StyledAppGridContainer = styled(Grid)`
  margin-top: 40px !important;
  flex: 1;
  display: flex;
`;

const StyledContainer = styled(Container)`
  // background-color: #e5e5e5;
  flex: 1;
  display: flex;
`;

const StyledFooterGridContainer = styled(Grid)`
  margin-top: 92px !important;
  position: relative;
  flex: 0;
`;
const AppFrame = ({ isLoading, initializationError }: AppFrameProps) => {
  const walletService = useWalletService();
  const mode = useThemeMode();
  const web3Service = useWeb3Service();
  const [hasSetNetwork, setHasSetNetwork] = React.useState(false);

  const theme = createTheme({
    palette: {
      mode,
    },
  });

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function getNetwork() {
      try {
        const web3Network = await walletService.getNetwork();
        const networkToSet = find(NETWORKS, { chainId: web3Network.chainId });
        if (SUPPORTED_NETWORKS.includes(web3Network.chainId)) {
          dispatch(setNetwork(networkToSet as NetworkStruct));
          if (networkToSet) {
            web3Service.setNetwork(networkToSet?.chainId);
          }
        } else {
          web3Service.setNetwork(NETWORKS.optimism.chainId);
        }
      } catch (e) {
        console.error('Found error while trying to set up network');
      }
      setHasSetNetwork(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(startFetchingTokenLists());
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getNetwork();
  }, []);

  const isLoadingNetwork = !currentNetwork || !hasSetNetwork;

  return (
    <ThemeProvider theme={theme as DefaultTheme}>
      <SCThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <TransactionModalProvider>
            {!isLoading && !isLoadingNetwork && (
              <>
                <TransactionUpdater />
                <BlockNumberUpdater />
              </>
            )}
            <Router>
              <NavBar isLoading={isLoading || isLoadingNetwork} />
              <StyledVector1Container>
                <Vector1 />
              </StyledVector1Container>
              <StyledVector2Container>
                <Vector2 />
              </StyledVector2Container>
              <StyledContainer>
                <StyledGridContainer container direction="row">
                  <StyledAppGridContainer item xs={12}>
                    <ErrorBoundary error={initializationError}>
                      <Switch>
                        <Route path="/faq">
                          <FAQ />
                        </Route>
                        <Route path="/positions/:positionId">
                          <PositionDetail />
                        </Route>
                        <Route path="/:chainId/positions/:positionVersion/:positionId">
                          <PositionDetail />
                        </Route>
                        <Route path="/leaderboard">
                          <Leaderboard />
                        </Route>
                        <Route path="/positions">
                          <Home isLoading={isLoading || isLoadingNetwork} />
                        </Route>
                        <Route path="/create/:chainId?/:from?/:to?">
                          <Home isLoading={isLoading || isLoadingNetwork} />
                        </Route>
                        <Route path="/swap/:chainId?/:from?/:to?">
                          <Aggregator isLoading={isLoading || isLoadingNetwork} />
                        </Route>
                        <Route path="/:chainId?/:from?/:to?">
                          <Home isLoading={isLoading || isLoadingNetwork} />
                        </Route>
                      </Switch>
                    </ErrorBoundary>
                  </StyledAppGridContainer>
                  <StyledFooterGridContainer item xs={12}>
                    <AppFooter />
                  </StyledFooterGridContainer>
                </StyledGridContainer>
              </StyledContainer>
            </Router>
          </TransactionModalProvider>
        </SnackbarProvider>
      </SCThemeProvider>
    </ThemeProvider>
  );
};
export default AppFrame;
