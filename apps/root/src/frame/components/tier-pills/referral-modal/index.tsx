import React from 'react';
import { ReferralsInformation } from '@pages/tier-view/referrals/card';
import { ShareReferralLinkContent } from '@pages/tier-view/referrals/share-link-container';
import { ContainerBox, DividerBorder2, Modal } from 'ui-library';

const ReferralModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal open={isOpen} onClose={onClose} closeOnBackdrop maxWidth="sm" showCloseIcon>
    <ContainerBox flexDirection="column" gap={6} style={{ textAlign: 'center' }}>
      <ContainerBox gap={8} flexDirection="column">
        <ShareReferralLinkContent isReferralModal />
      </ContainerBox>
      <DividerBorder2 />
      <ReferralsInformation isReferralModal />
    </ContainerBox>
  </Modal>
);

export default ReferralModal;
