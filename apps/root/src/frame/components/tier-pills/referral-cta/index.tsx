import useAnalytics from '@hooks/useAnalytics';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { colors, ContainerBox, DividerBorder2, TagUserIcon, Typography } from 'ui-library';
import ReferralModal from '../referral-modal';
import styled from 'styled-components';
import useUser from '@hooks/useUser';

const ReferralCTA = () => {
  const { trackEvent } = useAnalytics();
  const [isReferralModalOpen, setIsReferralModalOpen] = React.useState(false);
  const onClick = () => {
    trackEvent('Navigation - Referral CTA Clicked');
    setIsReferralModalOpen(true);
  };

  return (
    <>
      <ReferralModal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} />
      <ContainerBox gap={2} alignItems="center" onClick={onClick} style={{ cursor: 'pointer' }}>
        <TagUserIcon fontSize="small" sx={({ palette }) => ({ color: colors[palette.mode].accent.primary })} />
        <Typography
          variant="bodySmallSemibold"
          sx={({ palette }) => ({ color: colors[palette.mode].typography.typo2 })}
        >
          <FormattedMessage description="navigation.referral-cta.title" defaultMessage="Refer a Friend!" />
        </Typography>
      </ContainerBox>
    </>
  );
};

const ShareReferralLinkContainer = styled(ContainerBox).attrs({ gap: 3, flexDirection: 'column' })`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const ReferralCTANavigation = () => {
  const user = useUser();
  if (!user) return null;

  return (
    <ShareReferralLinkContainer>
      <DividerBorder2 />
      <ReferralCTA />
    </ShareReferralLinkContainer>
  );
};

export default ReferralCTA;
