import React from 'react';
import { ContainerBox, StyledNonFormContainer } from 'ui-library';
import CurrentTierView from '../current-tier';
import TierFAQ from '../faq';
import Referrals from '../referrals';
const TierViewFrame = () => {
  return (
    <StyledNonFormContainer>
      <ContainerBox flexDirection="column" gap={20} flex={1}>
        <CurrentTierView />
        {/* Referrals view */}
        <Referrals />
        {/* FAQS */}
        <TierFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};

export default TierViewFrame;
