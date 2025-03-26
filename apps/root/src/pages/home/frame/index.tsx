import React from 'react';
import { Grid, Typography, colors, StyledNonFormContainer, ContainerBox, InfoCircleIcon, SPACING } from 'ui-library';
import Portfolio from '../components/portfolio';
import { ALL_WALLETS, WalletOptionValues, WalletSelectorVariants } from '@common/components/wallet-selector/types';
import Activity from '../components/activity';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import useAnalytics from '@hooks/useAnalytics';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { DASHBOARD_ROUTE } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import DcaDashboard from '../components/dca-dashboard';
import useReplaceHistory from '@hooks/useReplaceHistory';
import EarnPositionsDashboard from '../components/earn-positions-dashboard';
import useUserHasPositions from '@hooks/useUserHasPositions';
import useUserHasEarnPositions from '@hooks/useUserHasEarnPositions';
import useIsSomeWalletIndexed from '@hooks/useIsSomeWalletIndexed';
import NewsBanner from '@common/components/news-banners/donut-banner';
const StyledFeatureTitle = styled(Typography).attrs({
  variant: 'h3Bold',
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
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

const StyledViewportContainer = styled(Grid).attrs({
  item: true,
  xs: 12,
  display: 'flex',
})`
  ${({ theme }) => `
    min-height: 60vh;
    [${theme.breakpoints.up('md')}] {
      min-height: 50vh;
    }
  `}
`;

const StyledNonIndexedContainer = styled(ContainerBox).attrs({ gap: 2, alignItems: 'center' })`
  ${({ theme }) => `
    background-color: ${colors[theme.palette.mode].background.secondary};
    border-radius: ${theme.spacing(2)};
    border: 1.5px solid ${colors[theme.palette.mode].semantic.informative.primary};
    padding: ${theme.spacing(3)};
  `}
`;

const HomeFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const replaceHistory = useReplaceHistory();
  const { userHasPositions } = useUserHasPositions();
  const userHasEarnPositions = useUserHasEarnPositions();

  const { isSomeWalletIndexed, hasLoadedEvents } = useIsSomeWalletIndexed(
    selectedWalletOption !== ALL_WALLETS ? selectedWalletOption : undefined
  );
  React.useEffect(() => {
    dispatch(changeRoute(DASHBOARD_ROUTE.key));
    replaceHistory(`/${DASHBOARD_ROUTE.key}`);
    trackEvent('Home - Visit Dashboard Page');
  }, []);

  return (
    <StyledNonFormContainer>
      <Grid container flexDirection={'column'} gap={8}>
        <Grid container spacing={6} flexWrap="wrap">
          <Grid item xs={12} md={8} display="flex">
            <NetWorth
              walletSelector={{
                variant: WalletSelectorVariants.main,
                options: {
                  allowAllWalletsOption: true,
                  onSelectWalletOption: setSelectedWalletOption,
                  selectedWalletOption,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4} display="flex">
            <NewsBanner />
          </Grid>
        </Grid>
        <Grid container sx={{ flex: 1 }} spacing={6} flexWrap="wrap">
          <Grid item xs={12} md={8}>
            <Grid container spacing={6}>
              <StyledViewportContainer>
                <StyledContainer>
                  <StyledFeatureTitle>
                    <FormattedMessage description="assets" defaultMessage="Assets" />
                  </StyledFeatureTitle>
                  <StyledContent>
                    <Portfolio selectedWalletOption={selectedWalletOption} />
                  </StyledContent>
                </StyledContainer>
              </StyledViewportContainer>
              {userHasEarnPositions && (
                <Grid item xs={12} display="flex">
                  <StyledContent>
                    <EarnPositionsDashboard selectedWalletOption={selectedWalletOption} />
                  </StyledContent>
                </Grid>
              )}
              {userHasPositions && (
                <Grid item xs={12} display="flex">
                  <StyledContent>
                    <DcaDashboard selectedWalletOption={selectedWalletOption} />
                  </StyledContent>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} display="flex">
            <Grid container rowSpacing={6} alignContent="flex-start">
              <StyledViewportContainer>
                <StyledContainer>
                  <StyledFeatureTitle>
                    <FormattedMessage description="activity" defaultMessage="Activity" />
                  </StyledFeatureTitle>
                  <StyledContent>
                    <Activity selectedWalletOption={selectedWalletOption} />
                  </StyledContent>
                </StyledContainer>
              </StyledViewportContainer>
              {hasLoadedEvents && !isSomeWalletIndexed && (
                <Grid item xs={12} display="flex">
                  <StyledNonIndexedContainer>
                    <InfoCircleIcon
                      size={SPACING(6)}
                      sx={({ palette }) => ({ color: colors[palette.mode].semantic.informative.primary })}
                    />
                    <ContainerBox flexDirection="column" gap={1}>
                      <Typography variant="h6Bold" color={({ palette }) => colors[palette.mode].typography.typo3}>
                        <FormattedMessage
                          defaultMessage="Indexing Your Transaction History"
                          description="home.activity.not-indexed.title"
                        />
                      </Typography>
                      <Typography
                        variant="bodySmallRegular"
                        color={({ palette }) => colors[palette.mode].typography.typo3}
                      >
                        <FormattedMessage
                          defaultMessage="We are currently retrieving and organizing your transaction history. This process may take some time."
                          description="home.activity.not-indexed.subtitle"
                        />
                      </Typography>
                    </ContainerBox>
                  </StyledNonIndexedContainer>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledNonFormContainer>
  );
};

export default HomeFrame;
