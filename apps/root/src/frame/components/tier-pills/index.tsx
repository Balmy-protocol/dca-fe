import React from 'react';
import ReferralCTA from './referral-cta';
import TierPill from './tier-pill';
import useUser from '@hooks/useUser';

const TierPills = () => {
  const user = useUser();
  if (!user) return null;

  return (
    <>
      <ReferralCTA />
      <TierPill />
    </>
  );
};

export default TierPills;
