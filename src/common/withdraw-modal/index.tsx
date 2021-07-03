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
import WarningIcon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';

const StyledIconWrapper = styled.div`
  margin: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledWarningIcon = styled(WarningIcon)`
  color: ${(props) => props.theme.palette.warning.dark};
`;
interface WithdrawModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const WithdrawModal = ({ position, open, onCancel }: WithdrawModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const { web3Service, availablePairs } = React.useContext(WalletContext);

  const [token0, token1] = sortTokens(position.from.address, position.to.address);
  const pair = find(availablePairs, { token0, token1 });
  const addTransaction = useTransactionAdder();

  const handleWithdraw = async () => {
    try {
      onCancel();
      setModalLoading({
        content: (
          <Typography variant="subtitle2">
            <FormattedMessage
              description="Withdrawing from"
              defaultMessage="Withdrawing {from}"
              values={{ from: position.to.symbol }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.withdraw(position, pair as AvailablePair);
      addTransaction(result);
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
            <StyledWarningIcon fontSize="inherit" />
          </Typography>
        </StyledIconWrapper>
        <DialogContentText id="alert-dialog-description">
          <FormattedMessage
            description="Withdraw warning"
            defaultMessage="Are you sure you want to withdraw {ammount} {from}"
            values={{
              from: position.to.symbol,
              ammount: formatUnits(position.swapped.sub(position.withdrawn), position.to.decimals),
            }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          <FormattedMessage description="Cancel" defaultMessage="Cancel" />
        </Button>
        <Button color="primary" onClick={handleWithdraw} autoFocus>
          <FormattedMessage description="Withdraw" defaultMessage="Withdraw" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default WithdrawModal;
