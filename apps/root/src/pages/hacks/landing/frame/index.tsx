import React from 'react';
import { colors, ContainerBox, Grid, StyledNonFormContainer, Typography } from 'ui-library';
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
import HackLandingMetadata from '../components/metadata';
import HackLandingTable from '../components/table';

const HacksLandingFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const { landingId } = useParams<{ landingId: HackLandingId }>();
  const landing = useHackLanding(landingId);
  const themeMode = useThemeMode();
  const hacksLandingService = useHacksLandingService();

  console.log(landing);
  React.useEffect(() => {
    dispatch(changeRoute(HACKS_LANDING_ROUTE.key));
    trackEvent('Hacks - Visit landing Page');
  }, []);

  React.useEffect(() => {
    const fetchAllowance = () => {
      try {
        if (landingId) void hacksLandingService.fetchHackLanding(landingId);
        //         await hacksLandingService.fetchWalletsAllowances(['0xf488aaf75D987cC30a84A2c3b6dA72bd17A0a555', '0x1a00e1E311009E56e3b0B9Ed6F86f5Ce128a1C01'], {
        //           1: ['0x000000000022D473030F116dDEE9F6B43aC78BA3','0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
        // '0x341e94069f53234fE6DabeF707aD424830525715',
        // '0xDE1E598b81620773454588B85D6b5D4eEC32573e',
        // '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68',],
        //           137: ['0x000000000022D473030F116dDEE9F6B43aC78BA3','0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
        // '0x341e94069f53234fE6DabeF707aD424830525715',
        // '0xDE1E598b81620773454588B85D6b5D4eEC32573e',
        // '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68',],
        //           10: ['0x000000000022D473030F116dDEE9F6B43aC78BA3','0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
        // '0x341e94069f53234fE6DabeF707aD424830525715',
        // '0xDE1E598b81620773454588B85D6b5D4eEC32573e',
        // '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68',],
        //         });
        void hacksLandingService.fetchWalletsAllowances(
          ['0xf488aaf75D987cC30a84A2c3b6dA72bd17A0a555', '0x1a00e1E311009E56e3b0B9Ed6F86f5Ce128a1C01'],
          {
            1: [
              '0x000000000022D473030F116dDEE9F6B43aC78BA3',
              '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
              '0x341e94069f53234fE6DabeF707aD424830525715',
              '0xDE1E598b81620773454588B85D6b5D4eEC32573e',
              '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68',
            ],
            137: [
              '0x000000000022D473030F116dDEE9F6B43aC78BA3',
              '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
              '0x341e94069f53234fE6DabeF707aD424830525715',
              '0xDE1E598b81620773454588B85D6b5D4eEC32573e',
              '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68',
            ],
            10: [
              '0x000000000022D473030F116dDEE9F6B43aC78BA3',
              '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
              '0x341e94069f53234fE6DabeF707aD424830525715',
              '0xDE1E598b81620773454588B85D6b5D4eEC32573e',
              '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68',
            ],
          }
        );
      } catch (e) {
        console.log('god dammit');
      }
    };

    void fetchAllowance();
  }, []);

  return (
    <StyledNonFormContainer container>
      <Grid item xs={12}>
        <ContainerBox gap={6} flexDirection="column">
          <NetWorth
            walletSelector={{
              options: {
                allowAllWalletsOption: true,
                onSelectWalletOption: setSelectedWalletOption,
                selectedWalletOption,
              },
            }}
          />
          <ContainerBox>
            <Grid container rowSpacing={4}>
              <Grid item xs={12}>
                <Typography variant="h3" fontWeight="bold" color={colors[themeMode].typography.typo1}>
                  <FormattedMessage description="hacks-landing.landing.title" defaultMessage="Protect your assets" />
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <HackLandingTable />
              </Grid>
              <Grid item xs={4}>
                <HackLandingMetadata hackLanding={landing} />
              </Grid>
            </Grid>
          </ContainerBox>
        </ContainerBox>
      </Grid>
    </StyledNonFormContainer>
  );
};

export default HacksLandingFrame;
