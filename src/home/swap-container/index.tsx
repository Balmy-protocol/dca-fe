import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Swap from './components/swap';
import TradingViewWidget from 'common/trading-view-widget';

const SwapContainer = () => {
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [fromValue, setFromValue] = React.useState(0);
  const [toValue, setToValue] = React.useState(0);

  return (
    <Grid container spacing={2} alignItems="center" justify="space-around">
      <Grid item xs={6}>
        <Swap
          from={from}
          to={to}
          setFrom={setFrom}
          setTo={setTo}
          fromValue={fromValue}
          toValue={toValue}
          setFromValue={setFromValue}
          setToValue={setToValue}
        />
      </Grid>
      <Grid item xs={6}>
        <TradingViewWidget from={from} to={to} />
      </Grid>
    </Grid>
  );
};
export default SwapContainer;
