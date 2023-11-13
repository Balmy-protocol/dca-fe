import styled from 'styled-components';
import React from 'react';
import isEqual from 'lodash/isEqual';
import { IconButton, Badge, SettingsIcon } from 'ui-library';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { DEFAULT_AGGREGATOR_SETTINGS } from '@constants/aggregator';
import { compact, find, orderBy } from 'lodash';
import useSdkChains from '@hooks/useSdkChains';
import { getAllChains } from '@mean-finance/sdk';
import { NETWORKS, REMOVED_AGG_CHAINS, sdkNetworkToNetworkStruct } from '@constants';
import useTrackEvent from '@hooks/useTrackEvent';
import useReplaceHistory from '@hooks/useReplaceHistory';
import NetworkSelector from '@common/components/network-selector';
import { useAppDispatch } from '@state/hooks';
import { setAggregatorChainId } from '@state/aggregator/actions';
import WalletSelector from '@common/components/wallet-selector';

const StyledCogContainer = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  border: 3px solid #151515;
  border-radius: 20px;
  background: #151515;
`;

type Props = {
  onShowSettings: () => void;
};

const TopBar = ({ onShowSettings }: Props) => {
  const { slippage, gasSpeed, disabledDexes, sorting, sourceTimeout, isPermit2Enabled } = useAggregatorSettingsState();
  const supportedChains = useSdkChains();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const replaceHistory = useReplaceHistory();

  const hasNonDefaultSettings =
    slippage !== DEFAULT_AGGREGATOR_SETTINGS.slippage.toString() ||
    gasSpeed !== DEFAULT_AGGREGATOR_SETTINGS.gasSpeed ||
    sorting !== DEFAULT_AGGREGATOR_SETTINGS.sorting ||
    sourceTimeout !== DEFAULT_AGGREGATOR_SETTINGS.sourceTimeout ||
    isPermit2Enabled !== DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled ||
    !isEqual(disabledDexes, DEFAULT_AGGREGATOR_SETTINGS.disabledDexes);

  const networkList = React.useMemo(
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
                ...sdkNetworkToNetworkStruct(foundSdkNetwork),
                ...(foundNetwork || {}),
              };
            })
            .filter((network) => !REMOVED_AGG_CHAINS.includes(network?.chainId || -1)),
          ['testnet'],
          ['desc']
        )
      ),
    [supportedChains]
  );

  const handleChangeNetworkCallback = React.useCallback(
    (chainId: number) => {
      dispatch(setAggregatorChainId(chainId));
      replaceHistory(`/swap/${chainId}`);
      trackEvent('Aggregator - Change displayed network');
    },
    [dispatch, replaceHistory, trackEvent]
  );

  return (
    <>
      <StyledCogContainer>
        <Badge color="warning" variant="dot" invisible={!hasNonDefaultSettings}>
          <IconButton aria-label="settings" size="small" sx={{ padding: '3px' }} onClick={onShowSettings}>
            <SettingsIcon fontSize="inherit" />
          </IconButton>
        </Badge>
      </StyledCogContainer>
      <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />
      <WalletSelector />
    </>
  );
};

export default React.memo(TopBar);
