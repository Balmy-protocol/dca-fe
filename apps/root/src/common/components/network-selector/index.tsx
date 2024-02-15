import styled from 'styled-components';
import React from 'react';
import find from 'lodash/find';
import { FormattedMessage } from 'react-intl';
import { Chip, ContainerBox, Select, Typography, colors } from 'ui-library';
import { NETWORKS, getGhTokenListLogoUrl } from '@constants';
import TokenIcon from '@common/components/token-icon';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { toToken } from '@common/utils/currency';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import useWeb3Service from '@hooks/useWeb3Service';
import { setNetwork } from '@state/config/actions';
import useActiveWallet from '@hooks/useActiveWallet';
import { NetworkStruct } from '@types';
import { Chain } from '@mean-finance/sdk';
import { useThemeMode } from '@state/config/hooks';

interface NetworkSelectorProps {
  networkList: (NetworkStruct | Chain)[];
  handleChangeCallback: (chainId: number) => void;
  disableSearch?: boolean;
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

type OptionWithKey = (NetworkStruct | Chain) & { key: number };

const NetworkItem = ({ item: network }: { item: OptionWithKey }) => {
  const mode = useThemeMode();

  return (
    <ContainerBox alignItems="center" key={network.key} flex={1} gap={3}>
      <TokenIcon
        size={7}
        token={toToken({
          address: 'mainCurrency' in network ? network.mainCurrency : network.wToken,
          chainId: network.chainId,
          logoURI: getGhTokenListLogoUrl(network.chainId, 'logo'),
        })}
      />
      <Typography variant="body" fontWeight={600} color={colors[mode].typography.typo2}>
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
  );
};

const searchFunction = (network: OptionWithKey, searchTerm: string) =>
  network?.name.toLowerCase().includes(searchTerm.toLowerCase());
const NetworkSelector = ({ networkList, handleChangeCallback, disableSearch }: NetworkSelectorProps) => {
  const walletService = useWalletService();
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();
  const activeWallet = useActiveWallet();
  const selectedNetwork = useSelectedNetwork();
  const [chainSearch, setChainSearch] = React.useState('');

  const renderNetworks = React.useMemo(
    () => networkList.map<OptionWithKey>((network) => ({ ...network, key: network.chainId })),
    [chainSearch]
  );
  const selectedItem = React.useMemo(() => ({ ...selectedNetwork, key: selectedNetwork.chainId }), [selectedNetwork]);

  const handleChangeNetwork = React.useCallback(
    (network: OptionWithKey) => {
      const chainId = network.chainId;
      setChainSearch('');
      handleChangeCallback(chainId);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      walletService.changeNetworkAutomatically(chainId, activeWallet?.address, () => {
        const networkToSet = find(NETWORKS, { chainId });
        if (networkToSet) {
          dispatch(setNetwork(networkToSet));
          web3Service.setNetwork(networkToSet.chainId);
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
          RenderItem={NetworkItem}
          selectedItem={selectedItem}
          onChange={handleChangeNetwork}
          disabledSearch={!!disableSearch}
          searchFunction={searchFunction}
        />
      </StyledNetworkButtonsContainer>
    </StyledNetworkContainer>
  );
};

export default NetworkSelector;
// export default React.memo(NetworkSelector);
