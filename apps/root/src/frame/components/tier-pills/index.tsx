import React from 'react';
import ReferralCTA from './referral-cta';
import TierPill from './tier-pill';
import useUser from '@hooks/useUser';
import { useTheme } from 'styled-components';
import { useMediaQuery } from 'ui-library';

const TierPills = () => {
  const user = useUser();
  const { breakpoints } = useTheme();
  const isDownMd = useMediaQuery(breakpoints.down('md'));
  if (!user) return null;

  return (
    <>
      {!isDownMd && <ReferralCTA />}
      <TierPill />
    </>
  );
};

export default TierPills;
