import React from 'react';
import { Grid, Typography, BackControl, ContainerBox } from 'ui-library';
import { useParams } from 'react-router-dom';
import { PositionVersions, WalletStatus } from '@types';
import { usePositionHasPendingTransaction } from '@state/transactions/hooks';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { fetchPositionAndTokenPrices } from '@state/position-details/actions';
import { usePositionDetails } from '@state/position-details/hooks';
import useAnalytics from '@hooks/useAnalytics';
import usePushToHistory from '@hooks/usePushToHistory';
import PositionNotFound from '../components/position-not-found';
import PositionControls from '../components/position-summary-controls';
import PositionSummaryContainer from '../components/summary-container';
import { DCA_ROUTE } from '@constants/routes';
import PositionWarning from '@pages/dca/positions/components/positions-list/position-card/components/position-warning';
import useWallets from '@hooks/useWallets';
import { EmptyPosition } from '@common/mocks/currentPositions';

const PositionDetailFrame = () => {
  const { positionId, chainId, positionVersion } = useParams<{
    positionId: string;
    chainId: string;
    positionVersion: PositionVersions;
  }>();
  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const intl = useIntl();
  const wallets = useWallets();

  const { isLoading, position } = usePositionDetails(`${chainId}-${positionId}-v${positionVersion}`);
  const pendingTransaction = usePositionHasPendingTransaction(position?.id || '', Number(chainId));
  const ownerWallet = wallets.find((userWallet) => userWallet.address.toLowerCase() === position?.user.toLowerCase());

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
    pushToHistory('/invest/positions');
    trackEvent('DCA - Go back to positions');
  };

  return (
    <Grid container rowSpacing={8}>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={4}>
          <BackControl
            onClick={onBackToPositions}
            label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
          />
          {/* This is to make sure the controls are aligned with the title since the buttons make the container grow to 44px, but without them it would be 38.4px */}
          <ContainerBox gap={2} justifyContent="space-between" alignItems="flex-end" style={{ minHeight: '44px' }}>
            <Typography variant="h2Bold">
              <FormattedMessage description="positionPerformance" defaultMessage="Position Performance" />
            </Typography>
            <PositionControls
              show={!!position && position.status !== 'TERMINATED' && ownerWallet?.status === WalletStatus.connected}
              position={position || EmptyPosition}
              pendingTransaction={pendingTransaction}
              ownerWallet={ownerWallet}
            />
          </ContainerBox>
        </ContainerBox>
      </Grid>
      <Grid item xs={12}>
        {position && <PositionWarning position={position} />}
        <PositionSummaryContainer position={position} isLoading={isLoading} pendingTransaction={pendingTransaction} />
      </Grid>
    </Grid>
  );
};
export default PositionDetailFrame;
