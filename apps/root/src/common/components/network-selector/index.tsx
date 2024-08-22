import styled from 'styled-components';
import React from 'react';
import find from 'lodash/find';
import { FormattedMessage, useIntl } from 'react-intl';
import { Chip, ContainerBox, Select, Typography, colors } from 'ui-library';
import { NETWORKS, getGhTokenListLogoUrl } from '@constants';
import TokenIcon from '@common/components/token-icon';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import {
  emptyTokenWithLogoURI,
  formatUsdAmount,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import useWeb3Service from '@hooks/useWeb3Service';
import { setNetwork } from '@state/config/actions';
import useActiveWallet from '@hooks/useActiveWallet';
import { Address, NetworkStruct } from '@types';
import { Chain } from '@balmy/sdk';
import { useThemeMode } from '@state/config/hooks';
import { useAllBalances } from '@state/balances/hooks';
import useWallets from '@hooks/useWallets';
import { orderBy } from 'lodash';

interface NetworkSelectorProps {
  networkList: (NetworkStruct | Chain)[];
  handleChangeCallback: (chainId: number) => void;
  disableSearch?: boolean;
  showBalances?: boolean;
}

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

type OptionWithKey = (NetworkStruct | Chain) & { key: number; balance?: number };

const NetworkItem = ({ item: network, showItemBalance }: { item: OptionWithKey; showItemBalance?: boolean }) => {
  const mode = useThemeMode();
  const intl = useIntl();

  return (
    <ContainerBox alignItems="center" justifyContent="space-between" key={network.key} flex={1} gap={3}>
      <ContainerBox alignItems="center" flex={1} gap={3}>
        <TokenIcon size={6} token={emptyTokenWithLogoURI(getGhTokenListLogoUrl(network.chainId, 'logo'))} />
        <Typography variant="bodySmallSemibold" color={colors[mode].typography.typo2}>
          {network.name}
        </Typography>
        {network.testnet && (
          <Chip
            label={<FormattedMessage description="testnet" defaultMessage="Testnet" />}
            size="small"
            color="warning"
          />
        )}
      </ContainerBox>
      {showItemBalance && !!network.balance && (
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={<Typography variant="bodySemibold">${formatUsdAmount({ amount: network.balance, intl })}</Typography>}
        />
      )}
    </ContainerBox>
  );
};

const searchFunction = (network: OptionWithKey, searchTerm: string) =>
  network?.name.toLowerCase().includes(searchTerm.toLowerCase());
const NetworkSelector = ({
  networkList,
  handleChangeCallback,
  disableSearch,
  showBalances = true,
}: NetworkSelectorProps) => {
  const walletService = useWalletService();
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();
  const activeWallet = useActiveWallet();
  const selectedNetwork = useSelectedNetwork();
  const wallets = useWallets();
  const [chainSearch, setChainSearch] = React.useState('');
  const { balances } = useAllBalances();

  const chainBalances = React.useMemo(
    () =>
      Object.keys(balances).reduce<{ [chainId: number]: number }>((acc, chainIdKey) => {
        const chainBalance = balances[Number(chainIdKey)];

        const walletSearchFunction = (walletBalances: Record<Address, bigint>) => {
          return Object.entries(walletBalances).reduce(
            (walletBalanceAcc, [walletAddress, tokenWalletBalance]) =>
              walletBalanceAcc +
              (walletAddress === activeWallet?.address ||
              (!activeWallet && !!wallets.find((w) => w.address === (walletAddress as Address)))
                ? tokenWalletBalance
                : 0n),
            0n
          );
        };

        const chainValue = Object.values(chainBalance.balancesAndPrices).reduce(
          (chainBalanceAcc, tokenBalance) =>
            chainBalanceAcc +
            parseUsdPrice(
              tokenBalance.token,
              walletSearchFunction(tokenBalance.balances),
              parseNumberUsdPriceToBigInt(tokenBalance.price) || 0n
            ),
          0
        );

        // eslint-disable-next-line no-param-reassign
        acc[Number(chainIdKey)] = (acc[Number(chainIdKey)] || 0) + chainValue;

        return acc;
      }, {}),
    [wallets, balances, activeWallet?.address]
  );

  const renderNetworks = React.useMemo(() => {
    const mappedNetworks = networkList.map<OptionWithKey>((network) => ({
      ...network,
      key: network.chainId,
      balance: chainBalances[network.chainId],
    }));
    return showBalances ? orderBy(mappedNetworks, ({ balance }) => balance || 0, ['desc']) : mappedNetworks;
  }, [chainSearch, showBalances, chainBalances]);

  const selectedItem = React.useMemo(
    () => ({ ...selectedNetwork, key: selectedNetwork.chainId, balance: chainBalances[selectedNetwork.chainId] }),
    [selectedNetwork]
  );

  const handleChangeNetwork = React.useCallback(
    (network: OptionWithKey) => {
      const chainId = network.chainId;
      setChainSearch('');
      handleChangeCallback(chainId);
      void walletService.changeNetworkAutomatically(chainId, activeWallet?.address, () => {
        const networkToSet = find(NETWORKS, { chainId });
        if (networkToSet) {
          dispatch(setNetwork(networkToSet));
        }
      });
    },
    [dispatch, walletService, web3Service]
  );

  return (
    <StyledNetworkContainer>
      <StyledNetworkButtonsContainer>
        <Select
          id="choose-network"
          options={renderNetworks}
          RenderItem={({ item }) => <NetworkItem item={item} showItemBalance />}
          RenderSelectedValue={NetworkItem}
          selectedItem={selectedItem}
          onChange={handleChangeNetwork}
          disabledSearch={!!disableSearch}
          searchFunction={searchFunction}
          limitHeight
          size="medium"
        />
      </StyledNetworkButtonsContainer>
    </StyledNetworkContainer>
  );
};

export default NetworkSelector;
// export default React.memo(NetworkSelector);
