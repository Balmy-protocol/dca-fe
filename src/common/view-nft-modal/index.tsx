import React from 'react';
import find from 'lodash/find';
import styled from 'styled-components';
import { formatUnits } from '@ethersproject/units';
import Button from 'common/button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
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
      {nftData && <img src={nftData.image} />}
    </Dialog>
  );
};
export default ViewNFTModal;
