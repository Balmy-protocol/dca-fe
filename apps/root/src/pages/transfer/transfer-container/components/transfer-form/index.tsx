import React from 'react';
import styled from 'styled-components';
import { Paper, Typography } from 'ui-library';
import NetworkSelector from '../network-selector';
import WalletSelector from '../wallet-selector';
import TokenSelector from '../token-selector';
import RecipientAddress from '../recipient-address';
import TransferButton from '../transfer-button';
import useActiveWallet from '@hooks/useActiveWallet';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

const StyledPaper = styled(Paper)`
  margin-top: 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
`;

const TransferForm = () => {
  const {
    chainId: chainIdParam,
    token: tokenParam,
    recipient: recipientParam,
  } = useParams<{ chainId?: string; token?: string; recipient?: string }>();

  const activeWallet = useActiveWallet();

  return (
    <StyledPaper variant="outlined">
      {!activeWallet ? (
        <Typography variant="body1">
          <FormattedMessage description="PleaseConnectWallet" defaultMessage="Please connect your Wallet" />
        </Typography>
      ) : (
        <>
          <WalletSelector />
          <NetworkSelector chainIdParam={chainIdParam} />
          <TokenSelector tokenParamAddress={tokenParam} />
          <RecipientAddress recipientParam={recipientParam} />
          <TransferButton />
        </>
      )}
    </StyledPaper>
  );
};

export default TransferForm;
