import React from 'react';
import styled from 'styled-components';
import { Contact, SetStateCallback } from 'common-types';
import {
  ContentCopyIcon,
  EditIcon,
  Grid,
  MoreVertIcon,
  TrashIcon,
  OptionsMenu,
  OptionsMenuOption,
  OptionsMenuOptionType,
  Typography,
  Zoom,
  colors,
  ContainerBox,
  useSnackbar,
  copyTextToClipboard,
  Skeleton,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { trimAddress } from '@common/utils/parsing';
import { DateTime } from 'luxon';
import { ContactListActiveModal } from '../contact-modal';
import { useAppDispatch } from '@state/hooks';
import { setRecipient } from '@state/transfer/actions';

interface ContactItemProps {
  contact: Contact;
  setActiveModal: SetStateCallback<ContactListActiveModal>;
  onDeleteContact: (contact: Contact) => Promise<void>;
  onStartEditingContact: (contact: Contact) => void;
}

const StyledContactItem = styled(Grid)<{ menuOpen: boolean }>`
  ${({ theme: { palette, spacing }, menuOpen }) => `
  border: 1px solid ${colors[palette.mode].border.border1};
  border-radius: ${spacing(2)};
  background-color: ${menuOpen ? colors[palette.mode].background.emphasis : colors[palette.mode].background.secondary};
  transition: background 200ms ease-in-out;
  padding: ${spacing(2.25)} ${spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  & .MuiButton-root {
    min-width: 0;
    border-radius: 50%;
    border: 1px solid ${colors[palette.mode].border.border1};
    color: ${colors[palette.mode].typography.typo3};
    padding: ${spacing(1.5)};
  }
`}
`;

const StyledContactLabel = styled(Typography).attrs({ variant: 'h6' })`
  font-weight: bold;
  max-width: 16ch;
`;

const StyledContactData = styled(Typography)`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
`}
`;

const ContactItem = ({ contact, onDeleteContact, setActiveModal, onStartEditingContact }: ContactItemProps) => {
  const intl = useIntl();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const onCopyAddress = React.useCallback(() => {
    copyTextToClipboard(contact.address);
    snackbar.enqueueSnackbar(
      intl.formatMessage(
        defineMessage({ description: 'copiedSuccesfully', defaultMessage: 'Address copied to clipboard' })
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
  }, []);

  const onClickContact = (newRecipient: string) => {
    dispatch(setRecipient(newRecipient));
    setActiveModal(ContactListActiveModal.NONE);
  };

  const onEditContact = () => {
    onStartEditingContact(contact);
    setActiveModal(ContactListActiveModal.EDIT_CONTACT);
  };

  const handleDelete = async () => {
    try {
      await onDeleteContact(contact);

      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({ description: 'contactSuccessfullyRemoved', defaultMessage: 'Contact successfully removed' })
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
    } catch (e) {
      console.error(e);

      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({
            description: 'unableToRemoveContact',
            defaultMessage: 'Unable to remove contact. Please try again',
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
    }
  };

  const menuOptions: OptionsMenuOption[] = [
    {
      type: OptionsMenuOptionType.option,
      Icon: ContentCopyIcon,
      label: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Copy Address',
          description: 'copyAddress',
        })
      ),
      onClick: onCopyAddress,
    },
    {
      type: OptionsMenuOptionType.option,
      Icon: EditIcon,
      label: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Edit',
          description: 'edit',
        })
      ),
      onClick: onEditContact,
    },
    {
      type: OptionsMenuOptionType.divider,
    },
    {
      type: OptionsMenuOptionType.option,
      Icon: TrashIcon,
      label: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Delete',
          description: 'delete',
        })
      ),
      color: 'error',
      onClick: handleDelete,
    },
  ];

  return (
    <StyledContactItem item onClick={() => onClickContact(contact.address)} menuOpen={isMenuOpen}>
      <ContainerBox flexDirection="column" gap={1}>
        <StyledContactLabel noWrap>{contact.label?.label || trimAddress(contact.address, 4)}</StyledContactLabel>
        <ContainerBox gap={3} alignItems="center">
          {contact.label && (
            <>
              <StyledContactData variant="bodySmallRegular">{trimAddress(contact.address, 4)}</StyledContactData>
              <StyledContactData variant="bodyExtraSmall">
                {contact.label.lastModified && (
                  <>
                    <FormattedMessage description="lastUpdated" defaultMessage="Last Updated" />
                    {': '}
                    {DateTime.fromMillis(contact.label.lastModified).toLocaleString(DateTime.DATE_MED)}
                  </>
                )}
              </StyledContactData>
            </>
          )}
        </ContainerBox>
      </ContainerBox>
      <OptionsMenu
        mainDisplay={<MoreVertIcon />}
        options={menuOptions}
        showEndIcon={false}
        setIsMenuOpen={setIsMenuOpen}
      />
    </StyledContactItem>
  );
};

export const SkeletonContactItem = () => {
  return (
    <StyledContactItem item menuOpen={false}>
      <ContainerBox flexDirection="column" gap={1}>
        <StyledContactLabel noWrap>
          <Skeleton variant="text" width="30ch" />
        </StyledContactLabel>
        <ContainerBox gap={3} alignItems="center">
          <StyledContactData variant="bodySmallRegular">
            <Skeleton width="10ch" variant="text" />
          </StyledContactData>
          <StyledContactData variant="bodyExtraSmall">
            <Skeleton width="6ch" variant="text" />
          </StyledContactData>
        </ContainerBox>
      </ContainerBox>
      <Skeleton variant="circular" width={32} height={32} />
    </StyledContactItem>
  );
};

export default ContactItem;
