// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import JbrlCompetition from '@pages/jbrl-competition';
import AppFooter from '@common/components/footer';
import DCA from '@pages/dca';
import Aggregator from '@pages/aggregator';
import FAQ from '@pages/faq';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import BlockNumberUpdater from '@state/block-number/blockNumberUpdater';
import { ThemeProvider, Theme } from '@mui/material/styles';
import PositionDetail from '@pages/position-detail';
import styled, { DefaultTheme, ThemeProvider as SCThemeProvider } from 'styled-components';
import TransactionModalProvider from '@common/components/transaction-modal';
import { useAppDispatch } from '@hooks/state';
import { startFetchingTokenLists } from '@state/token-lists/actions';
import { SnackbarProvider } from 'notistack';
import { DEFAULT_NETWORK_FOR_VERSION, NETWORKS, POSITION_VERSION_4, SUPPORTED_NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import Vector1 from '@assets/svg/vector1.svg';
import Vector2 from '@assets/svg/vector2.svg';
import find from 'lodash/find';
import { NetworkStruct } from '@types';
import useProviderService from '@hooks/useProviderService';
import useWeb3Service from '@hooks/useWeb3Service';
import ErrorBoundary from '@common/components/error-boundary/indext';
import useAccount from '@hooks/useAccount';
import FeedbackCard from '@common/components/feedback-card';
import useSdkChains from '@hooks/useSdkChains';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import '@rainbow-me/rainbowkit/styles.css';
import EulerClaimFrame from '@pages/euler-claim/frame';
import NavBar from './navbar';
import theme from './theme';

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
  const providerService = useProviderService();
  const web3Service = useWeb3Service();
  const account = useAccount();
  const [hasSetNetwork, setHasSetNetwork] = React.useState(false);
  const aggSupportedNetworks = useSdkChains();
  const currentBreakPoint = useCurrentBreakpoint();

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function getNetwork() {
      try {
        const isConnected = providerService.getIsConnected();
        if (isConnected) {
          const web3Network = await providerService.getNetwork();
          const networkToSet = find(NETWORKS, { chainId: web3Network.chainId });
          if (
            (SUPPORTED_NETWORKS.includes(web3Network.chainId) || aggSupportedNetworks.includes(web3Network.chainId)) &&
            !(web3Network as { chainId: number; defaultProvider: boolean }).defaultProvider
          ) {
            dispatch(setNetwork(networkToSet as NetworkStruct));
            if (networkToSet) {
              web3Service.setNetwork(networkToSet?.chainId);
            }
          } else {
            web3Service.setNetwork(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId);
          }
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
                        <Route path="/jbrl-competition">
                          {/* <RollbarContext context="/leaderboard"> */}
                          <JbrlCompetition />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/positions">
                          {/* <RollbarContext context="/positions"> */}
                          <DCA isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/euler-claim">
                          {/* <RollbarContext context="/positions"> */}
                          <EulerClaimFrame isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/create/:chainId?/:from?/:to?">
                          {/* <RollbarContext context="/create"> */}
                          <DCA isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/swap/:chainId?/:from?/:to?">
                          <Aggregator isLoading={isLoading || isLoadingNetwork} />
                        </Route>
                        <Route path="/:chainId?/:from?/:to?">
                          {/* <RollbarContext context="/main"> */}
                          <DCA isLoading={isLoading || isLoadingNetwork} />
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
