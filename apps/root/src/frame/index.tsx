import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Grid, ThemeProvider, Theme, SnackbarProvider } from 'ui-library';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import BalancesUpdater from '@state/balances/balancesUpdater';
import styled from 'styled-components';
import TransactionModalProvider from '@common/components/transaction-modal';
import { useAppDispatch } from '@hooks/state';
import { startFetchingTokenLists } from '@state/token-lists/actions';
import { NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';
// import useCurrentNetwork from '@hooks/useCurrentNetwork';
import find from 'lodash/find';
// import { NetworkStruct } from '@types';
import useProviderService from '@hooks/useProviderService';
import ErrorBoundary from '@common/components/error-boundary/indext';
// import useAccount from '@hooks/useAccount';
// import useSdkChains from '@hooks/useSdkChains';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import '@rainbow-me/rainbowkit/styles.css';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
// import useAccountService from '@hooks/useAccountService';
// import useActiveWallet from '@hooks/useActiveWallet';
import { useThemeMode } from '@state/config/hooks';
import Navigation from './components/navigation';
import { HOME_ROUTES } from '@constants/routes';
import PromisesInitializer from './components/promises-initializer';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { Config, WagmiProvider } from 'wagmi';
import LightBackgroundGrid from './components/background-grid/light';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetworkUpdater from '@state/config/networkUpdater';
import usePairService from '@hooks/usePairService';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}

const Home = lazy(() => import('@pages/home'));
const DCA = lazy(() => import('@pages/dca'));
const Transfer = lazy(() => import('@pages/transfer'));
const Aggregator = lazy(() => import('@pages/aggregator'));
const History = lazy(() => import('@pages/history'));
const PositionDetail = lazy(() => import('@pages/position-detail'));

const StyledGridContainer = styled(Grid)<{ isSmall?: boolean }>`
  flex-wrap: nowrap;
  position: relative;
  flex: 1;
  max-width: 1160px;
  ${({ isSmall, theme: { breakpoints, spacing } }) => `
    ${isSmall && 'margin-bottom: 40px !important;'}
    ${breakpoints.down('md')} {
      padding: 0px ${spacing(4)};
      max-width: 1080px;
    }
  `}
`;

const queryClient = new QueryClient();

const StyledAppGridContainer = styled(Grid)`
  ${({ theme: { spacing, breakpoints } }) => `
    padding-top: ${spacing(breakpoints.down('md') ? 14 : 20)} !important;
    padding-bottom: ${spacing(10)} !important;
    flex: 1;
    display: flex;
    justify-content: center;
  `}
`;

interface AppFrameProps {
  config: {
    wagmiClient: Config;
  };
  initialChain: number;
}
const StyledGridBg = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
`;

const AppFrame = ({ config: { wagmiClient }, initialChain }: AppFrameProps) => {
  const providerService = useProviderService();
  const pairService = usePairService();
  const currentBreakPoint = useCurrentBreakpoint();
  const themeMode = useThemeMode();

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    providerService.setChainChangedCallback((chainId) => {
      const networkToSet = find(NETWORKS, { chainId });
      if (networkToSet) {
        dispatch(setNetwork(networkToSet));
      }
    });
    // First promises to be executed for every session
    void dispatch(startFetchingTokenLists());
    void pairService.fetchAvailablePairs();
  }, []);

  return (
    <WagmiProvider config={wagmiClient}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={initialChain} theme={themeMode === 'dark' ? darkTheme() : lightTheme()}>
          <ThemeProvider mode={themeMode}>
            <SnackbarProvider>
              <TransactionModalProvider>
                <TransactionUpdater />
                <BalancesUpdater />
                <NetworkUpdater />
                <Router>
                  {themeMode === 'light' && (
                    <StyledGridBg>
                      <LightBackgroundGrid />
                    </StyledGridBg>
                  )}
                  <PromisesInitializer />
                  <Navigation>
                    <StyledGridContainer
                      container
                      direction="row"
                      justifyContent="center"
                      isSmall={currentBreakPoint === 'xs'}
                    >
                      <StyledAppGridContainer item xs={12} sm={10}>
                        <ErrorBoundary>
                          <Suspense fallback={<CenteredLoadingIndicator />}>
                            <Routes>
                              {HOME_ROUTES.map((path, i) => (
                                <Route path={path} key={i} element={<Home />} />
                              ))}
                              <Route path="/history" element={<History />} />
                              <Route path="/positions/:positionId" element={<PositionDetail />} />
                              <Route
                                path="/:chainId/positions/:positionVersion/:positionId"
                                element={<PositionDetail />}
                              />
                              <Route path="/positions" element={<DCA />} />
                              <Route path="/transfer/:chainId?/:token?/:recipient?" element={<Transfer />} />
                              <Route path="/create/:chainId?/:from?/:to?" element={<DCA />} />
                              <Route path="/swap/:chainId?/:from?/:to?" element={<Aggregator />} />
                              <Route path="/:chainId?/:from?/:to?" element={<DCA />} />
                            </Routes>
                          </Suspense>
                        </ErrorBoundary>
                      </StyledAppGridContainer>
                    </StyledGridContainer>
                  </Navigation>
                </Router>
              </TransactionModalProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
export default AppFrame;
