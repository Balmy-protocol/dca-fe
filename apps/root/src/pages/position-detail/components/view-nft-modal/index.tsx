import React from 'react';
import { Modal } from 'ui-library';
import { NFTData } from '@types';

interface ViewNFTModalProps {
  nftData: NFTData | null;
  onCancel: () => void;
  open: boolean;
}

const ViewNFTModal = ({ nftData, open, onCancel }: ViewNFTModalProps) => (
  <Modal open={open} showCloseIcon onClose={onCancel}>
    {nftData && <img src={nftData.image} style={{ height: '50rem' }} alt="nft" />}
  </Modal>
);
export default ViewNFTModal;
