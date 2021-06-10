import React from 'react';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { useWeb3React } from '@web3-react/core';
import { setUpWeb3Modal } from 'utils/web3modal';

const ConnectWalletButton = () => {
  const web3React = useWeb3React();

  console.log(web3React);
  return (
    <Button
      color="inherit"
      onClick={() => {
        setUpWeb3Modal();
      }}
    >
      <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
    </Button>
  );
};

export default ConnectWalletButton;
