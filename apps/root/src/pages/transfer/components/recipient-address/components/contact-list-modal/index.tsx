import React from 'react';
import { Modal, Button, Typography, colors, Grid, TextField, InputAdornment, SearchIcon, Divider } from 'ui-library';
import useStoredContactList from '@hooks/useStoredContactList';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import ContactItem from '../contact-item';
import AddContactModal from '../add-contact-modal';
import { Contact } from 'common-types';
import useContactListService from '@hooks/useContactListService';

interface ContactListModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClickContact: (newRecipient: string) => void;
}

const ContactListModal = ({ open, setOpen, onClickContact }: ContactListModalProps) => {
  const contactListService = useContactListService();
  const contactList = useStoredContactList();
  const themeMode = useThemeMode();
  const intl = useIntl();
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [openAddContactModal, setOpenAddContactModal] = React.useState(false);
  const [updateTrigger, setUpdateTrigger] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  const onDeleteContact = (contact: Contact) => {
    void contactListService.removeContact(contact);
    setUpdateTrigger((prev) => !prev);
  };

  const noContactsModalContent = React.useMemo(
    () => (
      <Grid container justifyContent="center" rowSpacing={6}>
        <Grid item xs={12}>
          <Grid container direction="column" gap={2} textAlign="center" color={colors[themeMode].typography.typo3}>
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
          </Grid>
        </Grid>
        <Grid item sx={{ maxWidth: '350px !important' }} xs={12}>
          <Button variant="contained" onClick={() => setOpenAddContactModal(true)} fullWidth>
            <FormattedMessage description="addContact" defaultMessage="Add Contact" />
          </Button>
        </Grid>
      </Grid>
    ),
    [setOpenAddContactModal, themeMode]
  );

  const noContactsOnSearch = React.useMemo(
    () => (
      <Grid container direction="column" gap={2} textAlign="center" color={colors[themeMode].typography.typo3}>
        <Typography variant="h3">🔍</Typography>
        <Typography variant="body1" fontWeight="bold">
          <FormattedMessage description="noContactsFound" defaultMessage="No contacts were found" />
        </Typography>
      </Grid>
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
    [contactList, searchValue, updateTrigger]
  );

  const goBackToTransfer = () => {
    setOpen(false);
    setOpenAddContactModal(false);
  };

  return (
    <>
      <AddContactModal
        open={openAddContactModal}
        setOpen={setOpenAddContactModal}
        goBackToTransfer={goBackToTransfer}
      />
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
        {contactList.length === 0 ? (
          noContactsModalContent
        ) : (
          <Grid container direction="column" rowSpacing={6}>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ borderColor: colors[themeMode].border.border2 }} />
            </Grid>
            <Grid item xs={12}>
              <Grid container direction="column" rowGap={1}>
                {filteredContacts.length === 0
                  ? noContactsOnSearch
                  : filteredContacts.map((contact) => (
                      <ContactItem
                        key={contact.address}
                        contact={contact}
                        onClickContact={onClickContact}
                        onDeleteContact={onDeleteContact}
                      />
                    ))}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Modal>
    </>
  );
};

export default ContactListModal;
