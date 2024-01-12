import React from 'react';
import styled from 'styled-components';
import { colors } from '../../theme';
import Profile2Users from '../../icons/profile2users';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ForegroundPaper } from '../foreground-paper';

export interface ContactsButtonProps {
  onClick: () => void;
}

const StyledContactsButton = styled(ForegroundPaper)`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(2)};
  color: ${colors[palette.mode].accentPrimary};
  border: 1px solid ${colors[palette.mode].border.border1};
  display: flex;
  flex-direction: column;
  gap: ${spacing(0.5)};
  align-items: center;
  cursor: pointer;
`}
`;

const ContactsButton = ({ onClick }: ContactsButtonProps) => (
  <StyledContactsButton onClick={onClick}>
    <Profile2Users />
    <Typography variant="bodyExtraSmall" fontWeight="bold">
      <FormattedMessage description="contacts" defaultMessage="Contacts" />
    </Typography>
  </StyledContactsButton>
);

export default ContactsButton;
