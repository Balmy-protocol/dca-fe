import React from 'react';
import Button from '@common/components/button';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { useLogin } from '@privy-io/react-auth';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  text-transform: none;
`;

const ConnectWalletButton = () => {
  const { login } = useLogin();

  return (
    <StyledButton variant="outlined" color="default" onClick={login}>
      <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
    </StyledButton>
  );
};

export default ConnectWalletButton;
