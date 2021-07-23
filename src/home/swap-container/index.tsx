import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { useParams } from 'react-router-dom';
import GraphWidget from 'common/graph-widget';
import find from 'lodash/find';
import WalletContext from 'common/wallet-context';
import { useQuery } from '@apollo/client';
import useTokenList from 'hooks/useTokenList';
import Swap from './components/swap';
import { DAY_IN_SECONDS } from 'utils/parsing';
import { WETH, DAI, UNI } from 'mocks/tokens';
import Hidden from '@material-ui/core/Hidden';

const SwapContainer = () => {
  const routeParams = useParams<{ from: string; to: string }>();
  const [from, setFrom] = React.useState((routeParams && routeParams.from) || UNI.address);
  const [to, setTo] = React.useState((routeParams && routeParams.to) || DAI.address);
  const [fromValue, setFromValue] = React.useState('');
  const [frequencyType, setFrequencyType] = React.useState(DAY_IN_SECONDS);
  const [frequencyValue, setFrequencyValue] = React.useState('5');
  const tokenList = useTokenList();

  const onSetFrom = (from: string) => {
    setFrom(from);
    if (!tokenList[from].pairableTokens.includes(to)) {
      setTo(tokenList[from].pairableTokens[0]);
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" justify="space-around">
      <WalletContext.Consumer>
        {({ graphPricesClient, web3Service }) => (
          <>
            <Grid item xs={9} md={5}>
              <Swap
                from={from}
                to={to}
                setFrom={onSetFrom}
                setTo={setTo}
                frequencyType={frequencyType}
                frequencyValue={frequencyValue}
                setFrequencyType={setFrequencyType}
                setFrequencyValue={setFrequencyValue}
                fromValue={fromValue}
                setFromValue={setFromValue}
                web3Service={web3Service}
                tokenList={tokenList}
              />
            </Grid>
            <Hidden mdDown>
              <Grid item xs={7} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
                <GraphWidget from={tokenList[from]} to={tokenList[to]} client={graphPricesClient} />
              </Grid>
            </Hidden>
          </>
        )}
      </WalletContext.Consumer>
    </Grid>
  );
};
export default SwapContainer;
