import GuardianListSubscribeModal from '@frame/components/guardian-list-subscribe-modal';
import useEarnAccess from '@hooks/useEarnAccess';
import EarnGainAccessModal from '@frame/components/earn-gain-access-modal';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, Typography } from 'ui-library';
import useAnalytics from '@hooks/useAnalytics';
import usePushToHistory from '@hooks/usePushToHistory';
import { EARN_ROUTE } from '@constants/routes';

const EarnBannerShapeUrl = 'url("https://ipfs.io/ipfs/QmbT5C7T1ciiva3sSWPYt9oTBeLRW7TAJSRQtD5NNDdLxh")';

const StyledBannerContainer = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  fullWidth: true,
  alignItems: 'start',
})`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(4)};
    background: ${EarnBannerShapeUrl} center no-repeat, ${palette.gradient.newsBanner};
    border-radius: ${spacing(4)};
    overflow: hidden;
    position: relative;
    cursor: pointer;
    height: 103px;
  `}
`;

const EarnBanner = () => {
  const [showEarnModal, setShowEarnModal] = React.useState(false);
  const { isEarnEnabled, hasEarnAccess } = useEarnAccess();
  const { trackEvent } = useAnalytics();
  const pushToHistory = usePushToHistory();

  const handleClick = () => {
    trackEvent('Earn - Click earn banner', { hasEarnAccess });
    if (hasEarnAccess) {
      pushToHistory(`/${EARN_ROUTE.key}`);
    } else {
      setShowEarnModal(true);
    }
  };

  return (
    <>
      {isEarnEnabled ? (
        <EarnGainAccessModal isOpen={showEarnModal} onClose={() => setShowEarnModal(false)} />
      ) : (
        <GuardianListSubscribeModal isOpen={showEarnModal} onClose={() => setShowEarnModal(false)} />
      )}
      <StyledBannerContainer onClick={handleClick}>
        <Typography variant="h6Bold" color="#FFF" style={{ maxWidth: '35%', textWrap: 'wrap' }}>
          <FormattedMessage defaultMessage="Early Access LIVE!" description="earn.banner.early-access-live" />
        </Typography>
        <Typography
          variant="bodyBold"
          color="#FFF"
          textAlign="right"
          alignSelf="end"
          lineHeight="1.2"
          style={{ maxWidth: '35%', textWrap: 'wrap' }}
        >
          <FormattedMessage defaultMessage="JOIN NOW!" description="earn.banner.join-now" />
        </Typography>
      </StyledBannerContainer>
    </>
  );
};

export default EarnBanner;
