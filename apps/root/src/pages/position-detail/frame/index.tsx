import React from 'react';
import { Grid, Typography, Tabs, Tab, createStyles, BackControl } from 'ui-library';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { PositionVersions } from '@types';
import { usePositionHasPendingTransaction } from '@state/transactions/hooks';
import { useAppDispatch } from '@state/hooks';
import { changePositionDetailsTab, changeRoute } from '@state/tabs/actions';
import { usePositionDetailsTab } from '@state/tabs/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { withStyles } from 'tss-react/mui';
import { fetchPositionAndTokenPrices } from '@state/position-details/actions';
import { usePositionDetails } from '@state/position-details/hooks';
import useYieldOptions from '@hooks/useYieldOptions';

import useTrackEvent from '@hooks/useTrackEvent';
import usePushToHistory from '@hooks/usePushToHistory';
import PositionNotFound from '../components/position-not-found';
import PositionControls from '../components/position-summary-controls';
import PositionSummaryContainer from '../components/summary-container';
import PositionPermissionsContainer from '../components/permissions-container';
import { DCA_ROUTE } from '@constants/routes';
import PositionWarning from '@pages/dca/positions/components/positions-list/position-card/components/position-warning';

const StyledTab = withStyles(Tab, () =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
    },
    selected: {
      fontWeight: '500',
    },
  })
);

const StyledTabs = withStyles(Tabs, () =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
);

const StyledPositionDetailsContainer = styled(Grid)`
  align-self: flex-start;
`;

const PositionDetailFrame = () => {
  const { positionId, chainId, positionVersion } = useParams<{
    positionId: string;
    chainId: string;
    positionVersion: PositionVersions;
  }>();
  const pushToHistory = usePushToHistory();
  const tabIndex = usePositionDetailsTab();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const intl = useIntl();

  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(Number(chainId));

  const { isLoading, position } = usePositionDetails(`${chainId}-${positionId}-v${positionVersion}`);
  const pendingTransaction = usePositionHasPendingTransaction(position?.id || '');

  React.useEffect(() => {
    dispatch(changeRoute(DCA_ROUTE.key));
    trackEvent('DCA - Visit position detail page', { chainId });
    if (positionId && chainId && positionVersion) {
      void dispatch(
        fetchPositionAndTokenPrices({
          positionId: Number(positionId),
          chainId: Number(chainId),
          version: positionVersion,
        })
      );
    }
  }, []);

  if (!position && !isLoading) {
    return <PositionNotFound />;
  }

  const onBackToPositions = () => {
    dispatch(changeRoute(DCA_ROUTE.key));
    pushToHistory('/positions');
    trackEvent('DCA - Go back to positions');
  };

  return (
    <StyledPositionDetailsContainer container>
      <Grid item xs={12} style={{ paddingBottom: '45px', paddingTop: '15px' }}>
        <BackControl
          onClick={onBackToPositions}
          label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
        />
      </Grid>
      {position && yieldOptions && (
        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
          <PositionWarning position={position} yieldOptions={yieldOptions} />
        </Grid>
      )}
      <Grid
        item
        xs={12}
        style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', flexWrap: 'wrap' }}
      >
        <StyledTabs
          value={tabIndex}
          onChange={(e, index: number) => dispatch(changePositionDetailsTab(index))}
          TabIndicatorProps={{ style: { bottom: '8px' } }}
        >
          <StyledTab
            disableRipple
            label={
              <Typography variant="h6">
                <FormattedMessage description="viewSummary" defaultMessage="View summary" />
              </Typography>
            }
          />
          <StyledTab
            disableRipple
            sx={{ marginLeft: '32px' }}
            label={
              <Typography variant="h6">
                <FormattedMessage description="viewPermissions" defaultMessage="View permissions" />
              </Typography>
            }
          />
        </StyledTabs>
        {position && position.status !== 'TERMINATED' && (
          <PositionControls position={position} pendingTransaction={pendingTransaction} />
        )}
      </Grid>
      <Grid item xs={12}>
        {tabIndex === 0 && position && (
          <PositionSummaryContainer
            position={position}
            isLoading={isLoading}
            pendingTransaction={pendingTransaction}
            yieldOptions={yieldOptions}
            isLoadingYieldOptions={isLoadingYieldOptions}
          />
        )}
        {tabIndex === 1 && position && (
          <PositionPermissionsContainer position={position} pendingTransaction={pendingTransaction} />
        )}
      </Grid>
    </StyledPositionDetailsContainer>
  );
};
export default PositionDetailFrame;
