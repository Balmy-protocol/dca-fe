import GuardianListSubscribeModal from '@frame/components/guardian-list-subscribe-modal';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, Typography } from 'ui-library';

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
  const [showGuardianListSubscribeModal, setShowGuardianListSubscribeModal] = React.useState(false);
  return (
    <>
      <GuardianListSubscribeModal
        isOpen={showGuardianListSubscribeModal}
        onClose={() => setShowGuardianListSubscribeModal(false)}
      />
      <StyledBannerContainer onClick={() => setShowGuardianListSubscribeModal(true)}>
        <Typography variant="h6Bold" color="#FFF" style={{ maxWidth: '35%', textWrap: 'wrap' }}>
          <FormattedMessage defaultMessage="Join the BETA" description="earn.banner.join-beta" />
        </Typography>
        <Typography
          variant="bodyBold"
          color="#FFF"
          textAlign="right"
          alignSelf="end"
          lineHeight="1.2"
          style={{ maxWidth: '35%', textWrap: 'wrap' }}
        >
          <FormattedMessage defaultMessage="Coming soon!" description="earn.banner.comming-soon" />
        </Typography>
      </StyledBannerContainer>
    </>
  );
};

export default EarnBanner;
