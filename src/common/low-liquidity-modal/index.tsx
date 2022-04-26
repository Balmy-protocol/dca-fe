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
import { POSSIBLE_ACTIONS } from 'config/constants';

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

interface LowLiquidityModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  actionToTake: keyof typeof POSSIBLE_ACTIONS;
}

const LowLiquidityModal = ({ actionToTake, onConfirm, open, onCancel }: LowLiquidityModalProps) => {
  const classes = useStyles();

  const actionMessages = React.useMemo(
    () => ({
      [POSSIBLE_ACTIONS.createPosition]: (
        <FormattedMessage description="lowLiqCreatePosition" defaultMessage="Create position" />
      ),
      [POSSIBLE_ACTIONS.approveToken]: (
        <FormattedMessage description="lowLiqApproveToken" defaultMessage="Approve token" />
      ),
    }),
    []
  );

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
        <Typography variant="body1" component="p">
          <FormattedMessage
            description="low liquidity message"
            defaultMessage="Due to low volume, the price oracle for this pair of tokens might not be reliable right now. Proceed with caution or try another pair"
          />
        </Typography>
        <Typography variant="body1" component="p">
          <StyledLink href="https://docs.mean.finance/concepts/price-oracle" target="_blank">
            <FormattedMessage description="low liquidity link" defaultMessage="Read about price oracle" />
          </StyledLink>
        </Typography>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="cancel" defaultMessage="Cancel" />
        </Button>
        <Button color="secondary" variant="contained" fullWidth onClick={onConfirm} autoFocus>
          {actionMessages[actionToTake]}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default LowLiquidityModal;
