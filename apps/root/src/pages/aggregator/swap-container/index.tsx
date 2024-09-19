import * as React from 'react';
import { colors, ContainerBox, Typography } from 'ui-library';
import { getProtocolToken } from '@common/mocks/tokens';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { NETWORKS } from '@constants';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useAppDispatch } from '@state/hooks';
import { setFrom, setTo, setSelectedRoute, setAggregatorChainId } from '@state/aggregator/actions';
import useSwapOptions from '@hooks/useSwapOptions';
import { useParams } from 'react-router-dom';
import useToken from '@hooks/useToken';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import useAggSupportedChains from '@hooks/useAggSupportedChains';
import Swap from './components/swap';
import AggregatorLanding from './components/landing';
import { identifyNetwork } from '@common/utils/parsing';
import AggregatorFAQ from './components/faq';
import useAddCustomTokenToList from '@hooks/useAddCustomTokenToList';
import { isAddress } from 'viem';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import usePrevious from '@hooks/usePrevious';
import { FormattedMessage } from 'react-intl';

const SwapContainer = () => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, transferTo } = useAggregatorState();
  const { slippage, gasSpeed, disabledDexes, sorting, sourceTimeout } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const currentNetwork = useSelectedNetwork();
  const isPermit2Enabled = useIsPermit2Enabled(currentNetwork.chainId);
  const { from: fromParam, to: toParam, chainId } = useParams<{ from: string; to: string; chainId: string }>();

  const supportedNetworks = useAggSupportedChains();
  const actualCurrentNetwork = useCurrentNetwork();

  const networkToUse = React.useMemo(() => {
    const networkToSet = identifyNetwork(supportedNetworks, chainId);
    return Number(
      networkToSet?.chainId || currentNetwork.chainId || actualCurrentNetwork.chainId || NETWORKS.mainnet.chainId
    );
  }, [supportedNetworks, currentNetwork, actualCurrentNetwork]);

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
    const networkToSet = identifyNetwork(supportedNetworks, chainId);
    dispatch(
      setAggregatorChainId(Number(networkToSet?.chainId || actualCurrentNetwork.chainId || NETWORKS.mainnet.chainId))
    );
  }, [supportedNetworks]);

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
    fromParamToken,
    toParamToken,
    prevIsLoadingCustomFromToken,
    isLoadingCustomFromToken,
    prevIsLoadingCustomToToken,
    isLoadingCustomToToken,
  ]);

  React.useEffect(() => {
    if (!isLoadingSwapOptions && swapOptions && swapOptions.results?.length) {
      dispatch(setSelectedRoute(swapOptions.results[0]));
    }
  }, [isLoadingSwapOptions, swapOptions?.results]);

  const quotes = React.useMemo(() => (selectedRoute && swapOptions?.results) || [], [selectedRoute, swapOptions]);
  const missingQuotes = React.useMemo(() => Object.keys(swapOptions?.resultsPromise || {}), [swapOptions]);

  return (
    <ContainerBox flexDirection="column" gap={20} flex="0">
      <ContainerBox flexDirection="column" gap={8}>
        <ContainerBox flexDirection="column" gap={2}>
          <Typography variant="h3Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
            <FormattedMessage defaultMessage="Swap" description="swap.title" />
          </Typography>
          <Typography variant="bodyRegular" color={({ palette }) => colors[palette.mode].typography.typo3}>
            <FormattedMessage
              defaultMessage="Swap your assets with the best prices"
              description="swap.title-description"
            />
          </Typography>
        </ContainerBox>
        <Swap
          isLoadingRoute={isLoadingSwapOptions || isLoadingCustomFromToken || isLoadingCustomToToken}
          quotes={quotes}
          swapOptionsError={swapOptionsError}
          fetchOptions={fetchOptions}
          missingQuotes={missingQuotes}
          totalQuotes={swapOptions?.totalQuotes || 0}
        />
      </ContainerBox>
      <AggregatorLanding />
      <AggregatorFAQ />
    </ContainerBox>
  );
};

// SwapContainer.whyDidYouRender = true;

export default React.memo(SwapContainer);
