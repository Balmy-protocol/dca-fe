import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import { NFTData } from 'types';
import { makeStyles } from '@material-ui/core/styles';

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

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onCancel} classes={{ paper: classes.paper }}>
      {nftData && <img src={nftData.image} alt="nft" />}
    </Dialog>
  );
};
export default ViewNFTModal;
