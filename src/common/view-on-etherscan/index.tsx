import React from 'react';
import Link from '@material-ui/core/Link';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { buildEtherscanTransaction } from 'utils/etherscan';

interface EtherscanLinkProps {
  hash: string;
}

const StyledLinkWrapper = styled.div`
  margin-right: 20px;
`;

const EtherscanLink = ({ hash }: EtherscanLinkProps) => {
  return (
    <StyledLinkWrapper>
      <Link href={buildEtherscanTransaction(hash)} target="_blank" rel="noreferrer">
        <FormattedMessage description="View on etherscan" defaultMessage="View on etherscan" />
      </Link>
    </StyledLinkWrapper>
  );
};

export default EtherscanLink;
