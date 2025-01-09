import React from 'react';
import {
  Modal,
  Button,
  Typography,
  colors,
  TextField,
  InputAdornment,
  SearchIcon,
  DividerBorder2,
  ContainerBox,
  SeedlingEmoji,
  ManShruggingEmoji,
  useTheme,
} from 'ui-library';
import useStoredContactList from '@hooks/useStoredContactList';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import ContactItem, { SkeletonContactItem } from './contact-item';
import { Contact, SetStateCallback } from 'common-types';
import useContactListService from '@hooks/useContactListService';
import styled from 'styled-components';
import useIsLoadingContactList from '@hooks/useIsLoadingContacts';
import AddContactModal from './add-contact-modal';
import EditContactModal from './edit-contact-modal';
import useAnalytics from '@hooks/useAnalytics';
import useActiveWallet from '@hooks/useActiveWallet';

const PARAGRAPH_MAX_WIDTH = '420px';
const CONTACT_LIST_MAX_HEIGHT = '268px';

const StyledNoContactsContainer = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 6, alignItems: 'center' })`
  ${({ theme: { spacing } }) => `
   padding: ${spacing(5)} 0;
  `}
`;

const StyledContactListcontainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 1,
})`
  max-height: ${CONTACT_LIST_MAX_HEIGHT};
  overflow: scroll;
`;

export const StyledContactModalParagraph = styled(Typography).attrs({
  variant: 'bodyRegular',
  textAlign: 'center',
})`
  max-width: ${PARAGRAPH_MAX_WIDTH};
`;

interface ContactListModalProps {
  setActiveModal: SetStateCallback<ContactListActiveModal>;
  contactList: ReturnType<typeof useStoredContactList>;
  setEditingContact: SetStateCallback<Contact>;
  innerInput?: React.ReactElement;
  onClickContact: (newRecipient: string) => void;
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

const ContactListModal = ({
  setActiveModal,
  contactList,
  setEditingContact,
  innerInput,
  onClickContact,
}: ContactListModalProps) => {
  const contactListService = useContactListService();
  const isLoadingContactList = useIsLoadingContactList();
  const { palette, spacing } = useTheme();
  const intl = useIntl();
  const [searchValue, setSearchValue] = React.useState('');
  const activeWallet = useActiveWallet();

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
      <StyledNoContactsContainer>
        <ContainerBox flexDirection="column" alignItems="center" gap={2}>
          <SeedlingEmoji size={spacing(8)} />
          <Typography variant="h5Bold" color={colors[palette.mode].typography.typo3}>
            <FormattedMessage description="noContactsTitle" defaultMessage="Your Contact List Awaits!" />
          </Typography>
          <StyledContactModalParagraph color={colors[palette.mode].typography.typo3}>
            <FormattedMessage
              description="noContactsDescription"
              defaultMessage="Looks like you haven't added any contacts yet. Start building your contact list now for easier and faster transactions. Simply click 'Add Contact' to begin."
            />
          </StyledContactModalParagraph>
        </ContainerBox>
        <Button
          variant="contained"
          size="large"
          onClick={() => setActiveModal(ContactListActiveModal.ADD_CONTACT)}
          fullWidth
        >
          <FormattedMessage description="addContact" defaultMessage="Add Contact" />
        </Button>
      </StyledNoContactsContainer>
    ),
    [palette]
  );

  const noContactsOnSearch = React.useMemo(
    () => (
      <ContainerBox flexDirection="column" alignItems="center" gap={1}>
        <ManShruggingEmoji size={spacing(8)} />
        <Typography variant="bodyBold" color={colors[palette.mode].typography.typo1}>
          <FormattedMessage description="noContactsFound" defaultMessage="No contact found" />
        </Typography>
      </ContainerBox>
    ),
    [palette]
  );

  const filteredContacts = React.useMemo(
    () =>
      contactList.filter(
        (contact) =>
          contact.address.toLowerCase() !== activeWallet?.address.toLowerCase() &&
          (contact.address.toLowerCase().includes(searchValue.toLowerCase()) ||
            contact.label?.label.toLowerCase().includes(searchValue.toLowerCase()))
      ),
    [contactList, searchValue, activeWallet]
  );

  return (
    <ContainerBox flexDirection="column" gap={6} fullWidth>
      {innerInput && (
        <>
          {innerInput}
          <DividerBorder2 />
        </>
      )}
      {contactList.length === 0 && !isLoadingContactList ? (
        noContactsModalContent
      ) : (
        <>
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
                  <SearchIcon htmlColor={colors[palette.mode].typography.typo3} />
                </InputAdornment>
              ),
            }}
          />
          <StyledContactListcontainer>
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
                      onClickContact={onClickContact}
                    />
                  ))}
          </StyledContactListcontainer>
        </>
      )}
    </ContainerBox>
  );
};

interface ContactModalProps {
  activeModal: ContactListActiveModal;
  setActiveModal: SetStateCallback<ContactListActiveModal>;
  defaultAddressValue?: string;
  clearDefaultAddressValue?: () => void;
  innerInput?: React.ReactElement;
  onClickContact: (newRecipient: string) => void;
  customContactListTitle?: React.ReactElement;
}

const ContactModal = ({
  activeModal,
  setActiveModal,
  defaultAddressValue,
  clearDefaultAddressValue,
  customContactListTitle,
  innerInput,
  onClickContact,
}: ContactModalProps) => {
  const contactList = useStoredContactList();
  const [postContactStatus, setPostContactStatus] = React.useState<PostContactStatus>(PostContactStatus.NONE);
  const [editingContact, setEditingContact] = React.useState<Contact>();
  const { trackEvent } = useAnalytics();

  const modalData = React.useMemo<
    Record<ContactListActiveModal, { title?: React.ReactElement; content: React.ReactElement }>
  >(
    () => ({
      [ContactListActiveModal.CONTACT_LIST]: {
        title: customContactListTitle || (
          <FormattedMessage description="contactListTitle" defaultMessage="Contact list" />
        ),
        content: (
          <ContactListModal
            setActiveModal={setActiveModal}
            contactList={contactList}
            setEditingContact={setEditingContact}
            innerInput={innerInput}
            onClickContact={onClickContact}
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
            goBack={() => setActiveModal(ContactListActiveModal.CONTACT_LIST)}
          />
        ),
      },
      [ContactListActiveModal.EDIT_CONTACT]: {
        title: <FormattedMessage description="editContactTitle" defaultMessage="Edit your Contact" />,
        content: editingContact ? (
          <EditContactModal
            setActiveModal={setActiveModal}
            contact={editingContact}
            goBack={() => setActiveModal(ContactListActiveModal.CONTACT_LIST)}
          />
        ) : (
          <></>
        ),
      },
      [ContactListActiveModal.NONE]: { content: <></> },
    }),
    [contactList, postContactStatus, defaultAddressValue, activeModal, editingContact, innerInput]
  );

  const onShowAddContact = () => {
    setActiveModal(ContactListActiveModal.ADD_CONTACT);
    trackEvent('Contact modal - Open add contact', {
      activeModal,
    });
  };

  const onCloseModal = () => {
    setActiveModal(ContactListActiveModal.NONE);
    trackEvent('Contact modal - Close contact modal', {
      activeModal,
    });
  };
  return (
    <Modal
      open={activeModal !== ContactListActiveModal.NONE}
      onClose={onCloseModal}
      closeOnBackdrop
      title={modalData[activeModal].title}
      headerButton={
        activeModal === ContactListActiveModal.CONTACT_LIST &&
        contactList.length !== 0 && (
          <Button variant="outlined" onClick={onShowAddContact}>
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
