import React from 'react';
import { Grid, BackControl, ContainerBox } from 'ui-library';
import { useParams, useLocation } from 'react-router-dom';
import usePushToHistory from '@hooks/usePushToHistory';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { defineMessage, useIntl } from 'react-intl';
import { changeRoute } from '@state/tabs/actions';
import { EARN_PORTFOLIO, EARN_ROUTE } from '@constants/routes';
import EarnFAQ from '@pages/earn/components/faq';
import VaultDataFrame from '@pages/strategy-guardian-detail/data-frame';
import Sticky from 'balmy-fork-react-stickynode';
import styled from 'styled-components';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import useEarnService from '@hooks/earn/useEarnService';
import { identifyNetwork } from '@common/utils/parsing';
import StrategyManagement from '../strategy-management';
import { getAllChains } from '@balmy/sdk';
import { StrategyId } from 'common-types';
import { resetEarnForm } from '@state/earn-management/actions';

const StyledFlexGridItem = styled(Grid)`
  display: flex;

  .sticky-outer-wrapper {
    flex: 1;
  }
`;

const StrategyDetailFrame = () => {
  const { chainId, strategyGuardianId } = useParams<{
    strategyGuardianId: StrategyId;
    chainId: string;
  }>();
  const pushToHistory = usePushToHistory();
  const earnService = useEarnService();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const intl = useIntl();
  const currentBreakpoint = useCurrentBreakpoint();
  const history = useLocation();

  const isDownMd = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';

  React.useEffect(() => {
    dispatch(changeRoute(EARN_PORTFOLIO.key));
    dispatch(resetEarnForm());
    trackEvent('Earn - Visit strategy detail page', { chainId });
  }, []);

  const onBackToEarnHome = () => {
    if (
      (history.state as { from: string } | undefined)?.from &&
      (history.state as { from: string } | undefined)?.from.startsWith(`/${EARN_PORTFOLIO.key}`)
    ) {
      dispatch(changeRoute(EARN_PORTFOLIO.key));
      pushToHistory(`/${EARN_PORTFOLIO.key}`);
    } else {
      dispatch(changeRoute(EARN_ROUTE.key));
      pushToHistory(`/${EARN_ROUTE.key}`);
    }
  };

  React.useEffect(() => {
    if (chainId && strategyGuardianId) {
      const networkToSet = identifyNetwork(getAllChains(), chainId);
      if (!networkToSet) return;

      try {
        void earnService.fetchDetailedStrategy({ strategyId: strategyGuardianId });
      } catch (error) {
        console.error('Failed to fetch detailed strategy', chainId, strategyGuardianId, error);
      }
    }
  }, [chainId, strategyGuardianId]);

  React.useEffect(() => {
    if (strategyGuardianId) {
      try {
        void earnService.fetchMultipleEarnPositionsFromStrategy(strategyGuardianId);
      } catch (error) {
        console.error('Failed to fetch detailed strategy', chainId, strategyGuardianId, error);
      }
    }
  }, [strategyGuardianId]);

  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12}>
        <BackControl
          onClick={onBackToEarnHome}
          label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
        />
      </Grid>
      <Grid item xs={12} flex={1}>
        <Grid container spacing={6} alignItems="flex-start" id="earnStrategyManagementStickyBoundary">
          <StyledFlexGridItem item xs={12} md={6}>
            <Sticky enabled={!isDownMd} top={95} bottomBoundary="#earnStrategyManagementStickyBoundary">
              <StrategyManagement chainId={Number(chainId)} strategyGuardianId={strategyGuardianId} />
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
