import React from 'react';
import styled from 'styled-components';
import Modal from 'common/components/modal';
import { FullPosition } from 'types';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import useTransactionModal from 'hooks/useTransactionModal';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TRANSACTION_TYPES } from 'config/constants';
import TextField from '@mui/material/TextField';
import usePositionService from 'hooks/usePositionService';
import { fullPositionToMappedPosition } from 'common/utils/parsing';
import useErrorService from 'hooks/useErrorService';
import { shouldTrackError } from 'common/utils/errors';
import useTrackEvent from 'hooks/useTrackEvent';

const StyledTransferContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
  gap: 10px;
`;

interface TransferPositionModalProps {
  position: FullPosition;
  open: boolean;
  onCancel: () => void;
}

const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);
const validRegex = RegExp(/^0x[A-Fa-f0-9]{40}$/);

const TransferPositionModal = ({ position, open, onCancel }: TransferPositionModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const [toAddress, setToAddress] = React.useState('');
  const positionService = usePositionService();
  const errorService = useErrorService();
  const addTransaction = useTransactionAdder();
  const intl = useIntl();
  const trackEvent = useTrackEvent();

  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      setToAddress(nextValue);
    }
  };

  const handleTransfer = async () => {
    try {
      onCancel();
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Transfering position"
              defaultMessage="Transfering your position to {toAddress}"
              values={{ toAddress }}
            />
          </Typography>
        ),
      });
      trackEvent('DCA - Transfer position submitting');
      const result = await positionService.transfer(fullPositionToMappedPosition(position), toAddress);
      addTransaction(result, {
        type: TRANSACTION_TYPES.TRANSFER_POSITION,
        typeData: {
          id: fullPositionToMappedPosition(position).id,
          from: position.from.symbol,
          to: position.to.symbol,
          toAddress,
        },
        position: fullPositionToMappedPosition(position),
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="position transfer success"
            defaultMessage="Your {from}/{to} position transfer to {toAddress} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              toAddress,
            }}
          />
        ),
      });
      trackEvent('DCA - Transfer position submitted');
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e)) {
        trackEvent('DCA - Transfer position error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error while transfering position', JSON.stringify(e), {
          position: position.id,
          to: toAddress,
          chainId: position.chainId,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: (
          <FormattedMessage
            description="modalErrorTransferPosition"
            defaultMessage="Error while transfering position"
          />
        ),
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const isValid = validRegex.test(toAddress);

  return (
    <Modal
      open={open}
      showCloseButton
      showCloseIcon
      onClose={onCancel}
      maxWidth="sm"
      title={
        <FormattedMessage
          description="transfer title"
          defaultMessage="Transfer {from}/{to} position"
          values={{ from: position.from.symbol, to: position.to.symbol }}
        />
      }
      actions={[
        {
          label: <FormattedMessage description="Transfer" defaultMessage="Transfer" />,
          color: 'secondary',
          variant: 'contained',
          disabled: toAddress === '' || (!isValid && toAddress !== ''),
          onClick: handleTransfer,
        },
      ]}
    >
      <StyledTransferContainer>
        <Typography variant="body1">
          <FormattedMessage
            description="transfer description"
            defaultMessage="Set to whom you want to transfer your position to"
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="transfer sub description"
            defaultMessage="This will transfer your position, your NFT and all the liquidity stored in the position to the new address."
          />
        </Typography>
        <TextField
          id="toAddress"
          value={toAddress}
          placeholder={intl.formatMessage(
            defineMessage({ defaultMessage: 'Set the address to transfer', description: 'transferToModalPlaceholder' })
          )}
          autoComplete="off"
          autoCorrect="off"
          error={toAddress !== '' && !isValid}
          helperText={toAddress !== '' && !isValid ? 'This is not a valid address' : ''}
          fullWidth
          type="text"
          margin="normal"
          spellCheck="false"
          onChange={(evt) => validator(evt.target.value)}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          inputProps={{
            pattern: '^0x[A-Fa-f0-9]*$',
            minLength: 1,
            maxLength: 79,
          }}
        />
        <Typography variant="body1">
          <FormattedMessage description="transfer warning" defaultMessage="This cannot be undone." />
        </Typography>
      </StyledTransferContainer>
    </Modal>
  );
};
export default TransferPositionModal;
