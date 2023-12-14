import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { Typography, FormControlLabel, FormGroup, Checkbox, TextField, OpenInNewIcon, Button } from 'ui-library';
import { useAppDispatch } from '@state/hooks';
import { setTransferTo } from '@state/aggregator/actions';
import { buildEtherscanAddress } from '@common/utils/etherscan';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useTrackEvent from '@hooks/useTrackEvent';
import useValidateTransferRecipient from '@hooks/useValidateTransferRecipient';

const StyledTransferContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  flex: 1;
`;

const StyledWalletContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
`;

interface TransferToModalProps {
  transferTo: string | null;
  open: boolean;
  onCancel: () => void;
}

const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);

const TransferToModal = ({ transferTo, open, onCancel }: TransferToModalProps) => {
  const dispatch = useAppDispatch();
  const [toAddress, setToAddress] = React.useState(transferTo);
  const [validateCheckbox, setValidateCheckbox] = React.useState(false);
  const currentNetwork = useCurrentNetwork();
  const intl = useIntl();
  const trackEvent = useTrackEvent();
  const { isValidRecipient, errorMessage } = useValidateTransferRecipient(toAddress);

  const onRecipientChange = (nextValue: string) => {
    if (!inputRegex.test(nextValue)) {
      return;
    }
    setToAddress(nextValue);
  };

  const handleTransfer = () => {
    dispatch(setTransferTo(toAddress));
    onCancel();
    trackEvent('Aggregator - Set transfer to');
  };

  const onPasteAddress = async () => {
    const value = await navigator.clipboard.readText();

    setToAddress(value);
  };

  const onGoToEtherscan = () => {
    const url = buildEtherscanAddress(toAddress || '', currentNetwork.chainId);
    window.open(url, '_blank');
  };

  React.useEffect(() => {
    setToAddress(transferTo);
    setValidateCheckbox(false);
  }, [transferTo]);

  return (
    <Modal
      open={open}
      showCloseIcon
      onClose={onCancel}
      maxWidth="sm"
      title={<FormattedMessage description="transfer to title" defaultMessage="Transfer swap to another address" />}
      actions={[
        {
          label: <FormattedMessage description="transfer to selectAddress" defaultMessage="Confirm address" />,
          color: 'secondary',
          variant: 'contained',
          disabled: !isValidRecipient || !validateCheckbox,
          onClick: handleTransfer,
        },
      ]}
    >
      <StyledTransferContainer>
        <StyledWalletContainer>
          <Typography variant="body">
            <FormattedMessage description="wallet" defaultMessage="Wallet:" />
          </Typography>
          <Button variant="text" color="secondary" onClick={onPasteAddress}>
            <FormattedMessage description="paste" defaultMessage="Paste" />
          </Button>
        </StyledWalletContainer>
        <TextField
          id="toAddress"
          value={toAddress}
          placeholder={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Set the address to transfer to',
              description: 'transferToSwapModalPlaceholder',
            })
          )}
          autoComplete="off"
          autoCorrect="off"
          error={!isValidRecipient && !!errorMessage}
          helperText={errorMessage}
          fullWidth
          type="text"
          margin="normal"
          spellCheck="false"
          onChange={(evt) => onRecipientChange(evt.target.value)}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          inputProps={{
            pattern: '^0x[A-Fa-f0-9]*$',
            minLength: 1,
            maxLength: 79,
          }}
        />
        <Typography variant="bodySmall">
          <Button variant="text" color="secondary" onClick={onGoToEtherscan} disabled={!isValidRecipient}>
            <Typography variant="bodySmall" component="span">
              <FormattedMessage description="view on chain explorer" defaultMessage="View on chain explorer" />
            </Typography>
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </Button>
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={validateCheckbox}
                onChange={(evt) => setValidateCheckbox(evt.target.checked)}
                name="validateCheckbox"
              />
            }
            label={
              <FormattedMessage
                description="transferToValidateCheckboxLabel"
                defaultMessage="I confirm that the address above is correct"
              />
            }
          />
        </FormGroup>
      </StyledTransferContainer>
    </Modal>
  );
};
export default TransferToModal;
