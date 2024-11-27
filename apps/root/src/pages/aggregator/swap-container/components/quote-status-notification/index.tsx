import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, TickCircleIcon, Typography, WarningTriangleIcon, Zoom, colors } from 'ui-library';

const StyledNotification = styled(ContainerBox).attrs({ alignItems: 'center', gap: 2 })<{ $isError: boolean }>`
  ${({ theme: { spacing, palette }, $isError }) => `
  padding: ${spacing(2)};
  border: 1px solid ${
    $isError ? colors[palette.mode].semantic.error.primary : colors[palette.mode].semantic.success.primary
  };
  border-radius: ${spacing(2)};
  `}
`;

const StyledNotificationText = styled(Typography).attrs({ variant: 'bodySmallBold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

export enum QuoteStatus {
  None = 'none',
  BetterQuote = 'betterQuote',
  OriginalFailed = 'originalFailed',
  AllFailed = 'allFailed',
}

const QuoteStatusNotification = ({ quoteStatus }: { quoteStatus: QuoteStatus }) => (
  <Zoom in={quoteStatus !== QuoteStatus.None}>
    <StyledNotification $isError={quoteStatus === QuoteStatus.AllFailed}>
      {quoteStatus === QuoteStatus.BetterQuote && (
        <>
          <TickCircleIcon color="success" />
          <StyledNotificationText>
            <FormattedMessage description="betterQuote title" defaultMessage="We found a better quote for you" />
          </StyledNotificationText>
        </>
      )}
      {quoteStatus === QuoteStatus.OriginalFailed && (
        <>
          <TickCircleIcon color="success" />
          <StyledNotificationText>
            <FormattedMessage
              description="originalFailedQuote title"
              defaultMessage="The quote you have selected will fail, we selected one that works for you"
            />
          </StyledNotificationText>
        </>
      )}
      {quoteStatus === QuoteStatus.AllFailed && (
        <>
          <WarningTriangleIcon />
          <StyledNotificationText>
            <FormattedMessage
              description="failedQuotes rejected title"
              defaultMessage="All quotes will fail. Please go back and search again"
            />
          </StyledNotificationText>
        </>
      )}
    </StyledNotification>
  </Zoom>
);

export default QuoteStatusNotification;
