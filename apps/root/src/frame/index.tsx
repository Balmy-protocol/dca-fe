// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Grid, CssBaseline, Container, ThemeProvider, Theme } from 'ui-library';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import BlockNumberUpdater from '@state/block-number/blockNumberUpdater';
import BalancesUpdater from '@state/balances/balancesUpdater';
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
import useSdkChains from '@hooks/useSdkChains';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import '@rainbow-me/rainbowkit/styles.css';
import AppFooter from './components/footer';
import FeedbackCard from './components/feedback-card';
import NavBar from './components/navbar';
import theme from './theme';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useAccountService from '@hooks/useAccountService';
import useActiveWallet from '@hooks/useActiveWallet';
import NewAccountModal from './components/new-account-modal';

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

const DCA = lazy(() => import('@pages/dca'));
const Transfer = lazy(() => import('@pages/transfer'));
const Aggregator = lazy(() => import('@pages/aggregator'));
const FAQ = lazy(() => import('@pages/faq'));
const PositionDetail = lazy(() => import('@pages/position-detail'));
const EulerClaimFrame = lazy(() => import('@pages/euler-claim/frame'));
const SettingsFrame = lazy(() => import('@pages/settings'));

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
  }, [account, activeWallet?.address]);

  const isLoadingNetwork = !currentNetwork || !hasSetNetwork;

  return (
    <ThemeProvider theme={theme as DefaultTheme}>
      <SCThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <TransactionModalProvider>
            {!isLoadingNetwork && (
              <>
                <TransactionUpdater />
                <BlockNumberUpdater />
                <BalancesUpdater />
              </>
            )}
            <Router>
              <NavBar isLoading={isLoadingNetwork} openNewAccountModal={onOpenNewAccountModal} />
              <NewAccountModal open={isNewAccountModalOpen} onClose={() => setIsNewAccountModalOpen(false)} />
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
                    <ErrorBoundary>
                      <Suspense fallback={<CenteredLoadingIndicator />}>
                        <Routes>
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
