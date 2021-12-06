import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import orderBy from 'lodash/orderBy';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import GraphWidget from 'common/graph-widget';
import WalletContext from 'common/wallet-context';
import { getWrappedProtocolToken, USDC } from 'mocks/tokens';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Hidden from '@material-ui/core/Hidden';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { NETWORKS, ONE_DAY, STRING_SWAP_INTERVALS } from 'config/constants';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { GetSwapIntervalsGraphqlResponse, Token } from 'types';
import { useQuery } from '@apollo/client';
import useDCAGraphql from 'hooks/useDCAGraphql';
import { BigNumber } from 'ethers';
import getAvailableIntervals from 'graphql/getAvailableIntervals.graphql';
import Swap from './components/swap';

const SwapContainer = () => {
  const [fromValue, setFromValue] = React.useState('');
  const [frequencyType, setFrequencyType] = React.useState(ONE_DAY);
  const [frequencyValue, setFrequencyValue] = React.useState('5');
  const currentNetwork = useCurrentNetwork();
  const [from, setFrom] = React.useState(getWrappedProtocolToken(currentNetwork.chainId));
  const [to, setTo] = React.useState(USDC(currentNetwork.chainId));
  const client = useDCAGraphql();
  const { loading: isLoadingSwapIntervals, data: swapIntervalsData } = useQuery<GetSwapIntervalsGraphqlResponse>(
    getAvailableIntervals,
    {
      client,
    }
  );

  React.useEffect(() => {
    setFrom(getWrappedProtocolToken(currentNetwork.chainId));
    setTo(USDC(currentNetwork.chainId));
  }, [currentNetwork.chainId]);

  const onSetFrom = (newFrom: Token) => {
    // check for decimals
    if (newFrom.decimals < from.decimals) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, newFrom.decimals)}`;
      }

      setFromValue(newFromValue);
    }

    setFrom(newFrom);
  };
  const onSetTo = (newTo: Token) => {
    setTo(newTo);
  };

  const toggleFromTo = () => {
    setTo(from);

    // check for decimals
    if (to.decimals < from.decimals) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, to.decimals)}`;
      }

      setFromValue(newFromValue);
    }
    setFrom(to);
  };

  const isLoading = isLoadingSwapIntervals || !swapIntervalsData;

  return (
    <Grid container spacing={2} alignItems="center" justify="space-around">
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
                    setFrequencyType={setFrequencyType}
                    setFrequencyValue={setFrequencyValue}
                    fromValue={fromValue}
                    setFromValue={setFromValue}
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
                {/* <Hidden mdDown>
                  <Grid item xs={7} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
                    <GraphWidget from={from} to={to} />
                  </Grid>
                </Hidden> */}
              </>
            )}
          </>
        )}
      </WalletContext.Consumer>
    </Grid>
  );
};
export default SwapContainer;
