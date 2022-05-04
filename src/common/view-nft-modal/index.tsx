import React from 'react';
import Modal from 'common/modal';
import { NFTData } from 'types';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
});

interface ViewNFTModalProps {
  nftData: NFTData | null;
  onCancel: () => void;
  open: boolean;
}

const ViewNFTModal = ({ nftData, open, onCancel }: ViewNFTModalProps) => {
  const classes = useStyles();

  return <Modal open={open}>{nftData && <img src={nftData.image} alt="nft" />}</Modal>;
};
export default ViewNFTModal;
