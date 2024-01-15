import React from 'react';
import { useAppDispatch } from '@hooks/state';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { setRecipient } from '@state/transfer/actions';
import { useTransferState } from '@state/transfer/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContentPasteIcon, InputAdornment, TextField, Tooltip, colors } from 'ui-library';
import { validateAddress } from '@common/utils/parsing';
import ContactListModal from './components/contact-list-modal';
import styled from 'styled-components';
import useValidateTransferRecipient from '@hooks/useValidateTransferRecipient';
import ContactsButton from 'ui-library/dist/components/contacts-button';
import { useThemeMode } from '@state/config/hooks';

const StyledPasteIcon = styled(ContentPasteIcon)`
  cursor: pointer;
`;

const StyledRecipientContainer = styled.div`
  ${({ theme: { spacing } }) => `
  display: flex;
  gap: ${spacing(3)};
  align-items: center;
  `}
`;

const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);

const RecipientAddress = () => {
  const intl = useIntl();
  const themeMode = useThemeMode();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const [recipientInput, setRecipientInput] = React.useState<string>('');
  const { token, recipient: storedRecipient } = useTransferState();
  const currentNetwork = useCurrentNetwork();
  const [shouldShowContactList, setShouldShowContactList] = React.useState<boolean>(false);
  const { isValidRecipient, errorMessage } = useValidateTransferRecipient(recipientInput);

  const onRecipientChange = (nextValue: string) => {
    if (!inputRegex.test(nextValue)) {
      return;
    }
    setRecipientInput(nextValue);

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
        shouldShow={shouldShowContactList}
        setShouldShow={setShouldShowContactList}
        onClickContact={onClickContact}
      />
      <StyledRecipientContainer>
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
          error={!isValidRecipient && !!errorMessage}
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
                  <StyledPasteIcon onClick={onPasteAddress} htmlColor={colors[themeMode].typography.typo4} />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        <ContactsButton onClick={() => setShouldShowContactList(true)} />
      </StyledRecipientContainer>
    </>
  );
};

export default RecipientAddress;
