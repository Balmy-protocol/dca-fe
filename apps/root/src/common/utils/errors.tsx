import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'ui-library';
import styled from 'styled-components';
import { TransactionExecutionErrorType, UserRejectedRequestErrorType } from 'viem';
import { ErrorConfig } from '@common/components/transaction-modal';

const StyledLink = styled(Link)`
  margin: 0px 5px;
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const UNKNOWN_ERROR_CODE = -9999999;

export enum CustomTransactionErrorNames {
  ApiSignatureForEarnCreateTransaction = 'ApiSignatureForEarnCreateTransaction',
}

enum CustomTransactionErrorCodes {
  API_SIGNATURE_FOR_EARN_CREATE_TRANSACTION = 900000,
}

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
      <StyledLink href="http://discord.balmy.xyz" target="_blank">
        <FormattedMessage description="ourDiscord" defaultMessage="our Discord" />
      </StyledLink>
    </>
  ),
  [CustomTransactionErrorCodes.API_SIGNATURE_FOR_EARN_CREATE_TRANSACTION]: (
    <FormattedMessage
      description="transaction-error.api_signature_for_earn_create_transaction"
      defaultMessage="There was an error generating the transaction data, if you have just upgraded your tier, please try again in a few minutes"
    />
  ),
  [UNKNOWN_ERROR_CODE]: undefined,
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

const getTransactionExecutionErrorCode = (error: TransactionExecutionErrorType) => {
  switch (error.cause.name) {
    case 'UserRejectedRequestError':
      return (error.cause as UserRejectedRequestErrorType).code;
    default:
      return -9999999;
  }
};

export const getTransactionErrorCode = (error?: ErrorConfig['error']) => {
  if (!error || !('name' in error)) {
    return UNKNOWN_ERROR_CODE;
  }

  switch (error.name) {
    // Viem Errors
    case 'TransactionExecutionError':
      return getTransactionExecutionErrorCode(error as unknown as TransactionExecutionErrorType);
    // Custom Errors
    case CustomTransactionErrorNames.ApiSignatureForEarnCreateTransaction as string:
      return CustomTransactionErrorCodes.API_SIGNATURE_FOR_EARN_CREATE_TRANSACTION;
    default:
      return UNKNOWN_ERROR_CODE;
  }
};

export const deserializeError = <T extends Error>(err?: T) => {
  if (!err) {
    return {};
  }
  const plainObject: Record<string, T[keyof T]> = {};
  Object.getOwnPropertyNames(err).forEach(function (key) {
    plainObject[key] = err[key as keyof T];
  });
  return plainObject;
};
