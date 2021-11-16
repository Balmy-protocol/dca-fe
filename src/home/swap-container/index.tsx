import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { useParams } from 'react-router-dom';
import GraphWidget from 'common/graph-widget';
import find from 'lodash/find';
import WalletContext from 'common/wallet-context';
import { useQuery } from '@apollo/client';
import Swap from './components/swap';
import { WETH, DAI, UNI, ETH, USDC } from 'mocks/tokens';
import Hidden from '@material-ui/core/Hidden';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { NETWORKS, ONE_DAY } from 'config/constants';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { Token } from 'types';

const SwapContainer = () => {
  const [fromValue, setFromValue] = React.useState('');
  const [frequencyType, setFrequencyType] = React.useState(ONE_DAY);
  const [frequencyValue, setFrequencyValue] = React.useState('5');
  const currentNetwork = useCurrentNetwork();
  const [from, setFrom] = React.useState(USDC(currentNetwork.chainId));
  const [to, setTo] = React.useState(WETH(currentNetwork.chainId));

  React.useEffect(() => {
    setFrom(USDC(currentNetwork.chainId));
    setTo(WETH(currentNetwork.chainId));
  }, [currentNetwork.chainId]);

  const onSetFrom = (newFrom: Token) => {
    // check for decimals
    if (newFrom.decimals < from.decimals) {
      const splitValue = fromValue.match(/^(\d*)\.?(\d*)$/);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, newFrom.decimals)}`;
      }

      setFromValue(newFromValue);
    }

    setFrom(newFrom);
    // if (!newFrom.pairableTokens.includes(to)) {
    //   setTo(newFrom.pairableTokens[0]);
    // }
  };
  const onSetTo = (to: Token) => {
    setTo(to);
    // if (!to.pairableTokens.includes(from)) {
    //   const splitValue = fromValue.match(/^(\d*)\.?(\d*)$/);
    //   let newFromValue = fromValue;
    //   if (splitValue && splitValue[2] !== '') {
    //     newFromValue = `${splitValue[1]}.${splitValue[2].substring(
    //       0,
    //       tokenList[tokenList[to].pairableTokens[0]].decimals
    //     )}`;
    //   }
    //   setFrom(tokenList[to].pairableTokens[0]);
    // }
  };

  const toggleFromTo = () => {
    if (from.address === ETH.address) {
      setTo(WETH(currentNetwork.chainId));
    } else {
      setTo(from);
    }

    // check for decimals
    if (to.decimals < from.decimals) {
      const splitValue = fromValue.match(/^(\d*)\.?(\d*)$/);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, to.decimals)}`;
      }

      setFromValue(newFromValue);
    }
    setFrom(to);
  };

  const isLoading = !currentNetwork.chainId;

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
                    currentNetwork={currentNetwork}
                    toggleFromTo={toggleFromTo}
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
