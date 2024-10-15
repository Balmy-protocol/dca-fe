import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { ForegroundPaper, colors, Profile2UsersIcon, Typography } from 'ui-library';

export interface ContactsButtonProps {
  onClick: () => void;
}

const StyledContactsButton = styled(ForegroundPaper).attrs({ elevation: 0 })`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(2.5)} ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border1};
  display: flex;
  flex-direction: column;
  gap: ${spacing(0.5)};
  align-items: center;
  cursor: pointer;
  border-radius: ${spacing(2)};
  transition: background 200ms;
  box-shadow: ${colors[palette.mode].dropShadow.dropShadow100};
  &:hover {
    background-color: ${colors[palette.mode].background.tertiary};
  }
`}
`;

const ContactsButton = ({ onClick }: ContactsButtonProps) => (
  <StyledContactsButton onClick={onClick}>
    <Profile2UsersIcon sx={({ palette }) => ({ color: colors[palette.mode].accentPrimary })} />
    <Typography
      variant="bodyExtraExtraSmallBold"
      color={({ palette }) => ({ color: colors[palette.mode].accentPrimary })}
    >
      <FormattedMessage description="contacts" defaultMessage="Contacts" />
    </Typography>
  </StyledContactsButton>
);

export default ContactsButton;
