import useAnalytics from '@hooks/useAnalytics';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { colors, ContainerBox, TagUserIcon, Typography } from 'ui-library';
import ReferralModal from '../referral-modal';

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

export default ReferralCTA;
