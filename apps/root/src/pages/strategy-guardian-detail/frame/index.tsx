import React from 'react';
import { Grid, BackControl, ContainerBox } from 'ui-library';
import { useParams } from 'react-router-dom';
import usePushToHistory from '@hooks/usePushToHistory';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { defineMessage, useIntl } from 'react-intl';
import { changeRoute } from '@state/tabs/actions';
import { EARN_PORTFOLIO, EARN_ROUTE } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import EarnFAQ from '@pages/earn/components/faq';
import VaultDataFrame from '@pages/strategy-guardian-detail/data-frame';
import Sticky from 'react-stickynode';
import styled from 'styled-components';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import useEarnService from '@hooks/earn/useEarnService';
import { identifyNetwork } from '@common/utils/parsing';
import useSdkMappedChains from '@hooks/useMappedSdkChains';

const StyledFlexGridItem = styled(Grid)`
  display: flex;

  .sticky-outer-wrapper {
    flex: 1;
  }
`;

const StrategyDetailFrame = () => {
  const { chainId, strategyGuardianId } = useParams<{
    strategyGuardianId: string;
    chainId: string;
  }>();
  const pushToHistory = usePushToHistory();
  const earnService = useEarnService();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const intl = useIntl();
  const currentBreakpoint = useCurrentBreakpoint();
  const sdkMappedNetworks = useSdkMappedChains();

  const isDownMd = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';

  React.useEffect(() => {
    dispatch(changeRoute(EARN_PORTFOLIO.key));
    trackEvent('Earn - Visit strategy detail page', { chainId });
  }, []);

  const onBackToEarnHome = () => {
    dispatch(changeRoute(EARN_ROUTE.key));
    pushToHistory('/earn');
  };

  React.useEffect(() => {
    if (chainId && strategyGuardianId) {
      const networkToSet = identifyNetwork(sdkMappedNetworks, chainId);
      if (!networkToSet) return;

      try {
        void earnService.fetchDetailedStrategy({ chainId: networkToSet?.chainId, strategyId: strategyGuardianId });
      } catch (error) {
        console.error('Failed to fetch detailed strategy', chainId, strategyGuardianId, error);
      }
    }
  }, [chainId, strategyGuardianId, sdkMappedNetworks]);

  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12}>
        <BackControl
          onClick={onBackToEarnHome}
          label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
        />
      </Grid>
      <Grid item xs={12}>
        <NetWorth walletSelector={{ options: { setSelectionAsActive: true } }} />
      </Grid>
      <Grid item xs={12} flex={1}>
        <Grid container spacing={6} alignItems="flex-start">
          <StyledFlexGridItem item xs={12} md={6}>
            <Sticky enabled={!isDownMd} top={95}>
              {/* Deposit/increase */}
            </Sticky>
          </StyledFlexGridItem>
          <Grid item xs={12} md={6}>
            <VaultDataFrame chainId={Number(chainId)} strategyGuardianId={strategyGuardianId} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} marginTop={({ spacing }) => spacing(22)}>
        <ContainerBox flexDirection="column" alignItems="center">
          <EarnFAQ />
        </ContainerBox>
      </Grid>
    </Grid>
  );
};
export default StrategyDetailFrame;
