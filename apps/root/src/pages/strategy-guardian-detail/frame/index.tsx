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

const StrategyDetailFrame = () => {
  const { chainId } = useParams<{
    strategyGuardianId: string;
    chainId: string;
  }>();
  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const intl = useIntl();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_PORTFOLIO.key));
    trackEvent('Earn - Visit strategy detail page', { chainId });
  }, []);

  const onBackToEarnHome = () => {
    dispatch(changeRoute(EARN_ROUTE.key));
    pushToHistory('/earn');
  };

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
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" alignItems="center">
          <EarnFAQ />
        </ContainerBox>
      </Grid>
    </Grid>
  );
};
export default StrategyDetailFrame;
