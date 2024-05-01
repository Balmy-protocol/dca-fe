import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Grid, ThemeProvider, Theme, SnackbarProvider } from 'ui-library';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import BalancesUpdater from '@state/balances/balancesUpdater';
import styled from 'styled-components';
import TransactionModalProvider from '@common/components/transaction-modal';
import { useAppDispatch } from '@hooks/state';
import { startFetchingTokenLists } from '@state/token-lists/actions';
import { NETWORKS, SUPPORTED_NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import find from 'lodash/find';
import { NetworkStruct } from '@types';
import useProviderService from '@hooks/useProviderService';
import ErrorBoundary from '@common/components/error-boundary/indext';
import useAccount from '@hooks/useAccount';
import useSdkChains from '@hooks/useSdkChains';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import '@rainbow-me/rainbowkit/styles.css';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useAccountService from '@hooks/useAccountService';
import useActiveWallet from '@hooks/useActiveWallet';
import { useThemeMode } from '@state/config/hooks';
import Navigation from './components/navigation';
import { HOME_ROUTES } from '@constants/routes';
import PromisesInitializer from './components/promises-initializer';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { Config, WagmiConfig } from 'wagmi';
import LightBackgroundGrid from './components/background-grid/light';

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
  ${({ isSmall, theme: { breakpoints, spacing } }) => `
    ${isSmall && 'margin-bottom: 40px !important;'}
    ${breakpoints.down('md')} {
      padding: 0px ${spacing(4)};
    }
  `}
  flex-wrap: nowrap;
  position: relative;
  flex: 1;
`;

const StyledAppGridContainer = styled(Grid)`
  ${({ theme: { spacing } }) => `
    padding-top: ${spacing(20)} !important;
    padding-bottom: ${spacing(10)} !important;
    flex: 1;
    display: flex;
    justify-content: center;
  `}
`;

interface AppFrameProps {
  config: {
    wagmiClient: Config;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chains: any[];
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

const AppFrame = ({ config: { wagmiClient, chains }, initialChain }: AppFrameProps) => {
  const providerService = useProviderService();
  const accountService = useAccountService();
  const account = useAccount();
  const [hasSetNetwork, setHasSetNetwork] = React.useState(false);
  const aggSupportedNetworks = useSdkChains();
  const currentBreakPoint = useCurrentBreakpoint();
  const activeWallet = useActiveWallet();
  const themeMode = useThemeMode();

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function getNetwork() {
      try {
        const isConnected = !!accountService.getUser();
        if (isConnected) {
          const web3Network = await providerService.getNetwork(activeWallet?.address);
          const networkToSet = find(NETWORKS, { chainId: web3Network.chainId });
          if (SUPPORTED_NETWORKS.includes(web3Network.chainId) || aggSupportedNetworks.includes(web3Network.chainId)) {
            dispatch(setNetwork(networkToSet as NetworkStruct));
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
  }, [account, activeWallet?.address]);

  const isLoadingNetwork = !currentNetwork || !hasSetNetwork;

  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        initialChain={initialChain}
        theme={themeMode === 'dark' ? darkTheme() : lightTheme()}
      >
        <ThemeProvider mode={themeMode}>
          <SnackbarProvider>
            <TransactionModalProvider>
              {!isLoadingNetwork && (
                <>
                  <TransactionUpdater />
                  <BalancesUpdater />
                </>
              )}
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
                            <Route path="/positions" element={<DCA isLoading={isLoadingNetwork} />} />
                            <Route
                              path="/transfer/:chainId?/:token?/:recipient?"
                              element={<Transfer isLoading={isLoadingNetwork} />}
                            />
                            <Route
                              path="/create/:chainId?/:from?/:to?"
                              element={<DCA isLoading={isLoadingNetwork} />}
                            />
                            <Route
                              path="/swap/:chainId?/:from?/:to?"
                              element={<Aggregator isLoading={isLoadingNetwork} />}
                            />
                            <Route path="/:chainId?/:from?/:to?" element={<DCA isLoading={isLoadingNetwork} />} />
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
    </WagmiConfig>
  );
};
export default AppFrame;
