import * as React from 'react';
import Grid from '@mui/material/Grid';
import find from 'lodash/find';
import { getProtocolToken } from 'mocks/tokens';
import useSelectedNetwork from 'hooks/useSelectedNetwork';
import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION, NETWORKS, REMOVED_AGG_CHAINS } from 'config/constants';
import { SwapOption, Token } from 'types';
import { useAggregatorState } from 'state/aggregator/hooks';
import { useAppDispatch } from 'state/hooks';
import {
  setFrom,
  setFromValue,
  setToValue,
  setTo,
  setSelectedRoute,
  resetForm,
  setAggregatorChainId,
  toggleFromTo,
} from 'state/aggregator/actions';
import { setSorting } from 'state/aggregator-settings/actions';
import useSwapOptions from 'hooks/useSwapOptions';
import useCustomToken from 'hooks/useCustomToken';
import { useParams } from 'react-router-dom';
import useToken from 'hooks/useToken';
import { SwapSortOptions } from 'config/constants/aggregator';
import useSwapOption from 'hooks/useSwapOption';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useAggregatorSettingsState } from 'state/aggregator-settings/hooks';
import useSdkMappedChains from 'hooks/useMappedSdkChains';
import useReplaceHistory from 'hooks/useReplaceHistory';
import AggregatorFAQ from './components/faq';
import Swap from './components/swap';
import SwapQuotes from './components/quotes';

const SwapContainer = () => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, transferTo } = useAggregatorState();
  const { slippage, gasSpeed, disabledDexes, sorting } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const currentNetwork = useSelectedNetwork();
  const { from: fromParam, to: toParam, chainId } = useParams<{ from: string; to: string; chainId: string }>();
  const fromParamToken = useToken(fromParam, true, true);
  const toParamToken = useToken(toParam, true, true);
  const replaceHistory = useReplaceHistory();
  const actualCurrentNetwork = useCurrentNetwork();
  const [fromParamCustomToken] = useCustomToken(fromParam, !!fromParamToken);
  const [toParamCustomToken] = useCustomToken(toParam, !!toParamToken);
  const sdkMappedNetworks = useSdkMappedChains();

  const [swapOptions, isLoadingSwapOptions, swapOptionsError, fetchOptions] = useSwapOptions(
    from,
    to,
    isBuyOrder ? toValue : fromValue,
    isBuyOrder,
    sorting,
    transferTo,
    parseFloat(slippage),
    gasSpeed,
    disabledDexes
  );
  const [swapOption, isLoadingSwapOption] = useSwapOption(selectedRoute, transferTo, parseFloat(slippage), gasSpeed);

  const [refreshQuotes, setRefreshQuotes] = React.useState(true);

  const mappedNetworks = React.useMemo(
    () => sdkMappedNetworks.filter((network) => !REMOVED_AGG_CHAINS.includes(network?.chainId || -1)),
    [sdkMappedNetworks]
  );

  React.useEffect(() => {
    let networkToSet = find(mappedNetworks, { chainId: Number(chainId) });
    if (!networkToSet && chainId) {
      networkToSet = find(mappedNetworks, { name: chainId.toLowerCase() });
    }
    dispatch(
      setAggregatorChainId(Number(networkToSet?.chainId || actualCurrentNetwork.chainId || NETWORKS.mainnet.chainId))
    );
  }, [mappedNetworks]);

  React.useEffect(() => {
    if (fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (fromParamCustomToken && !from) {
      dispatch(setFrom(fromParamCustomToken.token));
    } else if (!from && !to && !toParamToken && !toParamCustomToken) {
      dispatch(setFrom(getProtocolToken(Number(chainId || actualCurrentNetwork.chainId || currentNetwork.chainId))));
    }

    if (toParamToken) {
      dispatch(setTo(toParamToken));
    } else if (toParamCustomToken && !to) {
      dispatch(setTo(toParamCustomToken.token));
    }
  }, [currentNetwork.chainId, fromParamCustomToken, toParamCustomToken]);

  React.useEffect(() => {
    if (!isLoadingSwapOptions && swapOptions && swapOptions.length && !swapOption) {
      dispatch(setSelectedRoute(swapOptions[0]));
    }

    if (!isLoadingSwapOption && swapOption && swapOption.id !== selectedRoute?.id) {
      dispatch(setSelectedRoute(swapOption));
    }
  }, [isLoadingSwapOptions, swapOption, isLoadingSwapOption, sorting]);

  const onResetForm = () => {
    dispatch(resetForm());
  };

  const onSetFrom = (newFrom: Token, updateMode = false) => {
    dispatch(setSelectedRoute(null));
    dispatch(setFromValue({ value: '', updateMode }));
    dispatch(setFrom(newFrom));
    replaceHistory(`/swap/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
  };

  const onSetTo = (newTo: Token, updateMode = false) => {
    dispatch(setSelectedRoute(null));
    dispatch(setToValue({ value: '', updateMode }));
    dispatch(setTo(newTo));
    if (from) {
      replaceHistory(`/swap/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
    }
  };

  const onToggleFromTo = () => {
    dispatch(setSelectedRoute(null));
    dispatch(toggleFromTo());

    if (to) {
      replaceHistory(`/swap/${currentNetwork.chainId}/${to.address || ''}/${from?.address || ''}`);
    }
  };

  const onSetSelectedRoute = (newRoute: SwapOption) => {
    dispatch(setSelectedRoute(newRoute));
  };

  const onSetSorting = (newSort: SwapSortOptions) => {
    dispatch(setSorting(newSort));
  };

  return (
    <Grid container spacing={2} alignItems="flex-start" justifyContent="space-around" alignSelf="flex-start">
      <Grid item xs={12} md={5}>
        <Swap
          from={from}
          to={to}
          setFrom={onSetFrom}
          setTo={onSetTo}
          isBuyOrder={isBuyOrder}
          fromValue={fromValue}
          toValue={toValue}
          setFromValue={(newFromValue: string, updateMode = false) =>
            dispatch(setFromValue({ value: newFromValue, updateMode }))
          }
          setToValue={(newToValue: string, updateMode = false) =>
            dispatch(setToValue({ value: newToValue, updateMode }))
          }
          currentNetwork={currentNetwork || DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]}
          selectedRoute={selectedRoute}
          isLoadingRoute={isLoadingSwapOptions || isLoadingSwapOption}
          onResetForm={onResetForm}
          transferTo={transferTo}
          slippage={slippage}
          gasSpeed={gasSpeed}
          disabledDexes={disabledDexes}
          setRefreshQuotes={setRefreshQuotes}
          toggleFromTo={onToggleFromTo}
        />
      </Grid>
      <Grid item xs={12} md={7} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
        <Grid container spacing={2} alignItems="stretch" justify-content="center">
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <SwapQuotes
              quotes={(selectedRoute && swapOptions) || []}
              selectedRoute={selectedRoute}
              setRoute={onSetSelectedRoute}
              isLoading={isLoadingSwapOptions}
              from={from}
              to={to}
              setSorting={onSetSorting}
              sorting={sorting}
              fetchOptions={fetchOptions}
              refreshQuotes={refreshQuotes}
              isBuyOrder={isBuyOrder}
              bestQuote={swapOptions?.[0]}
              swapOptionsError={swapOptionsError}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <AggregatorFAQ />
      </Grid>
    </Grid>
  );
};
export default SwapContainer;
