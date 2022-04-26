import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import NavBar from 'common/navbar';
import AppFooter from 'common/footer';
import Home from 'home';
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
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import useWeb3Service from 'hooks/useWeb3Service';
import { NETWORKS, SUPPORTED_NETWORKS } from 'config/constants';
import { setNetwork } from 'state/config/actions';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import Leaderboard from 'leaderboard';
import Vector1 from 'assets/svg/vector1.svg';
import Vector2 from 'assets/svg/vector2.svg';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}

const StyledVector1Container = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
`;
const StyledVector2Container = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
`;

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
  const mode = useThemeMode();

  const theme = createTheme({
    palette: {
      mode,
    },
  });

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function getNetwork() {
      const web3Network = await web3Service.getNetwork();
      if (SUPPORTED_NETWORKS.includes(web3Network.chainId)) {
        dispatch(setNetwork(web3Network));
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
              <StyledVector1Container>
                <Vector1 />
              </StyledVector1Container>
              <StyledVector2Container>
                <Vector2 />
              </StyledVector2Container>
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
                      <Route path="/leaderboard">
                        <Leaderboard />
                      </Route>
                      <Route path="/:chainId?/:from?/:to?">
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
      </SCThemeProvider>
    </ThemeProvider>
  );
};
export default AppFrame;
