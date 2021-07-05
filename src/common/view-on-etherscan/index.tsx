import React from 'react';
import Link from '@material-ui/core/Link';
import { FormattedMessage } from 'react-intl';
import { buildEtherscanTransaction } from 'utils/etherscan';

interface EtherscanLinkProps {
  hash: string;
}

const EtherscanLink = ({ hash }: EtherscanLinkProps) => {
  return (
    <Link href={buildEtherscanTransaction(hash)} target="_blank" rel="noreferrer">
      <FormattedMessage description="View on etherscan" defaultMessage="View on etherscan" />
    </Link>
  );
};

export default EtherscanLink;
