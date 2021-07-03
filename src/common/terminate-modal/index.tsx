import React from 'react';
import find from 'lodash/find';
import styled from 'styled-components';
import { formatUnits } from '@ethersproject/units';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { AvailablePair, Position } from 'types';
import { FormattedMessage } from 'react-intl';
import WalletContext from 'common/wallet-context';
import useTransactionModal from 'hooks/useTransactionModal';
import { sortTokens } from 'utils/parsing';
import ErrorIcon from '@material-ui/icons/Error';
import Typography from '@material-ui/core/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TRANSACTION_TYPES } from 'config/constants';

const StyledIconWrapper = styled.div`
  margin: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledErrorIcon = styled(ErrorIcon)`
  color: ${(props) => props.theme.palette.error.dark};
`;

interface WithdrawModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const TerminateModal = ({ position, open, onCancel }: WithdrawModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const { web3Service, availablePairs } = React.useContext(WalletContext);

  const [token0, token1] = sortTokens(position.from.address, position.to.address);
  const pair = find(availablePairs, { token0, token1 });
  const addTransaction = useTransactionAdder();

  const handleTerminate = async () => {
    try {
      onCancel();
      setModalLoading({
        content: (
          <Typography variant="subtitle2">
            <FormattedMessage description="Terminating position" defaultMessage="Terminating your position" />
          </Typography>
        ),
      });
      const result = await web3Service.terminate(position, pair as AvailablePair);
      addTransaction(result, { type: TRANSACTION_TYPES.TERMINATE_POSITION, typeData: { id: position.id } });
      setModalSuccess({
        hash: result.hash,
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogContent>
        <StyledIconWrapper>
          <Typography variant="h2">
            <StyledErrorIcon fontSize="inherit" />
          </Typography>
        </StyledIconWrapper>
        <DialogContentText id="alert-dialog-description">
          <Typography variant="h4">
            <FormattedMessage
              description="Terminate warning"
              defaultMessage="Are you sure you want to terminate this position?"
            />
          </Typography>
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
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
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          <FormattedMessage description="Cancel" defaultMessage="Cancel" />
        </Button>
        <Button color="secondary" variant="contained" onClick={handleTerminate} autoFocus>
          <FormattedMessage description="Terminate" defaultMessage="Terminate" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default TerminateModal;
