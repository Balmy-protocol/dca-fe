import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Grid, Container, ThemeProvider, Theme } from 'ui-library';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import BalancesUpdater from '@state/balances/balancesUpdater';
import styled from 'styled-components';
import TransactionModalProvider from '@common/components/transaction-modal';
import { useAppDispatch } from '@hooks/state';
import { startFetchingTokenLists } from '@state/token-lists/actions';
import { SnackbarProvider } from 'notistack';
import { DEFAULT_NETWORK_FOR_VERSION, NETWORKS, POSITION_VERSION_4, SUPPORTED_NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import find from 'lodash/find';
import { NetworkStruct } from '@types';
import useProviderService from '@hooks/useProviderService';
import useWeb3Service from '@hooks/useWeb3Service';
import ErrorBoundary from '@common/components/error-boundary/indext';
import useAccount from '@hooks/useAccount';
import useSdkChains from '@hooks/useSdkChains';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import '@rainbow-me/rainbowkit/styles.css';
import FeedbackCard from './components/feedback-card';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useAccountService from '@hooks/useAccountService';
import useActiveWallet from '@hooks/useActiveWallet';
import NewAccountModal from './components/new-account-modal';
import { useThemeMode } from '@state/config/hooks';
import Navigation from './components/navigation';
import { HOME_ROUTES } from '@constants/routes';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}

const Home = lazy(() => import('@pages/home'));
const DCA = lazy(() => import('@pages/dca'));
const Transfer = lazy(() => import('@pages/transfer'));
const Aggregator = lazy(() => import('@pages/aggregator'));
const History = lazy(() => import('@pages/history'));
const FAQ = lazy(() => import('@pages/faq'));
const PositionDetail = lazy(() => import('@pages/position-detail'));
const EulerClaimFrame = lazy(() => import('@pages/euler-claim/frame'));
const SettingsFrame = lazy(() => import('@pages/settings'));

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
  flex: 1;
  display: flex;
`;
const AppFrame = () => {
  const providerService = useProviderService();
  const accountService = useAccountService();
  const web3Service = useWeb3Service();
  const account = useAccount();
  const [hasSetNetwork, setHasSetNetwork] = React.useState(false);
  const aggSupportedNetworks = useSdkChains();
  const currentBreakPoint = useCurrentBreakpoint();
  const activeWallet = useActiveWallet();
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = React.useState(false);
  const themeMode = useThemeMode();

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  const onOpenNewAccountModal = React.useCallback(() => {
    setIsNewAccountModalOpen(true);
  }, [setIsNewAccountModalOpen]);

  React.useEffect(() => {
    accountService.setOpenNewAccountModalHandler(setIsNewAccountModalOpen);
  }, [setIsNewAccountModalOpen]);

  React.useEffect(() => {
    async function getNetwork() {
      try {
        const isConnected = !!accountService.getUser();
        if (isConnected) {
          const web3Network = await providerService.getNetwork(activeWallet?.address);
          const networkToSet = find(NETWORKS, { chainId: web3Network.chainId });
          if (SUPPORTED_NETWORKS.includes(web3Network.chainId) || aggSupportedNetworks.includes(web3Network.chainId)) {
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
  }, [account, activeWallet?.address]);

  const isLoadingNetwork = !currentNetwork || !hasSetNetwork;

  return (
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
            {/* <NavBar isLoading={isLoadingNetwork} openNewAccountModal={onOpenNewAccountModal} /> */}
            <NewAccountModal open={isNewAccountModalOpen} onClose={() => setIsNewAccountModalOpen(false)} />
            <FeedbackCard />
            <Navigation isLoading={isLoadingNetwork} openNewAccountModal={onOpenNewAccountModal}>
              <StyledContainer>
                <StyledGridContainer container direction="row" isSmall={currentBreakPoint === 'xs'}>
                  <StyledAppGridContainer item xs={12}>
                    <ErrorBoundary>
                      <Suspense fallback={<CenteredLoadingIndicator />}>
                        <Routes>
                          {HOME_ROUTES.map((path, i) => (
                            <Route path={path} key={i} element={<Home />} />
                          ))}
                          <Route path="/history" element={<History />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/positions/:positionId" element={<PositionDetail />} />
                          <Route path="/:chainId/positions/:positionVersion/:positionId" element={<PositionDetail />} />
                          <Route path="/positions" element={<DCA isLoading={isLoadingNetwork} />} />
                          <Route
                            path="/transfer/:chainId?/:token?/:recipient?"
                            element={<Transfer isLoading={isLoadingNetwork} />}
                          />
                          <Route path="/euler-claim" element={<EulerClaimFrame isLoading={isLoadingNetwork} />} />
                          <Route path="/settings" element={<SettingsFrame isLoading={isLoadingNetwork} />} />
                          <Route path="/create/:chainId?/:from?/:to?" element={<DCA isLoading={isLoadingNetwork} />} />
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
              </StyledContainer>
            </Navigation>
          </Router>
        </TransactionModalProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};
export default AppFrame;
