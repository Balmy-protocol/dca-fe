import React from 'react';
import styled from 'styled-components';
import { MenuItem, Typography, Select } from 'ui-library';
import useUser from '@hooks/useUser';
import Address from '../address';
import useActiveWallet from '@hooks/useActiveWallet';
import { FormattedMessage } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
// import useWeb3Service from '@hooks/useWeb3Service';
import { useDisconnect } from 'wagmi';

const StyledNetworkContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const StyledNetworkButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const WalletSelector = () => {
  const user = useUser();
  const activeWallet = useActiveWallet();
  const accountService = useAccountService();
  // const web3Service = useWeb3Service();
  const { openConnectModal: openConnectModalRef } = useConnectModal();
  const { disconnect } = useDisconnect({
    onSettled() {
      if (openConnectModalRef) {
        openConnectModalRef();
      }
    },
  });

  const onClickItem = (newWallet: string) => {
    void accountService.setActiveWallet(newWallet);
  };

  return (
    <StyledNetworkContainer>
      <Typography variant="body1">
        <FormattedMessage description="chooseWallet" defaultMessage="Choose wallet:" />
      </Typography>
      <StyledNetworkButtonsContainer>
        <Select
          id="choose-wallet"
          fullWidth
          value={activeWallet?.address}
          onChange={(e) => onClickItem(e.target.value)}
          size="small"
          SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
          MenuProps={{
            autoFocus: false,
            transformOrigin: {
              horizontal: 'center',
              vertical: 'top',
            },
          }}
        >
          {user?.wallets.map(({ address }) => (
            <MenuItem key={address} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }} value={address}>
              <Address trimAddress address={address} />
            </MenuItem>
          ))}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <>
                <MenuItem
                  onClick={() => {
                    disconnect();

                    openConnectModal();
                  }}
                >
                  <FormattedMessage defaultMessage="Connect new wallet" description="connectNewWallet" />
                </MenuItem>
              </>
            )}
          </ConnectButton.Custom>
        </Select>
      </StyledNetworkButtonsContainer>
    </StyledNetworkContainer>
  );
};

export default WalletSelector;
