import React from 'react';
import { Grid, StyledFormContainer, ContainerBox, Typography, colors, StyledPageTitleDescription } from 'ui-library';
import { changeRoute } from '@state/tabs/actions';
import { useAppDispatch } from '@state/hooks';
import useAnalytics from '@hooks/useAnalytics';
import { TRANSFER_ROUTE } from '@constants/routes';
import TransferForm from '../components/transfer-form';
import { FormattedMessage } from 'react-intl';

interface TransferFrameProps {}

const TransferFrame = ({}: TransferFrameProps) => {
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();

  React.useEffect(() => {
    dispatch(changeRoute(TRANSFER_ROUTE.key));
    trackEvent('Transfer - Visit transfer page');
  }, []);

  return (
    <StyledFormContainer>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={32} flex="0">
          <ContainerBox flexDirection="column" gap={6}>
            <ContainerBox flexDirection="column" gap={2}>
              <Typography variant="h1Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage defaultMessage="Transfer" description="transfer.title" />
              </Typography>
              <StyledPageTitleDescription>
                <FormattedMessage
                  defaultMessage="Send your assets, store your contacts"
                  description="transfer.title-description"
                />
              </StyledPageTitleDescription>
            </ContainerBox>
            <TransferForm />
          </ContainerBox>
        </ContainerBox>
      </Grid>
    </StyledFormContainer>
  );
};

export default TransferFrame;
