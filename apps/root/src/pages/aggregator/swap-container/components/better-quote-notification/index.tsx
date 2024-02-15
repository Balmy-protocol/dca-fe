import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, TickCircleIcon, Typography, Zoom, colors } from 'ui-library';

const StyledNotification = styled(ContainerBox).attrs({ alignItems: 'center', gap: 2 })`
  ${({ theme: { spacing, palette } }) => `
  padding: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].semantic.success.primary};
  border-radius: ${spacing(2)};
  `}
`;

const StyledNotificationText = styled(Typography).attrs({ variant: 'bodySmall', fontWeight: 700 })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2};
  `}
`;

const BetterQuoteNotification = ({ shouldShow }: { shouldShow: boolean }) => (
  <Zoom in={shouldShow}>
    <StyledNotification>
      <TickCircleIcon color="success" />
      <StyledNotificationText>
        <FormattedMessage description="betterQuote title" defaultMessage="We found a better quote for you" />
      </StyledNotificationText>
    </StyledNotification>
  </Zoom>
);

export default BetterQuoteNotification;
