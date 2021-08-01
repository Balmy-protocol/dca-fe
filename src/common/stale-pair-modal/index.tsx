import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { calculateStaleSwaps } from 'utils/parsing';
import { AvailablePair } from 'types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { BigNumber } from 'ethers';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledDialogContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  padding: 40px 72px !important;
  align-items: center;
  justify-content: center;
  text-align: center;
  *:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 32px 32px 32px;
`;

interface StalePairModalProps {
  pair?: AvailablePair;
  freqType: BigNumber;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

const StalePairModal = ({ pair, freqType, onConfirm, open, onCancel }: StalePairModalProps) => {
  const classes = useStyles();
  const staleSwaps = calculateStaleSwaps(pair?.lastExecutedAt || 0, freqType, pair?.createdAt || 0);

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="xs"
      classes={{ paper: classes.paper }}
    >
      <StyledDialogContent>
        <Typography variant="body1">
          <FormattedMessage
            description="stale pair message"
            defaultMessage="This pair has been stale for the last {staleSwaps} swaps for that frequency. Are you sure you want to create a position?"
            values={{
              staleSwaps: staleSwaps.toString(),
            }}
          />
        </Typography>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="cancel" defaultMessage="Cancel" />
        </Button>
        <Button color="secondary" variant="contained" fullWidth onClick={onConfirm} autoFocus>
          <FormattedMessage description="Create position submit" defaultMessage="Create position" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default StalePairModal;
