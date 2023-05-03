import * as React from 'react';
import Grid from '@mui/material/Grid';
import orderBy from 'lodash/orderBy';
import GraphWidget from 'common/graph-widget';
import { getProtocolToken } from 'mocks/tokens';
import Hidden from '@mui/material/Hidden';
import useCurrentNetwork from 'hooks/useSelectedNetwork';
import {
  DEFAULT_NETWORK_FOR_VERSION,
  LATEST_VERSION,
  ONE_DAY,
  shouldEnableFrequency,
  STRING_SWAP_INTERVALS,
} from 'config/constants';
import { GetSwapIntervalsGraphqlResponse, Token, YieldOption } from 'types';
import { BigNumber } from 'ethers';
import { useCreatePositionState } from 'state/create-position/hooks';
import { useAppDispatch } from 'state/hooks';
import {
  setFrequencyType,
  setFrequencyValue,
  setFrom,
  setFromValue,
  setFromYield,
  setTo,
  setToYield,
  setYieldEnabled,
} from 'state/create-position/actions';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import useYieldOptions from 'hooks/useYieldOptions';
import useReplaceHistory from 'hooks/useReplaceHistory';
import useTrackEvent from 'hooks/useTrackEvent';
import useToken from 'hooks/useToken';
import Swap from './components/swap';

interface SwapContainerProps {
  swapIntervalsData?: GetSwapIntervalsGraphqlResponse;
  handleChangeNetwork: (chainId: number) => void;
}

const SwapContainer = ({ swapIntervalsData, handleChangeNetwork }: SwapContainerProps) => {
  const { fromValue, frequencyType, frequencyValue, from, to, yieldEnabled, fromYield, toYield } =
    useCreatePositionState();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const currentNetwork = useCurrentNetwork();
  const { from: fromParam, to: toParam } = useParams<{ from: string; to: string; chainId: string }>();
  const fromParamToken = useToken(fromParam, true);
  const toParamToken = useToken(toParam, true);
  const replaceHistory = useReplaceHistory();
  const trackEvent = useTrackEvent();
  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(currentNetwork.chainId, true);
  const [isPolygonDestnantion, setIsPolygonDestination] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (!from) {
      dispatch(setFrom(getProtocolToken(currentNetwork.chainId)));
    }

    if (toParamToken) {
      dispatch(setTo(toParamToken));
    }
  }, [currentNetwork.chainId]);

  const availableFrequencies =
    (swapIntervalsData &&
      orderBy(swapIntervalsData.swapIntervals, [(swapInterval) => parseInt(swapInterval.interval, 10)], ['asc'])
        .filter((swapInterval) =>
          shouldEnableFrequency(swapInterval.interval, from?.address, to?.address, currentNetwork.chainId)
        )
        .map((swapInterval) => ({
          label: {
            singular: intl.formatMessage(
              STRING_SWAP_INTERVALS[swapInterval.interval.toString() as keyof typeof STRING_SWAP_INTERVALS].singular
            ),
            adverb: intl.formatMessage(
              STRING_SWAP_INTERVALS[swapInterval.interval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb
            ),
          },
          value: BigNumber.from(swapInterval.interval),
        }))) ||
    [];

  const onSetFrom = (newFrom: Token) => {
    // check for decimals
    if (from && newFrom.decimals < from.decimals) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, newFrom.decimals)}`;
      }

      dispatch(setFromValue(newFromValue));
    }

    dispatch(setFrom(newFrom));

    if (!shouldEnableFrequency(frequencyType.toString(), newFrom.address, to?.address, currentNetwork.chainId)) {
      dispatch(setFrequencyType(ONE_DAY));
    }

    replaceHistory(`/create/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
    trackEvent('DCA - Set from', { fromAddress: newFrom?.address, toAddress: to?.address });
  };
  const onSetTo = (newTo: Token) => {
    dispatch(setTo(newTo));
    if (!shouldEnableFrequency(frequencyType.toString(), from?.address, newTo.address, currentNetwork.chainId)) {
      dispatch(setFrequencyType(ONE_DAY));
    }
    if (from) {
      replaceHistory(`/create/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
    }
    trackEvent('DCA - Set to', { fromAddress: from?.address, toAddress: newTo?.address });
  };

  const handlePolygonDestinantion = () => {
    // eslint-disable-next-line no-console
    console.log('Clicked');
    setIsPolygonDestination(true);
  };

  const toggleFromTo = () => {
    dispatch(setTo(from));

    // check for decimals
    if (to && from && to.decimals < from.decimals) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, to.decimals)}`;
      }

      dispatch(setFromValue(newFromValue));
    }
    dispatch(setFrom(to));

    if (to) {
      replaceHistory(`/create/${currentNetwork.chainId}/${to.address || ''}/${from?.address || ''}`);
    }
    trackEvent('DCA - Toggle from/to', { fromAddress: from?.address, toAddress: to?.address });
  };

  const onSetFrequencyType = (newFrequencyType: BigNumber) => {
    dispatch(setFrequencyType(newFrequencyType));
    trackEvent('DCA - Set frequency type', {});
  };
  const onSetFrequencyValue = (newFrequencyValue: string) => {
    dispatch(setFrequencyValue(newFrequencyValue));
    trackEvent('DCA - Set frequency value', {});
  };
  const onSetYieldEnabled = (newYieldEnabled: boolean) => {
    dispatch(setYieldEnabled(newYieldEnabled));
    trackEvent('DCA - Set yield enabled', {});
  };
  const onSetFromYield = (newYield?: YieldOption | null) => {
    dispatch(setFromYield(newYield));
    trackEvent('DCA - Set yield from', {});
  };
  const onSetToYield = (newYield?: YieldOption | null) => {
    dispatch(setToYield(newYield));
    trackEvent('DCA - Set yield to', {});
  };

  return (
    <Grid container spacing={2} alignItems="flex-start" justifyContent="space-around" alignSelf="flex-start">
      <Grid item xs={12} md={5}>
        <Swap
          from={from}
          to={to}
          setFrom={onSetFrom}
          setTo={onSetTo}
          frequencyType={frequencyType}
          frequencyValue={frequencyValue}
          setFrequencyType={onSetFrequencyType}
          setFrequencyValue={onSetFrequencyValue}
          setYieldEnabled={onSetYieldEnabled}
          fromValue={fromValue}
          setFromValue={(newFromValue) => dispatch(setFromValue(newFromValue))}
          currentNetwork={currentNetwork || DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]}
          toggleFromTo={toggleFromTo}
          yieldEnabled={yieldEnabled}
          yieldOptions={yieldOptions || []}
          isLoadingYieldOptions={isLoadingYieldOptions}
          fromYield={fromYield}
          toYield={toYield}
          setFromYield={onSetFromYield}
          setToYield={onSetToYield}
          availableFrequencies={availableFrequencies}
          handleChangeNetwork={handleChangeNetwork}
          isPolygonDestnantion={isPolygonDestnantion}
          handlePolygonDestinantion={handlePolygonDestinantion}
        />
      </Grid>
      <Hidden mdDown>
        <Grid item xs={7} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
          <GraphWidget from={from} to={to} withFooter />
        </Grid>
      </Hidden>
    </Grid>
  );
};
export default SwapContainer;
