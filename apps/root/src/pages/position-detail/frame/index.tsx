import React from 'react';
import { Grid, Typography, BackControl, ContainerBox, TwitterShareLinkButton } from 'ui-library';
import { useParams } from 'react-router-dom';
import { PositionVersions, WalletStatus } from '@types';
import { usePositionHasPendingTransaction } from '@state/transactions/hooks';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { fetchPositionAndTokenPrices } from '@state/position-details/actions';
import { usePositionDetails } from '@state/position-details/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import usePushToHistory from '@hooks/usePushToHistory';
import PositionNotFound from '../components/position-not-found';
import PositionControls from '../components/position-summary-controls';
import PositionSummaryContainer from '../components/summary-container';
import { DCA_ROUTE } from '@constants/routes';
import PositionWarning from '@pages/dca/positions/components/positions-list/position-card/components/position-warning';
import useWallets from '@hooks/useWallets';
import { getDcaTweetContent } from '@common/utils/dca';

const PositionDetailFrame = () => {
  const { positionId, chainId, positionVersion } = useParams<{
    positionId: string;
    chainId: string;
    positionVersion: PositionVersions;
  }>();
  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
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
    pushToHistory('/positions');
    trackEvent('DCA - Go back to positions');
  };

  const tweetContent = React.useMemo(() => getDcaTweetContent({ position, intl }), [position, intl]);

  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12}>
        <ContainerBox justifyContent="space-between">
          <ContainerBox flexDirection="column" gap={4}>
            <BackControl
              onClick={onBackToPositions}
              label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
            />
            <ContainerBox gap={2}>
              <Typography variant="h3">
                <FormattedMessage description="positionPerformance" defaultMessage="Position Performance" />
              </Typography>
              {tweetContent && ownerWallet && (
                <TwitterShareLinkButton text={tweetContent.twitterText} url={tweetContent.twitterShareUrl} />
              )}
            </ContainerBox>
          </ContainerBox>
          {position && position.status !== 'TERMINATED' && ownerWallet?.status === WalletStatus.connected && (
            <PositionControls position={position} pendingTransaction={pendingTransaction} ownerWallet={ownerWallet} />
          )}
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
