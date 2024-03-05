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

const StyledNoContactsTextContainer = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 2 })`
  text-align: center;
  ${({ theme: { palette } }) => colors[palette.mode].typography.typo3};
`;

interface ContactListModalProps {
  open: boolean;
  setOpen: SetStateCallback<boolean>;
  openAddContactModal: boolean;
  setOpenAddContactModal: SetStateCallback<boolean>;
  onClickContact: (newRecipient: string) => void;
}

const SKELETON_ROWS = Array.from(Array(7).keys());

const ContactListModal = ({
  open,
  setOpen,
  openAddContactModal,
  setOpenAddContactModal,
  onClickContact,
}: ContactListModalProps) => {
  const contactListService = useContactListService();
  const contactList = useStoredContactList();
  const isLoadingContactList = useIsLoadingContactList();
  const themeMode = useThemeMode();
  const intl = useIntl();
  const [searchValue, setSearchValue] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  const onDeleteContact = async (contact: Contact) => {
    await contactListService.removeContact(contact);
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
          <Button variant="contained" size="large" onClick={() => setOpenAddContactModal(true)} fullWidth>
            <FormattedMessage description="addContact" defaultMessage="Add Contact" />
          </Button>
        </ContainerBox>
      </ContainerBox>
    ),
    [setOpenAddContactModal, themeMode]
  );

  const noContactsOnSearch = React.useMemo(
    () => (
      <StyledNoContactsTextContainer>
        <Typography variant="h3">🔍</Typography>
        <Typography variant="body1" fontWeight="bold">
          <FormattedMessage description="noContactsFound" defaultMessage="No contacts were found" />
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
      <Modal
        open={open && !openAddContactModal}
        onClose={() => setOpen(false)}
        closeOnBackdrop={true}
        title={<FormattedMessage description="contactList" defaultMessage="Contact list" />}
        headerButton={
          contactList.length !== 0 && (
            <Button variant="outlined" color="primary" onClick={() => setOpenAddContactModal(true)}>
              <FormattedMessage description="addContact" defaultMessage="Add Contact" />
            </Button>
          )
        }
        maxWidth="sm"
      >
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
              {true
                ? SKELETON_ROWS.map((key) => <SkeletonContactItem key={key} />)
                : filteredContacts.length === 0
                ? noContactsOnSearch
                : filteredContacts.map((contact) => (
                    <ContactItem
                      key={contact.address}
                      contact={contact}
                      onClickContact={onClickContact}
                      onDeleteContact={onDeleteContact}
                    />
                  ))}
            </ContainerBox>
          </ContainerBox>
        )}
      </Modal>
    </>
  );
};

export default ContactListModal;
