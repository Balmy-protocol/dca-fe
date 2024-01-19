import React from 'react';
import { useAppDispatch } from '@hooks/state';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { setRecipient } from '@state/transfer/actions';
import { useTransferState } from '@state/transfer/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContainerBox, ContentPasteIcon, IconButton, InputAdornment, TextField, Tooltip } from 'ui-library';
import { validateAddress } from '@common/utils/parsing';
import ContactListModal from './components/contact-list-modal';
import useValidateAddress from '@hooks/useValidateAddress';
import ContactsButton from './components/contacts-button';

const RecipientAddress = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const { token, recipient: storedRecipient } = useTransferState();
  const currentNetwork = useCurrentNetwork();
  const [shouldShowContactList, setShouldShowContactList] = React.useState<boolean>(false);
  const {
    validationResult: { isValidAddress, errorMessage },
    address: inputAddress,
    setAddress: setInputAddress,
  } = useValidateAddress({
    restrictActiveWallet: true,
  });

  const onRecipientChange = (nextValue: string) => {
    setInputAddress(nextValue);

    if (validateAddress(nextValue)) {
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

  return (
    <>
      <ContactListModal
        open={shouldShowContactList}
        setOpen={setShouldShowContactList}
        onClickContact={onClickContact}
      />
      <ContainerBox gap={3} alignItems="start">
        <TextField
          id="recipientAddress"
          value={inputAddress || storedRecipient}
          placeholder={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Recipient Address',
              description: 'recipientAddress',
            })
          )}
          autoComplete="off"
          autoCorrect="off"
          error={!isValidAddress && !!errorMessage}
          helperText={errorMessage}
          fullWidth
          type="text"
          margin="normal"
          spellCheck="false"
          onChange={(evt) => onRecipientChange(evt.target.value)}
          sx={{ margin: 0 }}
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
                  <IconButton onClick={onPasteAddress}>
                    <ContentPasteIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        <ContactsButton onClick={() => setShouldShowContactList(true)} />
      </ContainerBox>
    </>
  );
};

export default RecipientAddress;
