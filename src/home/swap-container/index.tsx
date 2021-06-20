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
        {({ tokenList, graphPricesClient }) => (
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
              />
            </Grid>
            <Grid item xs={6}>
              <GraphWidget
                from={from}
                to={to}
                fromLabel={tokenList[from]?.symbol || ''}
                toLabel={tokenList[to]?.symbol || ''}
                client={graphPricesClient}
              />
            </Grid>
          </>
        )}
      </WalletContext.Consumer>
    </Grid>
  );
};
export default SwapContainer;
