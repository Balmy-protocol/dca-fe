import React from 'react';
import find from 'lodash/find';
import styled from 'styled-components';
import { formatUnits } from '@ethersproject/units';
import Button from 'common/button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { AvailablePair, Position } from 'types';
import { FormattedMessage } from 'react-intl';
import WalletContext from 'common/wallet-context';
import useTransactionModal from 'hooks/useTransactionModal';
import { sortTokens } from 'utils/parsing';
import Typography from '@material-ui/core/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { makeStyles } from '@material-ui/core/styles';

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
  \ *:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 32px 32px 32px;
`;

interface WithdrawModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const WithdrawModal = ({ position, open, onCancel }: WithdrawModalProps) => {
  const classes = useStyles();
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const { web3Service } = React.useContext(WalletContext);

  const availablePairs = useAvailablePairs();
  const [token0, token1] = sortTokens(position.from.address, position.to.address);
  const pair = find(availablePairs, { token0, token1 });
  const addTransaction = useTransactionAdder();

  const handleWithdraw = async () => {
    try {
      onCancel();
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Withdrawing from"
              defaultMessage="Withdrawing {from}"
              values={{ from: position.to.symbol }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.withdraw(position, pair as AvailablePair);
      addTransaction(result, { type: TRANSACTION_TYPES.WITHDRAW_POSITION, typeData: { id: position.id } });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="withdraw from success"
            defaultMessage="Your withdrawal of {to} from your {from}:{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" classes={{ paper: classes.paper }}>
      <StyledDialogContent>
        <Typography variant="h6">
          <FormattedMessage
            description="withdraw title"
            defaultMessage="Withdraw {to} from {from}:{to} position"
            values={{ from: position.from.symbol, to: position.to.symbol }}
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="Withdraw warning"
            defaultMessage="Are you sure you want to withdraw {ammount} {from}?"
            values={{
              from: position.to.symbol,
              ammount: formatUnits(position.swapped.sub(position.withdrawn), position.to.decimals),
            }}
          />
        </Typography>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="go back" defaultMessage="Go back" />
        </Button>
        <Button color="secondary" variant="contained" fullWidth onClick={handleWithdraw} autoFocus>
          <FormattedMessage description="Withdraw" defaultMessage="Withdraw" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default WithdrawModal;
