import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Grid, ThemeProvider, SnackbarProvider } from 'ui-library';
import styled from 'styled-components';
import TransactionModalProvider from '@common/components/transaction-modal';
import { useAppDispatch } from '@hooks/state';
import { startFetchingTokenLists } from '@state/token-lists/actions';
import { NETWORKS } from '@constants';
import { hydrateStoreFromSavedConfig, setNetwork } from '@state/config/actions';
// import useCurrentNetwork from '@hooks/useCurrentNetwork';
import find from 'lodash/find';
import useProviderService from '@hooks/useProviderService';
import ErrorBoundary from '@common/components/error-boundary/indext';
import '@rainbow-me/rainbowkit/styles.css';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { useThemeMode } from '@state/config/hooks';
import Navigation from './components/navigation';
import { EARN_PORTFOLIO, HOME_ROUTES } from '@constants/routes';
import PromisesInitializer from './components/promises-initializer';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { Config, WagmiProvider } from 'wagmi';
import LightBackgroundGrid from './components/background-grid/light';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import usePairService from '@hooks/usePairService';
import RedirectOldRoute from '@common/components/redirect-old-route';
import useWeb3Service from '@hooks/useWeb3Service';
import { SavedCustomConfig } from '@state/base-types';
import PollingHandlers from './polling-handlers';
import DarkBackgroundGrid from './components/background-grid/dark';
import useEarnAccess from '@hooks/useEarnAccess';

const Home = lazy(() => import('@pages/home'));
const DCA = lazy(() => import('@pages/dca'));
const Transfer = lazy(() => import('@pages/transfer'));
const EarnHome = lazy(() => import('@pages/earn/home'));
const EarnPortfolio = lazy(() => import('@pages/earn/portfolio'));
const EarnAccessNowFrame = lazy(() => import('@pages/earn-access-now/frame'));
const Aggregator = lazy(() => import('@pages/aggregator'));
const History = lazy(() => import('@pages/history'));
const PositionDetail = lazy(() => import('@pages/position-detail'));
const StrategyGuardianDetail = lazy(() => import('@pages/strategy-guardian-detail'));
const TokenProfile = lazy(() => import('@pages/token-profile'));
const TierView = lazy(() => import('@pages/tier-view'));

const StyledGridContainer = styled(Grid)<{ isSmall?: boolean }>`
  flex-wrap: nowrap;
  position: relative;
  flex: 1;
  max-width: 1160px;
  ${({ theme: { breakpoints, spacing } }) => `
    ${breakpoints.down('md')} {
      padding: 0px ${spacing(4)};
      max-width: 1080px;
      margin-bottom: 40px !important;
    }
  `}
`;

const queryClient = new QueryClient();

const StyledAppGridContainer = styled(Grid)`
  ${({ theme: { spacing, breakpoints } }) => `
    padding-top: ${spacing(20)} !important;
    ${breakpoints.down('md')} {
      padding-top: ${spacing(14)} !important;
    }
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
}
const StyledGridBg = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
`;

const AppFrame = ({ config: { wagmiClient } }: AppFrameProps) => {
  const providerService = useProviderService();
  const pairService = usePairService();
  const web3Service = useWeb3Service();
  const themeMode = useThemeMode();
  const { isEarnEnabled, hasEarnAccess } = useEarnAccess();

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
    web3Service.setOnUpdateConfig((config: SavedCustomConfig) => {
      void dispatch(hydrateStoreFromSavedConfig(config));
    });
  }, []);

  return (
    <WagmiProvider config={wagmiClient}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={themeMode === 'dark' ? darkTheme() : lightTheme()}>
          <ThemeProvider mode={themeMode}>
            <SnackbarProvider>
              <TransactionModalProvider>
                <PollingHandlers />
                <Router>
                  {themeMode === 'light' && (
                    <StyledGridBg>
                      <LightBackgroundGrid />
                    </StyledGridBg>
                  )}
                  {themeMode === 'dark' && (
                    <StyledGridBg>
                      <DarkBackgroundGrid />
                    </StyledGridBg>
                  )}
                  <PromisesInitializer />
                  <Navigation>
                    <StyledGridContainer container direction="row" justifyContent="center">
                      <StyledAppGridContainer item xs={12} sm={10} lg={11} xl={12}>
                        <ErrorBoundary>
                          <Suspense fallback={<CenteredLoadingIndicator />}>
                            <Routes>
                              {HOME_ROUTES.map((path, i) => (
                                <Route path={path} key={i} element={<Home />} />
                              ))}
                              <Route path="/history" element={<History />} />

                              {isEarnEnabled && !hasEarnAccess && (
                                <Route path="/earn/access-now" element={<EarnAccessNowFrame />} />
                              )}
                              {hasEarnAccess && (
                                <>
                                  <Route path="/earn" element={<EarnHome />} />
                                  <Route path="/earn/:assetTokenId?/:rewardTokenId?" element={<EarnHome />} />
                                  <Route path={`/${EARN_PORTFOLIO.key}`} element={<EarnPortfolio />} />
                                  <Route
                                    path="/earn/vaults/:chainId/:strategyGuardianId"
                                    element={<StrategyGuardianDetail />}
                                  />
                                </>
                              )}
                              <Route path="/invest/positions/:positionId" element={<PositionDetail />} />
                              {/* TODO: Remove this conditional below when the early access ends */}
                              {hasEarnAccess && <Route path="/tier-view" element={<TierView />} />}
                              {/* // TODO: Remove this route below it's no longer used (@mixpanel) */}
                              <Route
                                path="/positions/:positionId"
                                element={
                                  <RedirectOldRoute
                                    to="/invest/positions/:positionId"
                                    oldRoute="/positions/:positionId"
                                  />
                                }
                              />

                              <Route
                                path="/invest/positions/:chainId/:positionVersion/:positionId"
                                element={<PositionDetail />}
                              />
                              {/* // TODO: Remove this route below it's no longer used (@mixpanel) */}
                              <Route
                                path=":chainId/positions/:positionVersion/:positionId"
                                element={
                                  <RedirectOldRoute
                                    to="/invest/positions/:chainId/:positionVersion/:positionId"
                                    oldRoute=":chainId/positions/:positionVersion/:positionId"
                                  />
                                }
                              />

                              <Route path="/invest/positions" element={<DCA />} />
                              {/* // TODO: Remove this route below it's no longer used (@mixpanel) */}
                              <Route
                                path="/positions"
                                element={<RedirectOldRoute to="/invest/positions" oldRoute="/positions" />}
                              />

                              <Route path="/invest/create/:chainId?/:from?/:to?" element={<DCA />} />
                              {/* // TODO: Remove this route below it's no longer used (@mixpanel) */}
                              <Route
                                path="/create/:chainId?/:from?/:to?"
                                element={
                                  <RedirectOldRoute
                                    to="/invest/create/:chainId?/:from?/:to?"
                                    oldRoute="/create/:chainId?/:from?/:to?"
                                  />
                                }
                              />

                              <Route path="/transfer/:chainId?/:token?/:recipient?" element={<Transfer />} />

                              <Route path="/token/:tokenListId" element={<TokenProfile />} />
                              <Route path="/create/:chainId?/:from?/:to?" element={<DCA />} />
                              <Route path="/swap/:chainId?/:from?/:to?" element={<Aggregator />} />

                              <Route path="*" element={<Home />} />
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
