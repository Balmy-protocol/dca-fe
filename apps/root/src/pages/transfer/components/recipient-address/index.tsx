import React from 'react';
import { useAppDispatch } from '@hooks/state';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { setRecipient } from '@state/transfer/actions';
import { useTransferState } from '@state/transfer/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContentPasteIcon, IconButton, InputAdornment, TextField, Tooltip } from 'ui-library';
import useValidateAddress from '@hooks/useValidateAddress';
import useStoredContactList from '@hooks/useStoredContactList';

const RecipientAddress = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const { token, recipient: storedRecipient } = useTransferState();
  const currentNetwork = useCurrentNetwork();
  const contactList = useStoredContactList();
  const {
    validationResult: { isValidAddress, errorMessage },
    setAddress: setInputAddress,
  } = useValidateAddress({
    restrictActiveWallet: true,
  });

  const onRecipientChange = (nextValue: string) => {
    setInputAddress(nextValue);
    dispatch(setRecipient(nextValue));
    if (token) {
      replaceHistory(`/transfer/${currentNetwork.chainId}/${token.address}/${nextValue}`);
    }
  };

  React.useEffect(() => {
    onRecipientChange(storedRecipient);
  }, [storedRecipient]);

  const onPasteAddress = async () => {
    const value = await navigator.clipboard.readText();
    onRecipientChange(value);
  };

  const helperText = React.useMemo(() => {
    const contactMatch = contactList.find((contact) => contact.address === storedRecipient);

    if (errorMessage) {
      return errorMessage;
    } else if (contactMatch?.label.label) {
      return intl.formatMessage(
        defineMessage({
          description: 'matchContactHelper',
          defaultMessage: 'This address matches your contact {label}',
        }),
        {
          label: <b>{contactMatch.label.label}</b>,
        }
      );
    }
    // Avoid changing input height when having no helper text
    return ' ';
  }, [contactList, storedRecipient, intl, errorMessage]);

  return (
    <TextField
      id="recipientAddress"
      value={storedRecipient}
      placeholder={intl.formatMessage(
        defineMessage({
          defaultMessage: 'Recipient Address',
          description: 'recipientAddress',
        })
      )}
      autoComplete="off"
      autoCorrect="off"
      error={!isValidAddress && !!errorMessage}
      helperText={helperText}
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
  );
};

export default RecipientAddress;
