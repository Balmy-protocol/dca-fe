import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import GraphWidget from 'common/graph-widget';
import WalletContext from 'common/wallet-context';
import Swap from './components/swap';

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
