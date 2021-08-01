import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { AvailablePair } from 'types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { BigNumber } from 'ethers';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledDialogContent = styled(DialogContent)`
  padding: 40px 72px !important;
  align-items: center;
  justify-content: center;
  text-align: center;
  *:not(:first-child) {
    margin-left: 5px;
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
        <Typography variant="body1" component="span">
          <FormattedMessage description="stale pair message" defaultMessage="This pair is " />
        </Typography>
        <Typography variant="body1" component="span">
          <Link href="https://docs.mean.finance/concepts/positions#stale-positions" target="_blank">
            <FormattedMessage description="stale" defaultMessage="stale" />
          </Link>
        </Typography>
        <Typography variant="body1" component="span">
          <FormattedMessage
            description="stale pair message"
            defaultMessage=" for that frequency. Are you sure you want to create a position?"
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
