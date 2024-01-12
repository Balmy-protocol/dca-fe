import React from 'react';
import { Grid } from 'ui-library';
import { changeRoute } from '@state/tabs/actions';
import { useAppDispatch } from '@state/hooks';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useTrackEvent from '@hooks/useTrackEvent';
import { TRANSFER_ROUTE } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import TransferForm from '../components/transfer-form';

interface TransferFrameProps {
  isLoading: boolean;
}

const TransferFrame = ({ isLoading }: TransferFrameProps) => {
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeRoute(TRANSFER_ROUTE.key));
    trackEvent('Transfer - Visit transfer page');
  }, []);

  return (
    <>
      {isLoading ? (
        <CenteredLoadingIndicator size={70} />
      ) : (
        <Grid container direction="column" spacing={8} alignContent="center">
          <Grid item>
            <NetWorth
              walletSelector={{
                options: {
                  setSelectionAsActive: true,
                },
              }}
            />
          </Grid>
          <Grid item>
            <TransferForm />
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default TransferFrame;
