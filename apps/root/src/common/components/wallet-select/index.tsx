import useActiveWallet from '@hooks/useActiveWallet';
import useWallets from '@hooks/useWallets';
import { Address as AddressType, Wallet } from 'common-types';
import React from 'react';
import styled from 'styled-components';
import { Chip, colors, ContainerBox, Select, Typography, WalletIcon } from 'ui-library';
import Address from '../address';
import { formatUsdAmount } from '@common/utils/currency';
import { useThemeMode } from '@state/config/hooks';
import { useIntl } from 'react-intl';
import { useAllWalletsBalances } from '@state/balances/hooks';
import orderBy from 'lodash/orderBy';
import useAccountService from '@hooks/useAccountService';

interface WalletSelectProps {
  handleChangeCallback?: (wallet: Wallet) => void;
  disableSearch?: boolean;
  showBalances?: boolean;
}

const StyledWalletSelectContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const StyledWalletSelectButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

type OptionWithKey = Wallet & { key: AddressType; balance?: number };

const WalletItem = ({ item: wallet }: { item: OptionWithKey }) => {
  const mode = useThemeMode();
  const intl = useIntl();

  return (
    <ContainerBox alignItems="center" justifyContent="space-between" key={wallet.key} flex={1} gap={3}>
      <ContainerBox alignItems="center" flex={1} gap={3}>
        <WalletIcon />
        <Typography variant="bodySemibold" color={colors[mode].typography.typo2}>
          <Address address={wallet.address} trimAddress />
        </Typography>
      </ContainerBox>
      {!!wallet.balance && (
        <Chip
          variant="outlined"
          size="small"
          label={
            <Typography variant="bodySmallSemibold">${formatUsdAmount({ amount: wallet.balance, intl })}</Typography>
          }
        />
      )}
    </ContainerBox>
  );
};

const searchFunction = (wallet: OptionWithKey, searchTerm: string) =>
  wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
  wallet.ens?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  wallet.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  false;

const WalletSelect = ({ handleChangeCallback, disableSearch, showBalances = true }: WalletSelectProps) => {
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const { balances } = useAllWalletsBalances();
  const accountService = useAccountService();

  const selectedWallet: Wallet | undefined = activeWallet || wallets[0];

  const handleChangeActiveWallet = React.useCallback(
    (newWallet: OptionWithKey) => {
      void accountService.setActiveWallet(newWallet.address);
      if (handleChangeCallback) {
        handleChangeCallback(newWallet);
      }
    },
    [accountService]
  );

  const renderWallets = React.useMemo(() => {
    const mappedWallets = wallets.map<OptionWithKey>((wallet) => ({
      ...wallet,
      key: wallet.address,
      balance: balances[wallet.address],
    }));

    return showBalances ? orderBy(mappedWallets, ({ balance }) => balance || 0, ['desc']) : mappedWallets;
  }, [showBalances, balances]);

  const selectedItem = React.useMemo(
    () =>
      selectedWallet && { ...selectedWallet, key: selectedWallet.address, balance: balances[selectedWallet.address] },
    [selectedWallet]
  );

  return (
    <StyledWalletSelectContainer>
      <StyledWalletSelectButtonsContainer>
        <Select
          id="choose-network"
          options={renderWallets}
          RenderItem={WalletItem}
          selectedItem={selectedItem}
          onChange={handleChangeActiveWallet}
          disabledSearch={!!disableSearch}
          searchFunction={searchFunction}
          limitHeight
        />
      </StyledWalletSelectButtonsContainer>
    </StyledWalletSelectContainer>
  );
};

export default WalletSelect;
