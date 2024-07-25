import React from 'react';
import { Grid, ContainerBox, StyledFormContainer } from 'ui-library';
import { changeRoute } from '@state/tabs/actions';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { TRANSFER_ROUTE } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import TransferForm from '../components/transfer-form';

interface TransferFrameProps {}

const TransferFrame = ({}: TransferFrameProps) => {
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeRoute(TRANSFER_ROUTE.key));
    trackEvent('Transfer - Visit transfer page');
  }, []);

  return (
    <StyledFormContainer>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={32} flex="0">
          <ContainerBox flexDirection="column" gap={6}>
            <NetWorth
              walletSelector={{
                options: {
                  setSelectionAsActive: true,
                },
              }}
            />
            <TransferForm />
          </ContainerBox>
        </ContainerBox>
      </Grid>
    </StyledFormContainer>
  );
};

export default TransferFrame;
