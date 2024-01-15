import React from 'react';
import { Modal, Button, Typography, colors, Grid, TextField, InputAdornment, SearchIcon, Divider } from 'ui-library';
import useStoredContactList from '@hooks/useStoredContactList';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import ContactItem from '../contact-item';

interface ContactListModalProps {
  shouldShow: boolean;
  setShouldShow: React.Dispatch<React.SetStateAction<boolean>>;
  onClickContact: (newRecipient: string) => void;
}

const ContactListModal = ({ shouldShow, setShouldShow, onClickContact }: ContactListModalProps) => {
  const contactList = useStoredContactList();
  const themeMode = useThemeMode();
  const intl = useIntl();
  const [searchValue, setSearchValue] = React.useState('');

  const onOpenAddContactForm = React.useCallback(() => {}, []);

  const noContactsModalContent = React.useMemo(
    () => (
      <Grid container justifyContent="center" rowSpacing={6}>
        <Grid item direction="column" gap={2} textAlign="center" color={colors[themeMode].typography.typo3}>
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
        <Grid item sx={{ maxWidth: '350px !important' }} xs={12}>
          <Button variant="contained" onClick={onOpenAddContactForm} fullWidth>
            <Typography variant="body1" fontWeight="bold">
              <FormattedMessage description="addContact" defaultMessage="Add Contact" />
            </Typography>
          </Button>
        </Grid>
      </Grid>
    ),
    [onOpenAddContactForm, themeMode]
  );

  const noContactsOnSearch = React.useMemo(
    () => (
      <Grid item direction="column" gap={2} textAlign="center" color={colors[themeMode].typography.typo3}>
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
          contact.label?.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [contactList, searchValue]
  );

  return (
    <Modal
      open={shouldShow}
      onClose={() => setShouldShow(false)}
      closeOnBackdrop={true}
      title={<FormattedMessage description="contactList" defaultMessage="Contact list" />}
      headerButton={
        contactList.length !== 0 && (
          <Button variant="outlined" color="primary" onClick={onOpenAddContactForm}>
            <Typography variant="body1" fontWeight="bold">
              <FormattedMessage description="addContact" defaultMessage="Add Contact" />
            </Typography>
          </Button>
        )
      }
      maxWidth="sm"
    >
      <Grid container direction="column" rowSpacing={6}>
        <Grid item>
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
        <Grid item>
          <Divider sx={{ borderColor: colors[themeMode].border.border2 }} />
        </Grid>
        <Grid
          item
          container
          direction="column"
          rowGap={1}
          height={(theme) => theme.spacing(65)}
          overflow="scroll"
          wrap="nowrap"
        >
          {contactList.length === 0
            ? noContactsModalContent
            : filteredContacts.length === 0
            ? noContactsOnSearch
            : filteredContacts.map((contact) => (
                <ContactItem key={contact.address} contact={contact} onClickContact={onClickContact} />
              ))}
        </Grid>
      </Grid>
    </Modal>
  );
};

export default ContactListModal;
