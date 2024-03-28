import React from 'react';
import {
  Modal,
  Button,
  Typography,
  colors,
  TextField,
  InputAdornment,
  SearchIcon,
  Divider,
  ContainerBox,
} from 'ui-library';
import useStoredContactList from '@hooks/useStoredContactList';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import ContactItem, { SkeletonContactItem } from '../contact-item';
import { Contact, SetStateCallback } from 'common-types';
import useContactListService from '@hooks/useContactListService';
import styled from 'styled-components';
import useIsLoadingContactList from '@hooks/useIsLoadingContacts';
import AddContactModal from '../add-contact-modal';
import EditContactModal from '../edit-contact-modal';

const StyledNoContactsTextContainer = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 2 })`
  text-align: center;
  ${({ theme: { palette } }) => colors[palette.mode].typography.typo3};
`;

interface ContactListModalProps {
  setActiveModal: SetStateCallback<ContactListActiveModal>;
  contactList: ReturnType<typeof useStoredContactList>;
  setEditingContact: SetStateCallback<Contact>;
}

export enum PostContactStatus {
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NONE = 'NONE',
}

export enum ContactListActiveModal {
  CONTACT_LIST = 'CONTACT_LIST',
  ADD_CONTACT = 'ADD_CONTACT',
  EDIT_CONTACT = 'EDIT_CONTACT',
  NONE = 'NONE',
}

const SKELETON_ROWS = Array.from(Array(7).keys());

const ContactListModal = ({ setActiveModal, contactList, setEditingContact }: ContactListModalProps) => {
  const contactListService = useContactListService();
  const isLoadingContactList = useIsLoadingContactList();
  const themeMode = useThemeMode();
  const intl = useIntl();
  const [searchValue, setSearchValue] = React.useState('');

  React.useEffect(() => {
    return () => {
      setSearchValue('');
    };
  }, []);

  const onDeleteContact = async (contact: Contact) => {
    await contactListService.removeContact(contact);
  };

  const onStartEditingContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const noContactsModalContent = React.useMemo(
    () => (
      <ContainerBox flexDirection="column" justifyContent="center" gap={6}>
        <StyledNoContactsTextContainer>
          <Typography variant="h3">🫵</Typography>
          <Typography variant="h5" fontWeight="bold">
            <FormattedMessage description="noContactsTitle" defaultMessage="Your Contact List Awaits!" />
          </Typography>
          <Typography variant="body1">
            <FormattedMessage
              description="noContactsDescription"
              defaultMessage="Looks like you haven't added any contacts yet. Start building your contact list now for easier and faster transactions. Simply click 'Add Contact' to begin."
            />
          </Typography>
        </StyledNoContactsTextContainer>
        <ContainerBox fullWidth justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => setActiveModal(ContactListActiveModal.ADD_CONTACT)}
            fullWidth
          >
            <FormattedMessage description="addContact" defaultMessage="Add Contact" />
          </Button>
        </ContainerBox>
      </ContainerBox>
    ),
    [themeMode]
  );

  const noContactsOnSearch = React.useMemo(
    () => (
      <StyledNoContactsTextContainer>
        <Typography variant="h3">🤷‍♂️</Typography>
        <Typography variant="body1" fontWeight={600}>
          <FormattedMessage description="noContactsFound" defaultMessage="No contact found" />
        </Typography>
      </StyledNoContactsTextContainer>
    ),
    [themeMode]
  );

  const filteredContacts = React.useMemo(
    () =>
      contactList.filter(
        (contact) =>
          contact.address.toLowerCase().includes(searchValue.toLowerCase()) ||
          contact.label?.label.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [contactList, searchValue]
  );

  return (
    <>
      {contactList.length === 0 && !isLoadingContactList ? (
        noContactsModalContent
      ) : (
        <ContainerBox flexDirection="column" gap={6} fullWidth>
          <TextField
            fullWidth
            placeholder={intl.formatMessage(
              defineMessage({
                defaultMessage: 'Search by Alias or Address',
                description: 'searchContact',
              })
            )}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon htmlColor={colors[themeMode].typography.typo4} />
                </InputAdornment>
              ),
            }}
          />
          <Divider sx={{ borderColor: colors[themeMode].border.border2 }} />
          <ContainerBox flexDirection="column" gap={1}>
            {contactList.length === 0 && isLoadingContactList
              ? SKELETON_ROWS.map((key) => <SkeletonContactItem key={key} />)
              : filteredContacts.length === 0
              ? noContactsOnSearch
              : filteredContacts.map((contact) => (
                  <ContactItem
                    key={contact.address}
                    contact={contact}
                    onDeleteContact={onDeleteContact}
                    setActiveModal={setActiveModal}
                    onStartEditingContact={onStartEditingContact}
                  />
                ))}
          </ContainerBox>
        </ContainerBox>
      )}
    </>
  );
};

interface ContactModalProps {
  activeModal: ContactListActiveModal;
  setActiveModal: SetStateCallback<ContactListActiveModal>;
  defaultAddressValue?: string;
  clearDefaultAddressValue: () => void;
}

const ContactModal = ({
  activeModal,
  setActiveModal,
  defaultAddressValue,
  clearDefaultAddressValue,
}: ContactModalProps) => {
  const contactList = useStoredContactList();
  const [postContactStatus, setPostContactStatus] = React.useState<PostContactStatus>(PostContactStatus.NONE);
  const [editingContact, setEditingContact] = React.useState<Contact>();

  const modalData = React.useMemo<
    Record<ContactListActiveModal, { title?: React.ReactElement; content: React.ReactElement }>
  >(
    () => ({
      [ContactListActiveModal.CONTACT_LIST]: {
        title: <FormattedMessage description="contactListTitle" defaultMessage="Contact list" />,
        content: (
          <ContactListModal
            setActiveModal={setActiveModal}
            contactList={contactList}
            setEditingContact={setEditingContact}
          />
        ),
      },
      [ContactListActiveModal.ADD_CONTACT]: {
        title:
          postContactStatus !== PostContactStatus.ERROR && postContactStatus !== PostContactStatus.SUCCESS ? (
            <FormattedMessage description="addToContactListTitle" defaultMessage="Add to your Contact List" />
          ) : undefined,
        content: (
          <AddContactModal
            activeModal={activeModal}
            setActiveModal={setActiveModal}
            setPostContactStatus={setPostContactStatus}
            postContactStatus={postContactStatus}
            clearDefaultAddressValue={clearDefaultAddressValue}
            defaultAddressValue={defaultAddressValue}
          />
        ),
      },
      [ContactListActiveModal.EDIT_CONTACT]: {
        title: <FormattedMessage description="editContactTitle" defaultMessage="Edit your Contact" />,
        content: editingContact ? <EditContactModal setActiveModal={setActiveModal} contact={editingContact} /> : <></>,
      },
      [ContactListActiveModal.NONE]: { content: <></> },
    }),
    [contactList, postContactStatus, defaultAddressValue, activeModal, editingContact]
  );

  return (
    <Modal
      open={activeModal !== ContactListActiveModal.NONE}
      onClose={() => setActiveModal(ContactListActiveModal.NONE)}
      closeOnBackdrop
      title={modalData[activeModal].title}
      headerButton={
        activeModal === ContactListActiveModal.CONTACT_LIST &&
        contactList.length !== 0 && (
          <Button variant="outlined" onClick={() => setActiveModal(ContactListActiveModal.ADD_CONTACT)}>
            <FormattedMessage description="addContact" defaultMessage="Add Contact" />
          </Button>
        )
      }
      maxWidth="sm"
    >
      {modalData[activeModal].content}
    </Modal>
  );
};

export default ContactModal;
