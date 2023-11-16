import styled from 'styled-components';
import React from 'react';
import find from 'lodash/find';
import { FormattedMessage } from 'react-intl';
import {
  Typography,
  Chip,
  MenuItem,
  InputAdornment,
  ListSubheader,
  Select,
  SelectChangeEvent,
  TextField,
  SearchIcon,
} from 'ui-library';
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

const NetworkSelector = ({ networkList, handleChangeCallback, disableSearch }: NetworkSelectorProps) => {
  const walletService = useWalletService();
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();
  const activeWallet = useActiveWallet();
  const selectedNetwork = useSelectedNetwork();
  const [chainSearch, setChainSearch] = React.useState('');
  const chainSearchRef = React.useRef<HTMLDivElement>();

  const renderNetworks = React.useMemo(
    () => networkList.filter((network) => network?.name.toLowerCase().includes(chainSearch.toLowerCase())),
    [chainSearch]
  );

  const handleChangeNetwork = React.useCallback(
    (evt: SelectChangeEvent<number>) => {
      const chainId = Number(evt.target.value);
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

  const handleOnClose = React.useCallback(() => setChainSearch(''), []);
  return (
    <StyledNetworkContainer>
      <Typography variant="body1">
        <FormattedMessage description="supportedNetworks" defaultMessage="Choose network:" />
      </Typography>
      <StyledNetworkButtonsContainer>
        <Select
          id="choose-network"
          fullWidth
          value={selectedNetwork.chainId}
          onChange={handleChangeNetwork}
          onClose={handleOnClose}
          size="small"
          SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
          MenuProps={{
            autoFocus: false,
            TransitionProps: { onEntered: () => chainSearchRef.current?.focus() },
            transformOrigin: {
              horizontal: 'center',
              vertical: 'top',
            },
          }}
        >
          {!disableSearch && (
            <ListSubheader sx={{ backgroundColor: '#1e1e1e' }}>
              <TextField
                size="small"
                // Autofocus on textfield
                autoFocus
                placeholder="Type to search..."
                fullWidth
                value={chainSearch}
                inputRef={chainSearchRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setChainSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Escape') {
                    // Prevents autoselecting item while typing (default Select behaviour)
                    e.stopPropagation();
                  }
                }}
              />
            </ListSubheader>
          )}
          {renderNetworks.map((network) => (
            <MenuItem
              key={network.chainId}
              sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              value={network.chainId}
            >
              <TokenIcon
                size="20px"
                token={toToken({
                  address: 'mainCurrency' in network ? network.mainCurrency : network.wToken,
                  chainId: network.chainId,
                  logoURI: getGhTokenListLogoUrl(network.chainId, 'logo'),
                })}
              />
              {network.name}
              {network.testnet && (
                <Chip
                  label={<FormattedMessage description="testnet" defaultMessage="Testnet" />}
                  size="small"
                  color="warning"
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </StyledNetworkButtonsContainer>
    </StyledNetworkContainer>
  );
};

export default NetworkSelector;
// export default React.memo(NetworkSelector);
