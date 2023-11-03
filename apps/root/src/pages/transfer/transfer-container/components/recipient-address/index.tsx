import React from 'react';
import { useAppDispatch } from '@hooks/state';
import useActiveWallet from '@hooks/useActiveWallet';
import { setRecipient } from '@state/transfer/actions';
import { useTransferState } from '@state/transfer/hooks';
import { defineMessage, useIntl } from 'react-intl';
import { DescriptionOutlinedIcon, IconButton, InputAdornment, TextField } from 'ui-library';
import ContactListModal from './components/contact-list-modal';

interface RecipientAddressProps {
  isValid: boolean;
  recipientParam?: string;
}

const RecipientAddress = ({ isValid, recipientParam }: RecipientAddressProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const activeWallet = useActiveWallet();
  const { recipient } = useTransferState();
  const [shouldShowContactList, setShouldShowContactList] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (recipientParam) {
      dispatch(setRecipient(recipientParam));
    }
  }, [setRecipient]);

  const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);

  const onSetRecipient = (newRecipient: string) => {
    dispatch(setRecipient(newRecipient));
  };

  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onSetRecipient(nextValue);
    }
  };

  const hasError = recipient !== '' && recipient !== null && !isValid;

  let error = '';
  if (hasError) {
    if (recipient.toLowerCase() === activeWallet?.address.toLowerCase()) {
      error = 'Transfer address cannot be the same as your address';
    } else {
      error = 'This is not a valid address';
    }
  }

  return (
    <>
      <ContactListModal
        shouldShow={shouldShowContactList}
        setShouldShow={setShouldShowContactList}
        onClickContact={onSetRecipient}
      />
      <TextField
        id="recipientAddress"
        value={recipient}
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
        onChange={(evt) => validator(evt.target.value)}
        inputProps={{
          pattern: '^0x[A-Fa-f0-9]*$',
          minLength: 1,
          maxLength: 79,
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
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
