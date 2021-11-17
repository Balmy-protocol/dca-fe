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

interface WithdrawModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const TerminateModal = ({ position, open, onCancel }: WithdrawModalProps) => {
  const classes = useStyles();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const { web3Service } = React.useContext(WalletContext);
  const availablePairs = useAvailablePairs();
  const [token0, token1] = sortTokens(position.from, position.to);
  const pair = find(availablePairs, { token0, token1 });
  const addTransaction = useTransactionAdder();

  const handleTerminate = async () => {
    try {
      onCancel();
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage description="Terminating position" defaultMessage="Terminating your position" />
          </Typography>
        ),
      });
      const result = await web3Service.terminate(position, pair as AvailablePair);
      addTransaction(result, { type: TRANSACTION_TYPES.TERMINATE_POSITION, typeData: { id: position.id } });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="position termination success"
            defaultMessage="Your {from}:{to} position termination has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      setModalError({ content: 'Error while terminating position' });
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" classes={{ paper: classes.paper }}>
      <StyledDialogContent>
        <Typography variant="h6">
          <FormattedMessage
            description="terminate title"
            defaultMessage="Terminate {from}:{to} position"
            values={{ from: position.from.symbol, to: position.to.symbol }}
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="terminate description"
            defaultMessage="Swaps are no longer going to be executed. You will get back {from} {fromSymbol} and {to} {toSymbol}"
            values={{
              from: formatUnits(position.remainingLiquidity, position.from.decimals),
              fromSymbol: position.from.symbol,
              to: formatUnits(position.swapped.sub(position.withdrawn), position.to.decimals),
              toSymbol: position.to.symbol,
            }}
          />
        </Typography>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="go back" defaultMessage="Go back" />
        </Button>
        <Button color="warning" variant="contained" fullWidth onClick={handleTerminate} autoFocus>
          <FormattedMessage description="Terminate" defaultMessage="Terminate" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default TerminateModal;
