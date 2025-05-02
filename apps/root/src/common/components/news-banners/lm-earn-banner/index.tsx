import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, Typography } from 'ui-library';
import useAnalytics from '@hooks/useAnalytics';
import usePushToHistory from '@hooks/usePushToHistory';
import { EARN_ROUTE } from '@constants/routes';

const EarnBannerShapeUrl = 'url("https://ipfs.io/ipfs/QmfYXVF5qDke64ZSepiSo4z2Pp5o9RTTjQ959VELZQtKrf")';

const StyledBannerContainer = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  fullWidth: true,
})`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(4)};
    background: ${EarnBannerShapeUrl} center no-repeat, ${palette.gradient.newsBanner};
    background-size: cover;
    border-radius: ${spacing(4)};
    overflow: hidden;
    position: relative;
    cursor: pointer;
    height: 103px;
  `}
`;

const LMEarnBanner = () => {
  const { trackEvent } = useAnalytics();
  const pushToHistory = usePushToHistory();

  const handleClick = () => {
    trackEvent('Earn - Click earn banner');
    pushToHistory(`/${EARN_ROUTE.key}`);
  };

  return (
    <StyledBannerContainer onClick={handleClick}>
      <Typography variant="h6Bold" color="#FFF" style={{ maxWidth: '35%', textWrap: 'wrap' }}>
        <FormattedMessage defaultMessage="EARN GUARDIAN" description="earn.banner.earn-guardian" />
      </Typography>
      <Typography
        variant="bodyBold"
        color="#FFF"
        textAlign="right"
        alignSelf="end"
        lineHeight="1.2"
        style={{ maxWidth: '35%', textWrap: 'wrap' }}
      >
        <FormattedMessage defaultMessage="on GNOSIS!" description="earn.banner.on-gnosis" />
      </Typography>
    </StyledBannerContainer>
  );
};

export default LMEarnBanner;
