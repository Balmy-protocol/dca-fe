import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { Button, ContainerBox, TextField, Zoom, useSnackbar } from 'ui-library';
import { Contact, SetStateCallback } from 'common-types';
import { ContactListActiveModal } from '..';
import useStoredLabels from '@hooks/useStoredLabels';
import useEditLabel from '@hooks/useEditLabel';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useTrackEvent from '@hooks/useTrackEvent';

interface AddContactModalProps {
  contact: Contact;
  setActiveModal: SetStateCallback<ContactListActiveModal>;
}

const EditContactModal = ({ contact, setActiveModal }: AddContactModalProps) => {
  const storedLabels = useStoredLabels();
  const [contactLabel, setContactLabel] = React.useState(storedLabels[contact.address]?.label || '');
  const { triggerUpdate, isLoading } = useEditLabel();
  const snackbar = useSnackbar();
  const trackEvent = useTrackEvent();
  const intl = useIntl();

  const onEditContact = async () => {
    try {
      trackEvent('Edit contact - submitting');
      await triggerUpdate(contactLabel, contact.address);
      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({ description: 'contactEditedSuccessfully', defaultMessage: 'Contact successfully edited' })
        ),
        {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          TransitionComponent: Zoom,
        }
      );
      setActiveModal(ContactListActiveModal.CONTACT_LIST);
      trackEvent('Edit contact - submited');
    } catch (e) {
      console.error(e);
      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({
            description: 'contactEditedSuccessfully',
            defaultMessage: "We weren't able to save your new Contact Name. Please try again later",
          })
        ),
        {
          variant: 'error',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          TransitionComponent: Zoom,
        }
      );
      trackEvent('Edit contact - error');
    }
  };

  return (
    <ContainerBox flexDirection="column" fullWidth alignItems="center" gap={6}>
      <ContainerBox flexDirection="column" fullWidth gap={2}>
        <TextField
          value={contactLabel}
          placeholder={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Contact Name',
              description: 'contactName',
            })
          )}
          onChange={(e) => setContactLabel(e.target.value)}
          fullWidth
        />
        <TextField id="editContactAddress" disabled value={contact.address} fullWidth type="text" />
      </ContainerBox>
      <Button variant="contained" size="large" onClick={onEditContact} fullWidth disabled={isLoading}>
        {isLoading ? (
          <CenteredLoadingIndicator size={32} />
        ) : (
          <FormattedMessage description="update" defaultMessage="Update" />
        )}
      </Button>
    </ContainerBox>
  );
};

export default EditContactModal;
