import React from 'react';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { TokenList } from 'common/wallet-context';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/token-picker';
import TokenButton from 'common/token-button';
import TokenInput from 'common/token-input';
import FrequencyInput from 'common/frequency-input';
import FrequencyTypeInput from 'common/frequency-type-input';
import { SwapContextValue } from '../../SwapContext';
import Button from '@material-ui/core/Button';

const StyledPaper = styled(Paper)`
  padding: 20px;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
`;

const frequencyTypeOptions = [
  {
    value: 'Days',
  },
  {
    value: 'Weeks',
  },
  {
    value: 'Months',
  },
];

interface SwapProps extends SwapContextValue {
  tokenList: TokenList;
}

const Swap = ({
  from,
  to,
  fromValue,
  toValue,
  setFrom,
  setTo,
  setFromValue,
  setToValue,
  tokenList,
  setFrequencyType,
  setFrequencyValue,
  frequencyType,
  frequencyValue,
}: SwapProps) => {
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from);

  React.useEffect(() => {
    if (Object.keys(tokenList).length) {
      if (!from) {
        setFrom('0x6b175474e89094c44da98b954eedeac495271d0f');
      }
      if (!to) {
        setTo('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
      }
    }

    if (!frequencyType) {
      setFrequencyType(frequencyTypeOptions[0].value);
    }
  }, [tokenList]);

  const startSelectingCoin = (token: string) => {
    setSelecting(token);
    setShouldShowPicker(true);
  };

  console.log(selecting === from, selecting, from);

  return (
    <StyledPaper elevation={3}>
      <TokenPicker
        shouldShow={shouldShowPicker}
        onClose={() => setShouldShowPicker(false)}
        isFrom={selecting === from}
        selected={selecting}
        onChange={selecting === from ? setFrom : setTo}
        tokenList={tokenList}
      />
      <Grid container>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={12}>
            <Typography variant="h6">
              <FormattedMessage description="You pay" defaultMessage="You pay" />
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <TokenButton token={tokenList[from]} onClick={() => startSelectingCoin(from)} />
          </Grid>
          <Grid item xs={6}>
            <TokenInput id="from-value" value={fromValue} label={tokenList[from]?.symbol} onChange={setFromValue} />
          </Grid>
        </Grid>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={12}>
            <Typography variant="h6">
              <FormattedMessage description="You get" defaultMessage="You get" />
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <TokenButton token={tokenList[to]} onClick={() => startSelectingCoin(to)} />
          </Grid>
          <Grid item xs={6}>
            <TokenInput id="to-value" value={toValue} disabled label={tokenList[to]?.symbol} onChange={setToValue} />
          </Grid>
        </Grid>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={12}>
            <Typography variant="h6">
              <FormattedMessage description="Set for" defaultMessage="Set for" />
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <FrequencyInput id="frequency-value" value={frequencyValue} label="" onChange={setFrequencyValue} />
          </Grid>
          <Grid item xs={6}>
            <FrequencyTypeInput
              id="frequency-type-value"
              options={frequencyTypeOptions}
              selected={frequencyType}
              onChange={setFrequencyType}
            />
          </Grid>
        </Grid>
        <Grid container alignItems="stretch">
          <Button size="large" variant="contained" color="primary" style={{ width: '100%' }}>
            <Typography variant="button">
              <FormattedMessage description="Start trading" defaultMessage="Start trading" />
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Swap;
