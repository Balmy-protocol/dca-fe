import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { Button, Grid, Modal, SuccessCircleIcon, TextField, Typography, colors } from 'ui-library';
import useContactListService from '@hooks/useContactListService';
import useStoredContactList from '@hooks/useStoredContactList';
import useValidateAddress, { ValidationOutput } from '@hooks/useValidateAddress';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import styled from 'styled-components';
import ErrorCircleIcon from 'ui-library/src/icons/errorCircle';

interface AddContactModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  goBackToTransfer: () => void;
}

const StyledStatusTitle = styled(Typography).attrs({ variant: 'h5' })`
  ${({ theme: { palette } }) => `
  font-weight: bold;
  color: ${colors[palette.mode].typography.typo1};
  text-align: center;
`}
`;

const StyledStatusDescription = styled(Typography).attrs({ variant: 'body1' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2}
  text-align: center;
`}
`;

const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);

const PostContactStatusContent = ({
  icon,
  title,
  description,
  button,
}: {
  icon: React.ReactElement;
  title: React.ReactElement;
  description: React.ReactElement;
  button: React.ReactElement;
}) => (
  <Grid container direction="column" rowGap={6}>
    <Grid item xs={12}>
      {icon}
    </Grid>
    <Grid container rowGap={2} direction="column">
      <StyledStatusTitle>{title}</StyledStatusTitle>
      <StyledStatusDescription>{description}</StyledStatusDescription>
    </Grid>
    <Grid item xs={12}>
      {button}
    </Grid>
  </Grid>
);

const AddContactModal = ({ open, setOpen, goBackToTransfer }: AddContactModalProps) => {
  const intl = useIntl();
  const contactListService = useContactListService();
  const contactList = useStoredContactList();
  const [contactAddress, setContactAddress] = React.useState<string>('');
  const [contactLabel, setContactLabel] = React.useState<string>('');
  const [postContactStatus, setPostContactStatus] = React.useState<'loading' | 'success' | 'error' | null>(null);

  React.useEffect(() => {
    if (!open) {
      setPostContactStatus(null);
      setContactAddress('');
      setContactLabel('');
    }
  }, [open]);

  const validateContactRepetition = React.useCallback<() => ValidationOutput>(() => {
    if (contactList.some((contact) => contact.address === contactAddress.toLowerCase())) {
      return {
        errorMessage: intl.formatMessage(
          defineMessage({
            defaultMessage: 'Contact already exists',
            description: 'contactAlreadyExists',
          })
        ),
        isValidAddress: false,
      };
    }
    return {
      isValidAddress: true,
      errorMessage: '',
    };
  }, [contactList, contactAddress]);

  const { isValidAddress, errorMessage } = useValidateAddress({
    address: contactAddress,
    additionalValidations: [validateContactRepetition],
  });

  const onChangeAddress = (nextValue: string) => {
    if (!inputRegex.test(nextValue)) {
      return;
    }
    setContactAddress(nextValue);
  };

  const onPostContact = async () => {
    setPostContactStatus('loading');
    try {
      await contactListService.addContact({ address: contactAddress.toLowerCase(), label: contactLabel });
      setPostContactStatus('success');
    } catch (err) {
      setPostContactStatus('error');
      console.error(err);
    }
  };

  const postContactSuccess = React.useMemo(
    () => (
      <PostContactStatusContent
        icon={<SuccessCircleIcon sx={{ fontSize: '105px' }} />}
        title={<FormattedMessage description="addContactSuccessTitle" defaultMessage="Contact successfully added" />}
        description={
          <FormattedMessage
            description="addContactSuccessDescription"
            defaultMessage="Next time, you can select them when making a transfer. Feel free to edit it wherever you want."
          />
        }
        button={
          <Button variant="contained" color="primary" onClick={() => setOpen(false)} fullWidth>
            <FormattedMessage description="done" defaultMessage="Done" />
          </Button>
        }
      />
    ),
    [setOpen]
  );

  const postContactError = React.useMemo(
    () => (
      <PostContactStatusContent
        icon={<ErrorCircleIcon sx={{ fontSize: '105px' }} />}
        title={<FormattedMessage description="addContactErrorTitle" defaultMessage="Unable to Add Contact" />}
        description={
          <FormattedMessage
            description="addContactErrorDescription"
            defaultMessage="We couldn't add the contact at this time. Please verify the information and try again. If the issue continues, reach out to our support for help."
          />
        }
        button={
          <Button variant="contained" color="primary" onClick={() => goBackToTransfer()} fullWidth>
            <FormattedMessage description="returnToTransfer" defaultMessage="Return to Transfer" />
          </Button>
        }
      />
    ),
    [setOpen]
  );

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      closeOnBackdrop={true}
      title={
        !postContactStatus && (
          <FormattedMessage description="addContactToContactList" defaultMessage="Add to your ContactList" />
        )
      }
      maxWidth="sm"
    >
      {postContactStatus === 'error' ? (
        postContactError
      ) : postContactStatus === 'success' ? (
        postContactSuccess
      ) : (
        <Grid container direction="column">
          <Grid container direction="column" rowGap={2} marginY={7}>
            <TextField
              id="recipientAddress"
              value={contactAddress}
              placeholder="0x..."
              autoComplete="off"
              autoCorrect="off"
              error={!isValidAddress && !!errorMessage}
              helperText={errorMessage}
              fullWidth
              type="text"
              margin="normal"
              spellCheck="false"
              onChange={(e) => onChangeAddress(e.target.value)}
              sx={{ margin: 0 }}
              inputProps={{
                pattern: '^0x[A-Fa-f0-9]*$',
                minLength: 1,
                maxLength: 79,
              }}
            />
            <TextField
              placeholder={intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Contact Name',
                  description: 'contactName',
                })
              )}
              value={contactLabel}
              onChange={(e) => setContactLabel(e.target.value)}
            />
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={onPostContact}
            disabled={!!errorMessage || !contactLabel || postContactStatus === 'loading'}
            fullWidth
          >
            {postContactStatus === 'loading' ? (
              <CenteredLoadingIndicator size={24} />
            ) : (
              <FormattedMessage description="addContact" defaultMessage="Add Contact" />
            )}
          </Button>
        </Grid>
      )}
    </Modal>
  );
};

export default AddContactModal;
