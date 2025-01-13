import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { Button, ContainerBox, ErrorCircleIcon, SuccessCircleIcon, TextField, Typography, colors } from 'ui-library';
import useContactListService from '@hooks/useContactListService';
import useValidateAddress from '@hooks/useValidateAddress';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import styled from 'styled-components';
import { SetStateCallback } from 'common-types';
import { ContactListActiveModal, PostContactStatus, StyledContactModalParagraph } from '..';
import useAnalytics from '@hooks/useAnalytics';

interface AddContactModalProps {
  activeModal: ContactListActiveModal;
  setActiveModal: SetStateCallback<ContactListActiveModal>;
  defaultAddressValue?: string;
  clearDefaultAddressValue?: () => void;
  postContactStatus: PostContactStatus;
  setPostContactStatus: SetStateCallback<PostContactStatus>;
  goBack?: () => void;
}

const StyledStatusTitle = styled(Typography).attrs({ variant: 'h5Bold' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo1};
  text-align: center;
`}
`;

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
      <StyledContactModalParagraph>{description}</StyledContactModalParagraph>
    </ContainerBox>
    {button}
  </ContainerBox>
);

const AddContactModal = ({
  activeModal,
  setActiveModal,
  defaultAddressValue,
  clearDefaultAddressValue,
  postContactStatus,
  setPostContactStatus,
  goBack,
}: AddContactModalProps) => {
  const intl = useIntl();
  const contactListService = useContactListService();
  const [contactLabel, setContactLabel] = React.useState<string>('');
  const {
    validationResult: { isValidAddress, errorMessage },
    address: contactAddress,
    setAddress: setContactAddress,
  } = useValidateAddress({
    restrictContactRepetition: true,
    defaultValue: defaultAddressValue,
  });
  const { trackEvent } = useAnalytics();

  React.useEffect(() => {
    if (activeModal !== ContactListActiveModal.ADD_CONTACT) {
      setPostContactStatus(PostContactStatus.NONE);
      setContactAddress('');
      setContactLabel('');
      if (clearDefaultAddressValue) clearDefaultAddressValue();
    }
  }, [activeModal]);

  const onPostContact = async () => {
    setPostContactStatus(PostContactStatus.LOADING);
    try {
      trackEvent('Add contact modal - Submitting');
      await contactListService.addContact({ address: contactAddress.toLowerCase(), label: { label: contactLabel } });
      trackEvent('Add contact modal - Submitted');
      setPostContactStatus(PostContactStatus.SUCCESS);
    } catch (err) {
      setPostContactStatus(PostContactStatus.ERROR);
      console.error(err);
      trackEvent('Add contact modal - error');
    }
  };

  const postContactSuccess = React.useMemo(
    () => (
      <PostContactStatusContent
        icon={<SuccessCircleIcon />}
        title={<FormattedMessage description="addContactSuccessTitle" defaultMessage="Contact successfully added" />}
        description={
          <FormattedMessage
            description="addContactSuccessDescription"
            defaultMessage="Next time, you can select them when making a transfer. Feel free to edit it wherever you want."
          />
        }
        button={
          <Button
            variant="contained"
            onClick={() => {
              setActiveModal(ContactListActiveModal.CONTACT_LIST);
              setPostContactStatus(PostContactStatus.NONE);
            }}
            fullWidth
            size="large"
          >
            <FormattedMessage description="done" defaultMessage="Done" />
          </Button>
        }
      />
    ),
    []
  );

  const postContactError = React.useMemo(
    () => (
      <PostContactStatusContent
        icon={<ErrorCircleIcon />}
        title={<FormattedMessage description="addContactErrorTitle" defaultMessage="Unable to Add Contact" />}
        description={
          <FormattedMessage
            description="addContactErrorDescription"
            defaultMessage="We couldn't add the contact at this time. Please verify the information and try again. If the issue continues, reach out to our support for help."
          />
        }
        button={
          <Button
            variant="contained"
            size="large"
            onClick={() => setActiveModal(ContactListActiveModal.NONE)}
            fullWidth
          >
            <FormattedMessage description="returnToTransfer" defaultMessage="Return to Transfer" />
          </Button>
        }
      />
    ),
    []
  );

  return (
    <>
      {postContactStatus === PostContactStatus.ERROR ? (
        postContactError
      ) : postContactStatus === PostContactStatus.SUCCESS ? (
        postContactSuccess
      ) : (
        <>
          <ContainerBox flexDirection="column" fullWidth gap={2}>
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
            <TextField
              id="recipientAddress"
              value={contactAddress}
              placeholder="0x..."
              autoComplete="off"
              autoCorrect="off"
              error={!isValidAddress && !!errorMessage}
              helperText={errorMessage || ' '}
              fullWidth
              type="text"
              spellCheck="false"
              onChange={(e) => setContactAddress(e.target.value)}
              sx={{ margin: 0 }}
              inputProps={{
                pattern: '^0x[A-Fa-f0-9]*$',
                minLength: 1,
                maxLength: 79,
              }}
            />
          </ContainerBox>
          <ContainerBox gap={6}>
            {goBack && (
              <Button variant="outlined" size="large" onClick={goBack} fullWidth>
                <FormattedMessage description="add-contact-modal.buttons.cancel" defaultMessage="Cancel" />
              </Button>
            )}
            <Button
              variant="contained"
              size="large"
              onClick={onPostContact}
              disabled={!!errorMessage || !contactAddress || postContactStatus === PostContactStatus.LOADING}
              fullWidth
            >
              {postContactStatus === PostContactStatus.LOADING ? (
                <CenteredLoadingIndicator size={24} />
              ) : (
                <FormattedMessage description="addContact" defaultMessage="Add Contact" />
              )}
            </Button>
          </ContainerBox>
        </>
      )}
    </>
  );
};

export default AddContactModal;
