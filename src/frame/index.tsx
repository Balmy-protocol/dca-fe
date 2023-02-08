// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
import { DEFAULT_NETWORK_FOR_VERSION, NETWORKS, POSITION_VERSION_4, SUPPORTED_NETWORKS } from 'config/constants';
import { setNetwork } from 'state/config/actions';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import Leaderboard from 'leaderboard';
import JmxnCompetition from 'jmxn-competition';
import Vector1 from 'assets/svg/vector1.svg';
import Vector2 from 'assets/svg/vector2.svg';
import find from 'lodash/find';
import { NetworkStruct } from 'types';
import useWalletService from 'hooks/useWalletService';
import useWeb3Service from 'hooks/useWeb3Service';
import ErrorBoundary from 'common/error-boundary/indext';
import useAccount from 'hooks/useAccount';
import FeedbackCard from 'common/feedback-card';
import usdSdkChains from 'hooks/useSdkChains';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';

// FONTS
// import Lato300EOT from 'lato-v32-latin-300.eot';
// import Lato300TTF from 'lato-v32-latin-300.ttf';
// import Lato300WOFF from 'lato-v32-latin-300.woff';
// import Lato300WOFF2 from 'lato-v32-latin-300.woff2';

// import Lato700EOT from 'lato-v32-latin-700.eot';
// import Lato700WOFF from 'lato-v32-latin-700.woff';
// import Lato700TTF from 'lato-v32-latin-700.ttf';
// import Lato700WOFF2 from 'lato-v32-latin-700.woff2';

// import Lato400EOT from 'lato-v32-latin-regular.eot';
// import Lato400TTF from 'lato-v32-latin-regular.ttf';
// import Lato400WOFF from 'lato-v32-latin-regular.woff';
// import Lato400WOFF2 from 'lato-v32-latin-regular.woff2';

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

const StyledGridContainer = styled(Grid)<{ isSmall?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  ${({ isSmall }) => isSmall && 'margin-bottom: 40px !important;'}
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
  const account = useAccount();
  const [hasSetNetwork, setHasSetNetwork] = React.useState(false);
  const aggSupportedNetworks = usdSdkChains();
  const currentBreakPoint = useCurrentBreakpoint();

  const theme = createTheme({
    palette: {
      mode,
    },
    typography: {
      fontFamily: 'Lato, Roboto, Arial',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-display: swap;
            font-family: 'Lato';
            font-style: normal;
            font-weight: 300;
            src: url('../fonts/lato-v23-latin-300.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-300.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-300.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-300.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-300.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-300.svg#Lato') format('svg'); /* Legacy iOS */
          }
          /* lato-regular - latin */
          @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: 'Lato';
            font-style: normal;
            font-weight: 400;
            src: url('../fonts/lato-v23-latin-regular.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-regular.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-regular.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-regular.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-regular.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-regular.svg#Lato') format('svg'); /* Legacy iOS */
          }
          /* lato-regular - 500 - latin */
          @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: 'Lato';
            font-style: normal;
            font-weight: 500;
            src: url('../fonts/lato-v23-latin-regular.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-regular.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-regular.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-regular.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-regular.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-regular.svg#Lato') format('svg'); /* Legacy iOS */
          }
          /* lato-700 - latin */
          @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: 'Lato';
            font-style: normal;
            font-weight: 700;
            src: url('../fonts/lato-v23-latin-700.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-700.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-700.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-700.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-700.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-700.svg#Lato') format('svg'); /* Legacy iOS */
        `,
      },
    },
  });

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function getNetwork() {
      try {
        const web3Network = await walletService.getNetwork();
        const networkToSet = find(NETWORKS, { chainId: web3Network.chainId });
        if (SUPPORTED_NETWORKS.includes(web3Network.chainId) || aggSupportedNetworks.includes(web3Network.chainId)) {
          dispatch(setNetwork(networkToSet as NetworkStruct));
          if (networkToSet) {
            web3Service.setNetwork(networkToSet?.chainId);
          }
        } else {
          web3Service.setNetwork(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId);
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
  }, [account]);

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
              <FeedbackCard />
              <StyledVector1Container>
                <Vector1 />
              </StyledVector1Container>
              <StyledVector2Container>
                <Vector2 />
              </StyledVector2Container>
              <StyledContainer>
                <StyledGridContainer container direction="row" isSmall={currentBreakPoint === 'xs'}>
                  <StyledAppGridContainer item xs={12}>
                    <ErrorBoundary error={initializationError}>
                      <Switch>
                        <Route path="/faq">
                          {/* <RollbarContext context="/faq"> */}
                          <FAQ />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/positions/:positionId">
                          {/* <RollbarContext context="/positions/details"> */}
                          <PositionDetail />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/:chainId/positions/:positionVersion/:positionId">
                          {/* <RollbarContext context="/positions/details"> */}
                          <PositionDetail />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/leaderboard">
                          {/* <RollbarContext context="/leaderboard"> */}
                          <Leaderboard />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/jmxn-competition">
                          {/* <RollbarContext context="/leaderboard"> */}
                          <JmxnCompetition />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/positions">
                          {/* <RollbarContext context="/positions"> */}
                          <Home isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/create/:chainId?/:from?/:to?">
                          {/* <RollbarContext context="/create"> */}
                          <Home isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/swap/:chainId?/:from?/:to?">
                          <Aggregator isLoading={isLoading || isLoadingNetwork} />
                        </Route>
                        <Route path="/:chainId?/:from?/:to?">
                          {/* <RollbarContext context="/main"> */}
                          <Home isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
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
