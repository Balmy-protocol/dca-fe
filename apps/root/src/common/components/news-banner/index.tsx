// import { NETWORKS } from '@constants';
// import { DCA_CREATE_ROUTE } from '@constants/routes';
// import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
// import { useAppDispatch } from '@state/hooks';
// import { changeRoute } from '@state/tabs/actions';
import React from 'react';
import { defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  ContainerBox,
  DonutShape,
  NewsBannerBackgroundGrid,
  Typography,
  CoinWrapper,
  RootstockLogoMinimalistic,
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

const NewsBanner = () => {
  const intl = useIntl();
  // const dispatch = useAppDispatch();
  // const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();

  const text = intl.formatMessage(
    defineMessage({
      description: 'news-banner.text.rsk-galxe-quest',
      defaultMessage: 'Join our Rootstock Quest $5,000 Up for Grabs!',
    })
  );

  const coinIcon = <RootstockLogoMinimalistic height={15} width={15} />;

  const onClick = () => {
    // dispatch(changeRoute(DCA_CREATE_ROUTE.key));
    // pushToHistory(`/${DCA_CREATE_ROUTE.key}/${NETWORKS.avalanche.chainId}`);

    const url = 'https://app.galxe.com/quest/balmy/GCCHFtv3c5';
    window.open(url, '_blank');
    trackEvent('Clicked on news banner', {
      campaign: 'RSK Galxe Quest',
    });
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
