import React from 'react';
import styled from 'styled-components';
import { Paper, Typography } from 'ui-library';
import NetworkSelector from '../network-selector';
import WalletSelector from '../wallet-selector';
import TokenSelector from '../token-selector';
import RecipientAddress from '../recipient-address';
import TransferButton from '../transfer-button';
import { useTransferState } from '@state/transfer/hooks';
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

  const { recipient } = useTransferState();
  const activeWallet = useActiveWallet();

  const validRegex = RegExp(/^0x[A-Fa-f0-9]{40}$/);

  const isValidAddress = validRegex.test(recipient || '');
  const isNotSameAddress = recipient?.toLowerCase() !== activeWallet?.address.toLowerCase();
  const isRecipientValid = isValidAddress && isNotSameAddress;

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
          <TokenSelector tokenParam={tokenParam} />
          <RecipientAddress recipientParam={recipientParam} isValid={isRecipientValid} />
          <TransferButton isRecipientValid={isRecipientValid} />
        </>
      )}
    </StyledPaper>
  );
};

export default TransferForm;
