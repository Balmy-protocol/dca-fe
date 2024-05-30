import React from 'react';
import { Grid, Typography, colors, StyledNonFormContainer } from 'ui-library';
import Portfolio from '../components/portfolio';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import Activity from '../components/activity';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { DASHBOARD_ROUTE } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import DcaDashboard from '../components/dca-dashboard';

const StyledFeatureTitle = styled(Typography).attrs({
  variant: 'h5Bold',
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
    font-weight: bold
  `}
`;

const StyledContainer = styled.div`
  ${({ theme: { spacing } }) => `
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: ${spacing(4)}
  `}
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
`;

const HomeFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeRoute(DASHBOARD_ROUTE.key));
    trackEvent('Home - Visit Dashboard Page');
  }, []);

  return (
    <StyledNonFormContainer>
      <Grid container flexDirection={'column'} gap={10}>
        <NetWorth
          walletSelector={{
            options: {
              allowAllWalletsOption: true,
              onSelectWalletOption: setSelectedWalletOption,
              selectedWalletOption,
            },
          }}
        />
        <Grid container sx={{ flex: 1 }} spacing={8} flexWrap="wrap">
          <Grid item xs={12} md={8}>
            <Grid container spacing={8}>
              <Grid item xs={12} display="flex" sx={{ minHeight: '60vh' }}>
                <StyledContainer>
                  <StyledFeatureTitle>
                    <FormattedMessage description="assets" defaultMessage="Assets" />
                  </StyledFeatureTitle>
                  <StyledContent>
                    <Portfolio selectedWalletOption={selectedWalletOption} />
                  </StyledContent>
                </StyledContainer>
              </Grid>
              <Grid item xs={12} display="flex">
                <StyledContent>
                  <DcaDashboard selectedWalletOption={selectedWalletOption} />
                </StyledContent>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} display="flex" sx={{ height: '60vh' }}>
            <StyledContainer>
              <StyledFeatureTitle>
                <FormattedMessage description="activity" defaultMessage="Activity" />
              </StyledFeatureTitle>
              <StyledContent>
                <Activity selectedWalletOption={selectedWalletOption} />
              </StyledContent>
            </StyledContainer>
          </Grid>
          {/* <Grid item xs={12} md={8} display="flex" sx={{ minHeight: '60vh' }}>
            <StyledContainer>
              <StyledFeatureTitle>
                <FormattedMessage description="assets" defaultMessage="Assets" />
              </StyledFeatureTitle>
              <StyledContent>
                <Portfolio selectedWalletOption={selectedWalletOption} />
              </StyledContent>
            </StyledContainer>
          </Grid>
          <Grid item xs={12} md={4} display="flex">
            <StyledContainer>
              <StyledFeatureTitle>
                <FormattedMessage description="activity" defaultMessage="Activity" />
              </StyledFeatureTitle>
              <StyledContent>
                <Activity selectedWalletOption={selectedWalletOption} />
              </StyledContent>
            </StyledContainer>
          </Grid>
          <Grid item xs={12} md={8} display="flex">
            <StyledContent>
              <DcaDashboard selectedWalletOption={selectedWalletOption} />
            </StyledContent>
          </Grid> */}
        </Grid>
      </Grid>
    </StyledNonFormContainer>
  );
};

export default HomeFrame;
