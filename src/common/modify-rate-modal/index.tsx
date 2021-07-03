import React from 'react';
import find from 'lodash/find';
import { BigNumber } from 'ethers';
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
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import FrequencyInput from 'common/frequency-input';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';

interface ModifyRateModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const ModifyRateModal = ({ position, open, onCancel }: ModifyRateModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const { web3Service } = React.useContext(WalletContext);
  const [frequencyValue, setFrequencyValue] = React.useState(position.remainingSwaps.toString());
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
              description="Modifying frequency for position"
              defaultMessage="Changing your {from}:{to} position to finish in {frequencyValue} {frequencyType}"
              values={{
                from: position.from.symbol,
                to: position.to.symbol,
                frequencyValue,
                frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.toString()],
              }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.modifyRate(position, pair as AvailablePair, frequencyValue);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MODIFY_RATE_POSITION,
        typeData: { id: position.id, newRate: frequencyValue },
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

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <FormattedMessage description="modify rate" defaultMessage="Enter the new frequency that you want" />
        </DialogContentText>
        <FrequencyInput id="frequency-value" value={frequencyValue} label="" onChange={setFrequencyValue} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          <FormattedMessage description="Cancel" defaultMessage="Cancel" />
        </Button>
        <Button color="primary" onClick={handleWithdraw} autoFocus>
          <FormattedMessage description="Modify rate" defaultMessage="Modify" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ModifyRateModal;
