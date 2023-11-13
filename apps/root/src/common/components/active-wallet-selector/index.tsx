import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, MenuItem, Select, SelectChangeEvent, WalletIcon } from 'ui-library';
import useWallets from '@hooks/useWallets';
import useActiveWallet from '@hooks/useActiveWallet';
import useAccountService from '@hooks/useAccountService';
import { WalletStatus } from '@types';
import Address from '@common/components/address';

const StyledWalletContainer = styled.div`
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

const ActiveWalletSelector = () => {
  const wallets = useWallets();
  const activeWallet = useActiveWallet();
  const accountService = useAccountService();

  const handleChangeWallet = (evt: SelectChangeEvent<string>) => {
    void accountService.setActiveWallet(evt.target.value);
  };

  return (
    <StyledWalletContainer>
      <Typography variant="body1">
        <FormattedMessage description="wallets" defaultMessage="Choose wallet:" />
      </Typography>
      <StyledNetworkButtonsContainer>
        <Select
          id="choose-wallet"
          fullWidth
          value={activeWallet?.address}
          onChange={handleChangeWallet}
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
          {wallets.map((wallet) => (
            <MenuItem
              key={wallet.address}
              sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              value={wallet.address}
              disabled={wallet.status === WalletStatus.disconnected}
            >
              <WalletIcon />
              <Address address={wallet.address} trimAddress />
              {wallet.status === WalletStatus.disconnected && '(Not connected)'}
            </MenuItem>
          ))}
        </Select>
      </StyledNetworkButtonsContainer>
    </StyledWalletContainer>
  );
};

export default ActiveWalletSelector;
