import * as React from 'react';
import Grid from '@mui/material/Grid';
import orderBy from 'lodash/orderBy';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import GraphWidget from 'common/graph-widget';
import WalletContext from 'common/wallet-context';
import { getProtocolToken } from 'mocks/tokens';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Hidden from '@mui/material/Hidden';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { NETWORKS, STRING_SWAP_INTERVALS } from 'config/constants';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { GetSwapIntervalsGraphqlResponse, Token } from 'types';
import { useQuery } from '@apollo/client';
import useDCAGraphql from 'hooks/useDCAGraphql';
import { BigNumber } from 'ethers';
import getAvailableIntervals from 'graphql/getAvailableIntervals.graphql';
import { useCreatePositionState } from 'state/create-position/hooks';
import { useAppDispatch } from 'state/hooks';
import { setFrequencyType, setFrequencyValue, setFrom, setFromValue, setTo } from 'state/create-position/actions';
import { useHistory, useParams } from 'react-router-dom';
import useToken from 'hooks/useToken';
import Swap from './components/swap';

const SwapContainer = () => {
  const { fromValue, frequencyType, frequencyValue, from, to } = useCreatePositionState();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const client = useDCAGraphql();
  const {
    from: fromParam,
    to: toParam,
    chainId: chainIdParam,
  } = useParams<{ from: string; to: string; chainId: string }>();
  const fromParamToken = useToken(fromParam);
  const toParamToken = useToken(toParam);
  const history = useHistory();

  const { loading: isLoadingSwapIntervals, data: swapIntervalsData } = useQuery<GetSwapIntervalsGraphqlResponse>(
    getAvailableIntervals,
    {
      client,
    }
  );

  React.useEffect(() => {
    if (fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (!from) {
      dispatch(setFrom(getProtocolToken(currentNetwork.chainId)));
    }

    if (toParamToken && !to) {
      dispatch(setTo(toParamToken));
    }
  }, [currentNetwork.chainId]);

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
    history.replace(`/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
  };
  const onSetTo = (newTo: Token) => {
    dispatch(setTo(newTo));
    if (from) {
      history.replace(`/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
    }
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
      history.replace(`/${currentNetwork.chainId}/${to.address || ''}/${from?.address || ''}`);
    }
  };

  const isLoading = isLoadingSwapIntervals || !swapIntervalsData;

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="space-around">
      <WalletContext.Consumer>
        {({ web3Service }) => (
          <>
            {isLoading && (
              <Grid item xs={12}>
                <CenteredLoadingIndicator size={50} />
              </Grid>
            )}
            {!isLoading && (
              <>
                <Grid item xs={12} md={5}>
                  <Swap
                    from={from}
                    to={to}
                    setFrom={onSetFrom}
                    setTo={onSetTo}
                    frequencyType={frequencyType}
                    frequencyValue={frequencyValue}
                    setFrequencyType={(newFrequencyType) => dispatch(setFrequencyType(newFrequencyType))}
                    setFrequencyValue={(newFrequencyValue) => dispatch(setFrequencyValue(newFrequencyValue))}
                    fromValue={fromValue}
                    setFromValue={(newFromValue) => dispatch(setFromValue(newFromValue))}
                    web3Service={web3Service}
                    currentNetwork={currentNetwork || NETWORKS.optimism}
                    toggleFromTo={toggleFromTo}
                    availableFrequencies={
                      (swapIntervalsData &&
                        orderBy(
                          swapIntervalsData.swapIntervals,
                          [(swapInterval) => parseInt(swapInterval.interval, 10)],
                          ['asc']
                        ).map((swapInterval) => ({
                          label:
                            STRING_SWAP_INTERVALS[
                              swapInterval.interval.toString() as keyof typeof STRING_SWAP_INTERVALS
                            ],
                          value: BigNumber.from(swapInterval.interval),
                        }))) ||
                      []
                    }
                  />
                </Grid>
                <Hidden mdDown>
                  <Grid item xs={7} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
                    <GraphWidget from={from} to={to} />
                  </Grid>
                </Hidden>
              </>
            )}
          </>
        )}
      </WalletContext.Consumer>
    </Grid>
  );
};
export default SwapContainer;
