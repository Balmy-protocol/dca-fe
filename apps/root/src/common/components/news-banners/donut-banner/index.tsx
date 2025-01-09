import { Chains } from '@balmy/sdk';
import { NETWORKS } from '@constants';
import { DCA_CREATE_ROUTE } from '@constants/routes';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';
import { useStoredNativeBalance } from '@state/balances/hooks';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import React from 'react';
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  ContainerBox,
  DonutShape,
  NewsBannerBackgroundGrid,
  Typography,
  CoinWrapper,
  RootstockLogoMinimalistic,
  AvalancheLogoMinimalistic,
} from 'ui-library';

const StyledBannerContainer = styled(ContainerBox).attrs({
  fullWidth: true,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
})<{ $clickable: boolean }>`
  ${({ theme: { palette, spacing }, $clickable }) => `
  padding: ${spacing(1)} ${spacing(5)};
  background: ${palette.gradient.newsBanner};
  border-radius: ${spacing(4)};
  overflow: hidden;
  position: relative;
  ${$clickable ? 'cursor: pointer;' : ''}
`}
`;

const StyledBackgroundGrid = styled(NewsBannerBackgroundGrid)`
  ${({ theme: { spacing } }) => `
    position: absolute;
    transform: rotate(0deg);
    right: -${spacing(10)};
  }`}
`;

type LocalUrl = {
  isExternal: false;
  route: string;
  pushRoute: string;
};

type ExternalUrl = {
  isExternal: true;
  url: string;
};

interface NewsBannerProps {
  unformattedText: MessageDescriptor;
  coinIcon: React.ReactNode;
  campaignEventId: string;
  url: LocalUrl | ExternalUrl;
  chainId: number;
}

const avalancheBannerProps: NewsBannerProps = {
  unformattedText: defineMessage({
    description: 'news-banner.text.dca-avalanche',
    defaultMessage: 'Recurring investments launched on avalanche',
  }),
  coinIcon: <AvalancheLogoMinimalistic height={12.25} width={14} />,
  campaignEventId: 'DCA in Avalanche',
  url: {
    isExternal: false,
    route: DCA_CREATE_ROUTE.key,
    pushRoute: `/${DCA_CREATE_ROUTE.key}/${NETWORKS.avalanche.chainId}`,
  },
  chainId: Chains.AVALANCHE.chainId,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rootstockBannerProps: NewsBannerProps = {
  unformattedText: defineMessage({
    description: 'news-banner.text.rsk-galxe-quest',
    defaultMessage: 'Join our Rootstock Quest $5,000 Up for Grabs!',
  }),
  coinIcon: <RootstockLogoMinimalistic height={15} width={15} />,
  campaignEventId: 'RSK Galxe Quest',
  url: {
    isExternal: true,
    url: 'https://app.galxe.com/quest/balmy/GCCHFtv3c5',
  },
  chainId: Chains.ROOTSTOCK.chainId,
};

const newsBannerProps = avalancheBannerProps;

const NewsBanner = () => {
  const { unformattedText, coinIcon, campaignEventId, url, chainId } = newsBannerProps;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const { trackEvent } = useAnalytics();
  const nativeBalances = useStoredNativeBalance(chainId);

  const text = intl.formatMessage(unformattedText);

  const onClick = () => {
    trackEvent('Clicked on news banner', {
      campaign: campaignEventId,
      nativeBalances,
    });

    if (url.isExternal) {
      window.open(url.url, '_blank');
    } else {
      dispatch(changeRoute(url.route));
      pushToHistory(url.pushRoute);
    }
  };

  return (
    <StyledBannerContainer onClick={onClick} $clickable={!!onClick}>
      <StyledBackgroundGrid width={350} height={130} />
      <Typography variant="bodySemibold" color={({ palette }) => colors[palette.mode].accent.accent100}>
        {text}
      </Typography>
      <ContainerBox style={{ position: 'relative' }} alignItems="end">
        <DonutShape width={85} height={85} persistThemeColor="dark" />
        <div style={{ position: 'absolute' }}>
          <CoinWrapper
            style={{
              width: 30,
              height: 30,
            }}
          >
            {coinIcon}
          </CoinWrapper>
        </div>
      </ContainerBox>
    </StyledBannerContainer>
  );
};

export default NewsBanner;
