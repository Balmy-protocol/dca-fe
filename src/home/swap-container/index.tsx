import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import GraphWidget from 'common/graph-widget';
import WalletContext from 'common/wallet-context';
import Swap from './components/swap';

const MOCKED_AVAILABLE_PAIRS = [
  {
    token0: '0x6b175474e89094c44da98b954eedeac495271d0f',
    token1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    id: '1',
  },
];

const SwapContainer = () => {
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [fromValue, setFromValue] = React.useState('');
  const [toValue, setToValue] = React.useState('');
  const [frequencyType, setFrequencyType] = React.useState('');
  const [frequencyValue, setFrequencyValue] = React.useState('1');

  return (
    <Grid container spacing={2} alignItems="center" justify="space-around">
      <WalletContext.Consumer>
        {({ tokenList, graphPricesClient, web3Service }) => (
          <>
            <Grid item xs={6}>
              <Swap
                from={from}
                to={to}
                setFrom={setFrom}
                setTo={setTo}
                frequencyType={frequencyType}
                frequencyValue={frequencyValue}
                setFrequencyType={setFrequencyType}
                setFrequencyValue={setFrequencyValue}
                fromValue={fromValue}
                toValue={toValue}
                setFromValue={setFromValue}
                setToValue={setToValue}
                tokenList={tokenList}
                availablePairs={MOCKED_AVAILABLE_PAIRS}
                web3Service={web3Service}
              />
            </Grid>
            <Grid item xs={6} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
              <GraphWidget from={tokenList[from]} to={tokenList[to]} client={graphPricesClient} />
            </Grid>
          </>
        )}
      </WalletContext.Consumer>
    </Grid>
  );
};
export default SwapContainer;
