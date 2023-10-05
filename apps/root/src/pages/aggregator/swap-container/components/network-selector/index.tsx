import styled from 'styled-components';
import React from 'react';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
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
} from 'ui-library';
import SearchIcon from '@mui/icons-material/Search';
import useSdkChains from '@hooks/useSdkChains';
import { getAllChains } from '@mean-finance/sdk';
import { NETWORKS, REMOVED_AGG_CHAINS, getGhTokenListLogoUrl } from '@constants';
import TokenIcon from '@common/components/token-icon';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { toToken } from '@common/utils/currency';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import useWeb3Service from '@hooks/useWeb3Service';
import useTrackEvent from '@hooks/useTrackEvent';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { setAggregatorChainId } from '@state/aggregator/actions';
import { setNetwork } from '@state/config/actions';
import { NetworkStruct } from '@types';

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

const NetworkSelector = () => {
  const supportedChains = useSdkChains();

  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const web3Service = useWeb3Service();
  const trackEvent = useTrackEvent();
  const replaceHistory = useReplaceHistory();
  const selectedNetwork = useSelectedNetwork();

  const [chainSearch, setChainSearch] = React.useState('');
  const chainSearchRef = React.useRef<HTMLDivElement>();

  const mappedNetworks = React.useMemo(
    () =>
      compact(
        orderBy(
          supportedChains
            .map((networkId) => {
              const foundSdkNetwork = find(
                getAllChains().filter((chain) => !chain.testnet || chain.ids.includes('base-goerli')),
                { chainId: networkId }
              );
              const foundNetwork = find(NETWORKS, { chainId: networkId });

              if (!foundSdkNetwork) {
                return null;
              }

              return {
                ...foundSdkNetwork,
                ...(foundNetwork || {}),
              };
            })
            .filter(
              (network) =>
                !REMOVED_AGG_CHAINS.includes(network?.chainId || -1) &&
                network?.name.toLowerCase().includes(chainSearch.toLowerCase())
            ),
          ['testnet'],
          ['desc']
        )
      ),
    [supportedChains, chainSearch]
  );

  const handleChangeNetwork = React.useCallback(
    (evt: SelectChangeEvent<number>) => {
      const chainId = Number(evt.target.value);
      setChainSearch('');
      dispatch(setAggregatorChainId(chainId));
      replaceHistory(`/swap/${chainId}`);
      trackEvent('Aggregator - Change displayed network');
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      walletService.changeNetworkAutomatically(chainId, () => {
        const networkToSet = find(NETWORKS, { chainId });
        dispatch(setNetwork(networkToSet as NetworkStruct));
        if (networkToSet) {
          web3Service.setNetwork(networkToSet?.chainId);
        }
      });
    },
    [dispatch, replaceHistory, trackEvent, walletService, web3Service]
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
          {mappedNetworks.map((network) => (
            <MenuItem
              key={network.chainId}
              sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              value={network.chainId}
            >
              <TokenIcon
                size="20px"
                token={toToken({
                  address: network.mainCurrency || network.wToken,
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

// NetworkSelector.whyDidYouRender = true;
export default NetworkSelector;
// export default React.memo(NetworkSelector);
