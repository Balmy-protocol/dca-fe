import React from 'react';
import { Modal, Button } from 'ui-library';
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
      title={<FormattedMessage description="contactListModalTitle" defaultMessage="Select contact" />}
    >
      {contactList.map((contact) => (
        <Button key={contact.address} onClick={() => onClickContact(contact.address)}>
          <Address address={contact.address} trimAddress />
        </Button>
      ))}
    </Modal>
  );
};

export default ContactListModal;
