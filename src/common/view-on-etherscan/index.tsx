import React from 'react';
import Link from '@mui/material/Link';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { buildEtherscanTransaction } from 'utils/etherscan';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

interface EtherscanLinkProps {
  hash: string;
}

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledLinkWrapper = styled.div`
  margin-right: 20px;
`;

const EtherscanLink = ({ hash }: EtherscanLinkProps) => {
  const currentNetwork = useCurrentNetwork();
  return (
    <StyledLinkWrapper>
      <StyledLink href={buildEtherscanTransaction(hash, currentNetwork.chainId)} target="_blank" rel="noreferrer">
        <FormattedMessage description="View on etherscan" defaultMessage="View on chain explorer" />
      </StyledLink>
    </StyledLinkWrapper>
  );
};

export default EtherscanLink;
