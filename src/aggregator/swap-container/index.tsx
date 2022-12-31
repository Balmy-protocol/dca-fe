import * as React from 'react';
import Grid from '@mui/material/Grid';
import { getProtocolToken } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from 'config/constants';
import { SwapOption, Token } from 'types';
import { useAggregatorState } from 'state/aggregator/hooks';
import { useAppDispatch } from 'state/hooks';
import {
  setFrom,
  setFromValue,
  setToValue,
  setTo,
  setSelectedRoute,
  setSorting,
  resetForm,
} from 'state/aggregator/actions';
import useSwapOptions from 'hooks/useSwapOptions';
import useCustomToken from 'hooks/useCustomToken';
import { useHistory, useParams } from 'react-router-dom';
import useToken from 'hooks/useToken';
import { SwapSortOptions } from 'config/constants/aggregator';
import { useAggregatorSettingsState } from 'state/aggregator-settings/hooks';
import Swap from './components/swap';
import SwapQuotes from './components/quotes';

const SwapContainer = () => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, sorting, transferTo } = useAggregatorState();
  const { slippage, gasSpeed } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const { from: fromParam, to: toParam } = useParams<{ from: string; to: string; chainId: string }>();
  const fromParamToken = useToken(fromParam, true, true);
  const toParamToken = useToken(toParam, true, true);
  const history = useHistory();
  const [fromParamCustomToken] = useCustomToken(fromParam, !!fromParamToken);
  const [toParamCustomToken] = useCustomToken(toParam, !!toParamToken);
  const [swapOptions, isLoadingSwapOptions, swapOptionsError, fetchOptions] = useSwapOptions(
    from,
    to,
    isBuyOrder ? toValue : fromValue,
    isBuyOrder,
    sorting,
    transferTo,
    parseFloat(slippage),
    gasSpeed
  );
  const [refreshQuotes, setRefreshQuotes] = React.useState(true);

  React.useEffect(() => {
    if (fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (fromParamCustomToken && !from) {
      dispatch(setFrom(fromParamCustomToken.token));
    } else if (!from && !to && !toParamToken && !toParamCustomToken) {
      dispatch(setFrom(getProtocolToken(currentNetwork.chainId)));
    }

    if (toParamToken) {
      dispatch(setTo(toParamToken));
    } else if (toParamCustomToken && !to) {
      dispatch(setTo(toParamCustomToken.token));
    }
  }, [currentNetwork.chainId, fromParamCustomToken, toParamCustomToken]);

  React.useEffect(() => {
    if (!isLoadingSwapOptions && swapOptions && swapOptions.length) {
      dispatch(setSelectedRoute(swapOptions[0]));
    }
  }, [isLoadingSwapOptions, sorting]);

  const onResetForm = () => {
    dispatch(resetForm());
  };

  const onSetFrom = (newFrom: Token, updateMode = false) => {
    // check for decimals
    if (from && newFrom.decimals < from.decimals) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, newFrom.decimals)}`;
      }

      dispatch(setFromValue({ value: newFromValue, updateMode }));
    }

    dispatch(setFrom(newFrom));
    history.replace(`/swap/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
  };

  const onSetTo = (newTo: Token) => {
    dispatch(setTo(newTo));
    if (from) {
      history.replace(`/swap/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
    }
  };

  const toggleFromTo = () => {
    dispatch(setTo(from));

    // check for decimals
    if (to && from && to.decimals < from.decimals && !isBuyOrder) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, to.decimals)}`;
      }

      dispatch(setFromValue({ value: newFromValue, updateMode: isBuyOrder }));
    }

    if (to && from && from.decimals < to.decimals && isBuyOrder) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(toValue);
      let newToValue = toValue;
      if (splitValue && splitValue[2] !== '') {
        newToValue = `${splitValue[1]}.${splitValue[2].substring(0, from.decimals)}`;
      }

      dispatch(setToValue({ value: newToValue, updateMode: isBuyOrder }));
    }

    dispatch(setFrom(to));

    if (to) {
      history.replace(`/swap/${currentNetwork.chainId}/${to.address || ''}/${from?.address || ''}`);
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
          isLoadingRoute={isLoadingSwapOptions}
          onResetForm={onResetForm}
          transferTo={transferTo}
          slippage={slippage}
          gasSpeed={gasSpeed}
          setRefreshQuotes={setRefreshQuotes}
          toggleFromTo={toggleFromTo}
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
    </Grid>
  );
};
export default SwapContainer;
