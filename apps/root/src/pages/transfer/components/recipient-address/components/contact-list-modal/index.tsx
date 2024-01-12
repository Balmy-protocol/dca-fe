import React from 'react';
import { Modal, Button, Typography } from 'ui-library';
import useStoredContactList from '@hooks/useStoredContactList';
import { FormattedMessage } from 'react-intl';
import Address from '@common/components/address';

interface ContactListModalProps {
  shouldShow: boolean;
  setShouldShow: React.Dispatch<React.SetStateAction<boolean>>;
  onClickContact: (newRecipient: string) => void;
}

const ContactListModal = ({ shouldShow, setShouldShow, onClickContact }: ContactListModalProps) => {
  const contactList = useStoredContactList();

  return (
    <Modal
      open={shouldShow}
      onClose={() => setShouldShow(false)}
      closeOnBackdrop={true}
      title={<FormattedMessage description="contactList" defaultMessage="Contact list" />}
      headerButton={
        <Button variant="outlined" color="primary">
          <Typography variant="body" fontWeight="bold">
            <FormattedMessage description="addContact" defaultMessage="Add Contact" />
          </Typography>
        </Button>
      }
    >
      {contactList.length === 0 ? (
        <>No contacts</>
      ) : (
        contactList.map((contact) => (
          <Button key={contact.address} onClick={() => onClickContact(contact.address)}>
            <Address address={contact.address} trimAddress />
          </Button>
        ))
      )}
    </Modal>
  );
};

export default ContactListModal;
