import React from 'react';
import styled from 'styled-components';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { Typography, FormControlLabel, FormGroup, Checkbox, TextField, OpenInNewIcon, Button, Modal } from 'ui-library';
import { useAppDispatch } from '@state/hooks';
import { setTransferTo } from '@state/aggregator/actions';
import { buildEtherscanAddress } from '@common/utils/etherscan';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useAnalytics from '@hooks/useAnalytics';
import useValidateAddress from '@hooks/useValidateAddress';

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

const TransferToModal = ({ transferTo, open, onCancel }: TransferToModalProps) => {
  const dispatch = useAppDispatch();
  const [validateCheckbox, setValidateCheckbox] = React.useState(false);
  const currentNetwork = useCurrentNetwork();
  const intl = useIntl();
  const { trackEvent } = useAnalytics();
  const {
    validationResult: { isValidAddress: isValidRecipient, errorMessage },
    address: toAddress,
    setAddress: setToAddress,
  } = useValidateAddress({
    restrictActiveWallet: true,
    defaultValue: transferTo,
  });

  const onRecipientChange = (nextValue: string) => {
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
    setToAddress(transferTo || '');
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
          variant: 'contained',
          disabled: !isValidRecipient || !validateCheckbox,
          onClick: handleTransfer,
        },
      ]}
    >
      <StyledWalletContainer>
        <Typography variant="bodyRegular">
          <FormattedMessage description="wallet" defaultMessage="Wallet:" />
        </Typography>
        <Button variant="text" onClick={onPasteAddress}>
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
      <Typography variant="bodySmallRegular">
        <Button variant="text" onClick={onGoToEtherscan} disabled={!isValidRecipient}>
          <Typography variant="bodySmallRegular" component="span">
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
    </Modal>
  );
};
export default TransferToModal;
