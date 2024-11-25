import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { colors, ContainerBox, InfoCircleIcon, TimerIcon, Tooltip, Typography } from 'ui-library';

const StyledDelayWithdrawWarningContainer = styled(ContainerBox)`
  ${({ theme: { palette } }) => `
        border-bottom: 1.5px solid ${colors[palette.mode].border.border1};
    `}
`;

const ButtonIconContainer = styled(ContainerBox)`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(1.125)};
    border-radius: 50%;
    background-color: ${colors[palette.mode].background.tertiary};
  `}
`;

const DelayWithdrawWarning = () => (
  <StyledDelayWithdrawWarningContainer gap={1} alignItems="center">
    <ButtonIconContainer>
      <TimerIcon
        sx={({ spacing }) => ({
          fontSize: `${spacing(3.75)}`,
        })}
      />
    </ButtonIconContainer>
    <Typography variant="labelSemiBold">
      <FormattedMessage
        description="earn.strategy-management.pending-delayed-withdrawals-warning"
        defaultMessage="This Vault has Withdraw delay"
      />
    </Typography>
    <Tooltip
      title={
        <FormattedMessage
          defaultMessage="This Vault has a withdrawal delay, it may take between 2 and 5 days to be ready. You can opt out of this delay and withdraw immediately, but note that this will be processed at the current market price."
          description="earn.strategy-management.pending-delayed-withdrawals-tooltip-disclaimer"
        />
      }
    >
      <ContainerBox>
        <InfoCircleIcon fontSize="small" sx={({ palette }) => ({ color: colors[palette.mode].typography.typo4 })} />
      </ContainerBox>
    </Tooltip>
  </StyledDelayWithdrawWarningContainer>
);

export default DelayWithdrawWarning;
