import React from 'react';
import { useAppDispatch } from '@hooks/state';
import useActiveWallet from '@hooks/useActiveWallet';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { setRecipient } from '@state/transfer/actions';
import { useTransferState } from '@state/transfer/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContentPasteIcon, DescriptionOutlinedIcon, IconButton, InputAdornment, TextField, Tooltip } from 'ui-library';
import { validateAddress } from '@common/utils/parsing';
import ContactListModal from './components/contact-list-modal';
import styled from 'styled-components';

const StyledPasteIcon = styled(ContentPasteIcon)`
  cursor: pointer;
`;

const RecipientAddress = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const activeWallet = useActiveWallet();
  const [recipientInput, setRecipientInput] = React.useState<string>('');
  const { token, recipient: storedRecipient } = useTransferState();
  const currentNetwork = useCurrentNetwork();
  const [shouldShowContactList, setShouldShowContactList] = React.useState<boolean>(false);

  const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);
  const { isValidRecipient } = validateAddress(recipientInput, activeWallet?.address);

  const onRecipientChange = (nextValue: string) => {
    if (!inputRegex.test(nextValue)) {
      return;
    }
    setRecipientInput(nextValue);
    const { isValidRecipient: isValid } = validateAddress(nextValue, activeWallet?.address);

    if (isValid) {
      dispatch(setRecipient(nextValue));
      if (token) {
        replaceHistory(`/transfer/${currentNetwork.chainId}/${token.address}/${nextValue}`);
      }
    } else if (storedRecipient) {
      // Clear the stored recipient if the input is not valid
      dispatch(setRecipient(''));
    }
  };

  const onClickContact = (contactAddress: string) => {
    onRecipientChange(contactAddress);
    setShouldShowContactList(false);
  };

  const onPasteAddress = async () => {
    const value = await navigator.clipboard.readText();
    onRecipientChange(value);
  };

  const hasError = recipientInput !== '' && recipientInput !== null && !isValidRecipient;

  let error = '';
  if (hasError) {
    if (recipientInput.toLowerCase() === activeWallet?.address.toLowerCase()) {
      error = intl.formatMessage({
        defaultMessage: 'Transfer address cannot be the same as your address',
        description: 'errorSameAddress',
      });
    } else {
      error = intl.formatMessage({
        defaultMessage: 'This is not a valid address',
        description: 'errorInvalidAddress',
      });
    }
  }

  return (
    <>
      <ContactListModal
        shouldShow={shouldShowContactList}
        setShouldShow={setShouldShowContactList}
        onClickContact={onClickContact}
      />
      <TextField
        id="recipientAddress"
        value={recipientInput || storedRecipient}
        placeholder={intl.formatMessage(
          defineMessage({
            defaultMessage: 'Recipient Address',
            description: 'recipientAddress',
          })
        )}
        autoComplete="off"
        autoCorrect="off"
        error={hasError}
        helperText={hasError ? error : ''}
        fullWidth
        type="text"
        margin="normal"
        spellCheck="false"
        onChange={(evt) => onRecipientChange(evt.target.value)}
        inputProps={{
          pattern: '^0x[A-Fa-f0-9]*$',
          minLength: 1,
          maxLength: 79,
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip
                title={<FormattedMessage description="pasteAddress" defaultMessage="Paste address from clipboard" />}
                arrow
                placement="top"
              >
                <StyledPasteIcon onClick={onPasteAddress} />
              </Tooltip>
              <IconButton edge="end" onClick={() => setShouldShowContactList(true)}>
                <DescriptionOutlinedIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </>
  );
};

export default RecipientAddress;
