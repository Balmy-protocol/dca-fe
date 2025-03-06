import React from 'react';
import { colors, ContainerBox, MigrationEmptyWallet, Typography } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const StyledContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 3,
  alignItems: 'center',
})`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    border: 1px solid ${colors[palette.mode].border.border2};
    border-radius: ${spacing(4)};
  `}
`;

const NoInvestmentsFound = () => (
  <StyledContainer>
    <MigrationEmptyWallet width="90px" height="70px" />
    <ContainerBox flexDirection="column" gap={2} alignItems="center">
      <Typography variant="h5Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
        <FormattedMessage
          defaultMessage="External Investments not found"
          description="earn.one-click-migration-modal.no-investments-found.title"
        />
      </Typography>
      <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
        <FormattedMessage
          defaultMessage="We couldn't find any investment compatible. If you think this is a mistake, ensure you're connected with the correct wallet or check your investments on other platforms."
          description="earn.one-click-migration-modal.no-investments-found.subtitle"
        />
      </Typography>
    </ContainerBox>
  </StyledContainer>
);

export default NoInvestmentsFound;
