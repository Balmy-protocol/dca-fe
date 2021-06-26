import React from 'react';
import { FormattedMessage } from 'react-intl';

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
};
