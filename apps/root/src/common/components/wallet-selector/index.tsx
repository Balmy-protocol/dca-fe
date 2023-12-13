import React from 'react';
import styled from 'styled-components';
import { MenuItem, Typography, Select } from 'ui-library';
import useUser from '@hooks/useUser';
import Address from '../address';
import useActiveWallet from '@hooks/useActiveWallet';
import { FormattedMessage } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
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

const StyledMenuItem = styled(MenuItem)`
  display: flex;
  alignItems: center; 
  gap 5px; 
`;

type WithAllWalletsOption = {
  allowAllWalletsOption: true;
  setSelectionAsActive?: never;
  onSelectWalletOption: (newWallet: string) => void;
  selectedWalletOption: string;
};

type WithSetActiveWalletTrue = {
  allowAllWalletsOption?: never;
  setSelectionAsActive: true;
  onSelectWalletOption?: never;
  selectedWalletOption?: never;
};

type WithSetActiveWalletFalse = {
  allowAllWalletsOption?: never;
  setSelectionAsActive: false;
  onSelectWalletOption: (newWallet: string) => void;
  selectedWalletOption: string;
};

type StatePropsDefined = {
  allowAllWalletsOption?: boolean;
  setSelectionAsActive?: boolean;
  onSelectWalletOption: (newWallet: string) => void;
  selectedWalletOption: string;
};

type WalletSelectorProps =
  | WithAllWalletsOption
  | WithSetActiveWalletTrue
  | WithSetActiveWalletFalse
  | StatePropsDefined;

export const ALL_WALLETS = 'allWallets';

const WalletSelector = ({
  allowAllWalletsOption,
  setSelectionAsActive,
  onSelectWalletOption,
  selectedWalletOption,
}: WalletSelectorProps) => {
  const user = useUser();
  const activeWallet = useActiveWallet();
  const accountService = useAccountService();
  const { openConnectModal: openConnectModalRef } = useConnectModal();
  const { disconnect } = useDisconnect({
    onSettled() {
      if (openConnectModalRef) {
        openConnectModalRef();
      }
    },
  });
  const onClickItem = (newWallet: string) => {
    if (setSelectionAsActive) {
      void accountService.setActiveWallet(newWallet);
    }
    if (onSelectWalletOption) {
      onSelectWalletOption(newWallet);
    }
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
          value={allowAllWalletsOption ? selectedWalletOption : activeWallet?.address}
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
          {allowAllWalletsOption && (
            <StyledMenuItem value={ALL_WALLETS}>
              <FormattedMessage description="allWallets" defaultMessage="All" />
            </StyledMenuItem>
          )}
          {user?.wallets.map(({ address }) => (
            <StyledMenuItem key={address} value={address}>
              <Address trimAddress address={address} />
            </StyledMenuItem>
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
