import React from 'react';
import { colors, Grid, StyledFormContainer, Typography } from 'ui-library';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { HACKS_LANDING_ROUTE } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import useHackLanding from '@hooks/hacks-landing/useHacksLandings';
import { useParams } from 'react-router-dom';
import { HackLandingId } from '@pages/hacks/types';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage } from 'react-intl';
import useHacksLandingService from '@hooks/hacks-landing/useHacksLandingService';

const HacksLandingFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const { landingId } = useParams<{ landingId: HackLandingId }>();
  const landing = useHackLanding(landingId);
  const themeMode = useThemeMode();
  const hacksLandingService = useHacksLandingService();

  React.useEffect(() => {
    dispatch(changeRoute(HACKS_LANDING_ROUTE.key));
    trackEvent('Hacks - Visit landing Page');
  }, []);

  React.useEffect(() => {
    const fetchAllowance = async () => {
      try {
        await hacksLandingService.fetchWalletAllowance(['0xf488aaf75D987cC30a84A2c3b6dA72bd17A0a555'], {
          1: ['0x000000000022D473030F116dDEE9F6B43aC78BA3'],
          137: ['0x000000000022D473030F116dDEE9F6B43aC78BA3'],
          10: ['0x000000000022D473030F116dDEE9F6B43aC78BA3'],
        });
      } catch (e) {
        console.log('god dammit');
      }
    };

    void fetchAllowance();
  }, []);

  const isLoading = !landing;

  return (
    <StyledFormContainer container rowSpacing={6}>
      <Grid item xs={12}>
        <NetWorth
          walletSelector={{
            options: {
              allowAllWalletsOption: true,
              onSelectWalletOption: setSelectedWalletOption,
              selectedWalletOption,
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h3" fontWeight="bold" color={colors[themeMode].typography.typo1}>
          <FormattedMessage description="hacks-landing.landing.title" defaultMessage="Protect your assets" />
        </Typography>
      </Grid>
      <Grid item xs={8}>
        {/* Landing table */}
      </Grid>
      <Grid item xs={4}>
        {/* Landing metadata */}
      </Grid>
    </StyledFormContainer>
  );
};

export default HacksLandingFrame;
