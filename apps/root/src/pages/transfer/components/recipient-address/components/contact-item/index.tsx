import React from 'react';
import styled from 'styled-components';
import { Contact } from 'common-types';
import {
  ContentCopyIcon,
  EditIcon,
  Grid,
  MoreVertIcon,
  OptionsMenu,
  OptionsMenuOption,
  OptionsMenuOptionType,
  Typography,
  Zoom,
  colors,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { useSnackbar } from 'notistack';
import { copyTextToClipboard } from '@common/utils/clipboard';
import useContactListService from '@hooks/useContactListService';
import { trimAddress } from '@common/utils/parsing';
import { TrashIcon } from 'ui-library/src/icons';

interface ContactItemProps {
  contact: Contact;
  onClickContact: (newRecipient: string) => void;
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
`}
`;

const StyledContactData = styled(Typography)`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
`}
`;

const ContactItem = ({ contact, onClickContact }: ContactItemProps) => {
  const intl = useIntl();
  const snackbar = useSnackbar();
  const contactListService = useContactListService();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const onCopyAddress = React.useCallback(() => {
    copyTextToClipboard(contact.address);
    snackbar.enqueueSnackbar(
      intl.formatMessage(
        defineMessage({ description: 'copiedSuccesfully', defaultMessage: 'Adress copied to clipboard' })
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
      onClick: () => {}, // TODO: BLY-1405
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
      onClick: () => contactListService.removeContact(contact),
    },
  ];

  return (
    <StyledContactItem item onClick={() => onClickContact(contact.address)} menuOpen={isMenuOpen}>
      <Grid container direction="column" rowGap={1}>
        <Grid item xs={12}>
          <StyledContactLabel>{contact.label?.label}</StyledContactLabel>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row" columnGap={3} alignItems="center">
            <StyledContactData variant="bodySmall">{trimAddress(contact.address, 4)}</StyledContactData>
            <StyledContactData variant="bodyExtraSmall">
              <FormattedMessage description="lastUpdated" defaultMessage="Last Updated" />: March 10, 2023
            </StyledContactData>
          </Grid>
        </Grid>
      </Grid>
      <OptionsMenu
        mainDisplay={<MoreVertIcon />}
        options={menuOptions}
        showEndIcon={false}
        setIsMenuOpen={setIsMenuOpen}
      />
    </StyledContactItem>
  );
};

export default ContactItem;
