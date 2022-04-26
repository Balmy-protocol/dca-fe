import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import Link from '@mui/material/Link';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

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
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

const StalePairModal = ({ onConfirm, open, onCancel }: StalePairModalProps) => {
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
          <StyledLink href="https://docs.mean.finance/concepts/positions#stale-positions" target="_blank">
            <FormattedMessage description="stale" defaultMessage="stale" />
          </StyledLink>
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
