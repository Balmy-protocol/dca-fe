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

const EarnBannerShapeUrl = 'url("https://ipfs.io/ipfs/QmUfxE7Zgeja78QuX5UnZ3D3qorFrvK7869NZSf97pbdeB")';

const StyledBannerContainer = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  alignItems: 'center',
  fullWidth: true,
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

const StyledEarnGuardianPill = styled(ContainerBox).attrs({
  justifyContent: 'center',
  alignItems: 'center',
})`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(0.5)} ${spacing(1)};
    background: #D0CCFF;
    border: 0.5px solid #FFFFFF;
    border-radius: ${spacing(4)};
    position: absolute;
    top: 20px;
    right: 40px;
  `}
`;

const EarnGuardianPill = () => (
  <StyledEarnGuardianPill>
    <Typography variant="bodyExtraExtraSmallBold" color="#791AFF">
      <FormattedMessage defaultMessage="Earn Guardian 🛡️" description="earn.banner.earn-guardian-pill" />
    </Typography>
  </StyledEarnGuardianPill>
);

const LMEarnBanner = () => {
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
        <EarnGuardianPill />
        <Typography variant="h6Bold" color="#FFF" style={{ maxWidth: '40%', textWrap: 'wrap' }}>
          <FormattedMessage
            defaultMessage="Don't miss $150k in $OP incentives!"
            description="earn.banner.lm-rewards-150-op"
          />
        </Typography>
      </StyledBannerContainer>
    </>
  );
};

export default LMEarnBanner;
