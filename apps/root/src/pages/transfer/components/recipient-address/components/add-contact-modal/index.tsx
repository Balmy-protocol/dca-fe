import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { Button, ContainerBox, Modal, SuccessCircleIcon, TextField, Typography, colors } from 'ui-library';
import useContactListService from '@hooks/useContactListService';
import useValidateAddress from '@hooks/useValidateAddress';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import styled from 'styled-components';
import ErrorCircleIcon from 'ui-library/src/icons/errorCircle';
import { SetStateCallback } from 'common-types';

interface AddContactModalProps {
  open: boolean;
  setOpen: SetStateCallback<boolean>;
  goBackToTransfer: () => void;
}

const StyledStatusTitle = styled(Typography).attrs({ variant: 'h5' })`
  ${({ theme: { palette } }) => `
  font-weight: bold;
  color: ${colors[palette.mode].typography.typo1};
  text-align: center;
`}
`;

const StyledInputsContainer = styled(ContainerBox)`
  margin: ${({ theme: { spacing } }) => `${spacing(7)} 0`};
`;

enum PostContactStatus {
  loading,
  success,
  error,
  none,
}

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
  <ContainerBox flexDirection="column" gap={6} alignItems="center">
    {icon}
    <ContainerBox flexDirection="column" gap={2}>
      <StyledStatusTitle>{title}</StyledStatusTitle>
      <Typography variant="body" textAlign="center">
        {description}
      </Typography>
    </ContainerBox>
    {button}
  </ContainerBox>
);

const AddContactModal = ({ open, setOpen, goBackToTransfer }: AddContactModalProps) => {
  const intl = useIntl();
  const contactListService = useContactListService();
  const [contactLabel, setContactLabel] = React.useState<string>('');
  const [postContactStatus, setPostContactStatus] = React.useState<PostContactStatus>(PostContactStatus.none);
  const {
    validationResult: { isValidAddress, errorMessage },
    address: contactAddress,
    setAddress: setContactAddress,
  } = useValidateAddress({ restrictContactRepetition: true });

  React.useEffect(() => {
    if (!open) {
      setPostContactStatus(PostContactStatus.none);
      setContactAddress('');
      setContactLabel('');
    }
  }, [open]);

  const onPostContact = async () => {
    setPostContactStatus(PostContactStatus.loading);
    try {
      await contactListService.addContact({ address: contactAddress.toLowerCase(), label: { label: contactLabel } });
      setPostContactStatus(PostContactStatus.success);
    } catch (err) {
      setPostContactStatus(PostContactStatus.error);
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
        postContactStatus !== PostContactStatus.error &&
        postContactStatus !== PostContactStatus.success && (
          <FormattedMessage description="addContactToContactList" defaultMessage="Add to your ContactList" />
        )
      }
      maxWidth="sm"
    >
      {postContactStatus === PostContactStatus.error ? (
        postContactError
      ) : postContactStatus === PostContactStatus.success ? (
        postContactSuccess
      ) : (
        <ContainerBox flexDirection="column" fullWidth>
          <StyledInputsContainer flexDirection="column" gap={2}>
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
              onChange={(e) => setContactAddress(e.target.value)}
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
          </StyledInputsContainer>
          <Button
            variant="contained"
            color="primary"
            onClick={onPostContact}
            disabled={!!errorMessage || !contactLabel || postContactStatus === PostContactStatus.loading}
            fullWidth
          >
            {postContactStatus === PostContactStatus.loading ? (
              <CenteredLoadingIndicator size={24} />
            ) : (
              <FormattedMessage description="addContact" defaultMessage="Add Contact" />
            )}
          </Button>
        </ContainerBox>
      )}
    </Modal>
  );
};

export default AddContactModal;
