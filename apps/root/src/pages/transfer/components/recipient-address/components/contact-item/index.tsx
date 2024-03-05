import React from 'react';
import styled from 'styled-components';
import { Contact } from 'common-types';
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
import EditLabelInput from '@common/components/edit-label-input';

interface ContactItemProps {
  contact: Contact;
  onClickContact: (newRecipient: string) => void;
  onDeleteContact: (contact: Contact) => Promise<void>;
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
  ${({ theme: { palette } }) => `
  font-weight: bold;
  color: ${colors[palette.mode].typography.typo2};
  max-width: 16ch;
`}
`;

const StyledContactData = styled(Typography)`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
`}
`;

const ContactItem = ({ contact, onClickContact, onDeleteContact }: ContactItemProps) => {
  const intl = useIntl();
  const snackbar = useSnackbar();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState('');
  const [enableEditLabel, setEnableEditLabel] = React.useState(false);

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
      icon: <ContentCopyIcon />,
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
      icon: <EditIcon />,
      label: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Edit',
          description: 'edit',
        })
      ),
      onClick: () => setEnableEditLabel(true),
    },
    {
      type: OptionsMenuOptionType.divider,
    },
    {
      type: OptionsMenuOptionType.option,
      icon: <TrashIcon color="error" />,
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
    <StyledContactItem item onClick={() => !enableEditLabel && onClickContact(contact.address)} menuOpen={isMenuOpen}>
      <ContainerBox flexDirection="column" gap={1}>
        {enableEditLabel ? (
          <EditLabelInput
            fullWidth
            variant="standard"
            labelAddress={contact.address}
            newLabelValue={newLabel}
            setNewLabelValue={setNewLabel}
            disableLabelEdition={() => setEnableEditLabel(false)}
          />
        ) : (
          <StyledContactLabel noWrap>{contact.label?.label || trimAddress(contact.address, 4)}</StyledContactLabel>
        )}
        <ContainerBox gap={3} alignItems="center">
          {contact.label && (
            <>
              <StyledContactData variant="bodySmall">{trimAddress(contact.address, 4)}</StyledContactData>
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
          <StyledContactData variant="bodySmall">
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
