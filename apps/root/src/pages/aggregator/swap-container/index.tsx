import * as React from 'react';
import { ContainerBox } from 'ui-library';
import { getProtocolToken } from '@common/mocks/tokens';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { NETWORKS, AGGREGATOR_SUPPORTED_CHAINS } from '@constants';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useAppDispatch } from '@state/hooks';
import { setFrom, setTo, setSelectedRoute, setAggregatorChainId } from '@state/aggregator/actions';
import useSwapOptions from '@hooks/useSwapOptions';
import { useParams } from 'react-router-dom';
import useToken from '@hooks/useToken';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import useSdkMappedChains from '@hooks/useMappedSdkChains';
import Swap from './components/swap';
import AggregatorLanding from './components/landing';
import { identifyNetwork } from '@common/utils/parsing';
import NetWorth from '@common/components/net-worth';
import AggregatorFAQ from './components/faq';
import useAddCustomTokenToList from '@hooks/useAddCustomTokenToList';
import { isAddress } from 'viem';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import usePrevious from '@hooks/usePrevious';

const SwapContainer = () => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, transferTo } = useAggregatorState();
  const { slippage, gasSpeed, disabledDexes, sorting, sourceTimeout } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const currentNetwork = useSelectedNetwork();
  const isPermit2Enabled = useIsPermit2Enabled(currentNetwork.chainId);
  const { from: fromParam, to: toParam, chainId } = useParams<{ from: string; to: string; chainId: string }>();

  const sdkMappedNetworks = useSdkMappedChains();
  const mappedNetworks = React.useMemo(
    () => sdkMappedNetworks.filter((sdkNetwork) => AGGREGATOR_SUPPORTED_CHAINS.includes(sdkNetwork?.chainId || -1)),
    [sdkMappedNetworks]
  );
  const actualCurrentNetwork = useCurrentNetwork();

  const networkToUse = React.useMemo(() => {
    const networkToSet = identifyNetwork(mappedNetworks, chainId);
    return Number(
      networkToSet?.chainId || currentNetwork.chainId || actualCurrentNetwork.chainId || NETWORKS.mainnet.chainId
    );
  }, [mappedNetworks, currentNetwork, actualCurrentNetwork]);

  const fromParamToken = useToken({
    chainId: networkToUse,
    tokenAddress: fromParam,
    checkForSymbol: true,
    filterForDca: false,
  });
  const toParamToken = useToken({
    chainId: networkToUse,
    tokenAddress: toParam,
    checkForSymbol: true,
    filterForDca: false,
  });
  const isLoadingAllTokenLists = useIsLoadingAllTokenLists();
  const { addCustomTokenToList: addCustomFromTokenToList, isLoadingCustomToken: isLoadingCustomFromToken } =
    useAddCustomTokenToList();
  const { addCustomTokenToList: addCustomToTokenToList, isLoadingCustomToken: isLoadingCustomToToken } =
    useAddCustomTokenToList();
  const prevIsLoadingCustomFromToken = usePrevious(isLoadingCustomFromToken);
  const prevIsLoadingCustomToToken = usePrevious(isLoadingCustomToToken);

  const [swapOptions, isLoadingSwapOptions, swapOptionsError, fetchOptions] = useSwapOptions(
    from,
    to,
    isBuyOrder ? toValue : fromValue,
    isBuyOrder,
    sorting,
    transferTo,
    parseFloat(slippage),
    gasSpeed,
    disabledDexes,
    isPermit2Enabled,
    sourceTimeout
  );

  React.useEffect(() => {
    const networkToSet = identifyNetwork(mappedNetworks, chainId);
    dispatch(
      setAggregatorChainId(Number(networkToSet?.chainId || actualCurrentNetwork.chainId || NETWORKS.mainnet.chainId))
    );
  }, [mappedNetworks]);

  React.useEffect(() => {
    if (!isLoadingAllTokenLists && !fromParamToken && fromParam && isAddress(fromParam)) {
      void addCustomFromTokenToList(fromParam, networkToUse);
    }
    if (!isLoadingAllTokenLists && !toParamToken && toParam && isAddress(toParam)) {
      void addCustomToTokenToList(toParam, networkToUse);
    }
  }, [isLoadingAllTokenLists]);

  React.useEffect(() => {
    if ((!from && fromParamToken) || (fromParamToken && prevIsLoadingCustomFromToken && !isLoadingCustomFromToken)) {
      dispatch(setFrom(fromParamToken));
    } else if (!from && !to && !toParamToken) {
      dispatch(setFrom(getProtocolToken(networkToUse)));
    }

    if ((!to && toParamToken) || (toParamToken && prevIsLoadingCustomToToken && !isLoadingCustomToToken)) {
      dispatch(setTo(toParamToken));
    }
  }, [
    currentNetwork.chainId,
    fromParamToken,
    toParamToken,
    prevIsLoadingCustomFromToken,
    isLoadingCustomFromToken,
    prevIsLoadingCustomToToken,
    isLoadingCustomToToken,
  ]);

  React.useEffect(() => {
    if (!isLoadingSwapOptions && swapOptions && swapOptions.length) {
      dispatch(setSelectedRoute(swapOptions[0]));
    }
  }, [isLoadingSwapOptions, sorting]);

  const quotes = React.useMemo(() => (selectedRoute && swapOptions) || [], [selectedRoute, swapOptions]);
  return (
    <ContainerBox flexDirection="column" gap={32} flex="0">
      <ContainerBox flexDirection="column" gap={6}>
        <NetWorth walletSelector={{ options: { setSelectionAsActive: true } }} />
        <Swap
          isLoadingRoute={isLoadingSwapOptions || isLoadingCustomFromToken || isLoadingCustomToToken}
          quotes={quotes}
          swapOptionsError={swapOptionsError}
          fetchOptions={fetchOptions}
        />
      </ContainerBox>
      <AggregatorLanding />
      <AggregatorFAQ />
    </ContainerBox>
  );
};

// SwapContainer.whyDidYouRender = true;

export default React.memo(SwapContainer);
