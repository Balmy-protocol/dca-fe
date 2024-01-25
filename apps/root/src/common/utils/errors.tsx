import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'ui-library';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  margin: 0px 5px;
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

export const TRANSACTION_ERRORS = {
  4001: <FormattedMessage description="rejected_transaction" defaultMessage="You rejected the transaction" />,
  4100: (
    <FormattedMessage
      description="unauthorized_transaction"
      defaultMessage="You are not authorized to make this operation"
    />
  ),
  4200: <FormattedMessage description="unsupported_method" defaultMessage="Unsupported method" />,
  4900: <FormattedMessage description="all_network_disconnect" defaultMessage="You are disconnected from the net" />,
  4901: <FormattedMessage description="network_disconnect" defaultMessage="You are disconnected from the net" />,
  ACTION_REJECTED: (
    <FormattedMessage description="rejected_transaction" defaultMessage="You rejected the transaction" />
  ),
  UNPREDICTABLE_GAS_LIMIT: (
    <>
      <FormattedMessage
        description="unpredictableGasLimit"
        defaultMessage="You have encountered an error that we didn't know how to handle. Please copy the log and report this bug on"
      />
      <StyledLink href="http://discord.mean.finance" target="_blank">
        <FormattedMessage description="ourDiscord" defaultMessage="our Discord" />
      </StyledLink>
    </>
  ),
};

const EXCLUDED_ERROR_CODES = [4001, 'ACTION_REJECTED'];
const EXCLUDED_ERROR_MESSAGES = [
  'User canceled',
  'Failed or Rejected Request',
  'user rejected transaction',
  'user rejected signing',
];

export const shouldTrackError = (error?: { code?: string; message?: string; reason?: string }) => {
  if (!error) {
    return true;
  }

  if (
    EXCLUDED_ERROR_CODES.includes(error.code || 0) ||
    EXCLUDED_ERROR_MESSAGES.includes(error.message || '') ||
    EXCLUDED_ERROR_MESSAGES.includes(error.reason || '')
  ) {
    return false;
  }

  return true;
};
