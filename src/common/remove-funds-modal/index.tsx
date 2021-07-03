import React from 'react';
import find from 'lodash/find';
import { parseUnits, formatUnits } from '@ethersproject/units';
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
import Typography from '@material-ui/core/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import TokenInput from 'common/token-input';

interface RemoveFundsModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const RemoveFundsModal = ({ position, open, onCancel }: RemoveFundsModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const { web3Service } = React.useContext(WalletContext);
  const [fromValue, setFromValue] = React.useState('');
  const availablePairs = useAvailablePairs();
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
              description="Withdrawing funds for position"
              defaultMessage="Returning {fromValue} {from} to you"
              values={{ from: position.from.symbol, fromValue: fromValue }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.removeFunds(position, pair as AvailablePair, fromValue);
      addTransaction(result, {
        type: TRANSACTION_TYPES.REMOVE_FUNDS,
        typeData: { id: position.id, ammountToRemove: fromValue, decimals: position.from.decimals },
      });
      setModalSuccess({
        hash: result.hash,
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  const hasError = fromValue && parseUnits(fromValue, position.from.decimals).gt(position.remainingLiquidity);

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <FormattedMessage
            description="modify rate"
            defaultMessage="Enter how much you want to withdraw from your position"
          />
        </DialogContentText>
        <TokenInput
          id="from-value"
          error={!!hasError ? 'Ammount cannot exceed your current funds' : ''}
          value={fromValue}
          label={position.from.symbol}
          onChange={setFromValue}
          withBalance={true}
          isLoadingBalance={false}
          balance={formatUnits(position.remainingLiquidity, position.from.decimals)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          <FormattedMessage description="Cancel" defaultMessage="Cancel" />
        </Button>
        <Button color="primary" onClick={handleWithdraw} autoFocus disabled={!!hasError}>
          <FormattedMessage description="Withdraw funds" defaultMessage="Withdraw funds" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default RemoveFundsModal;
