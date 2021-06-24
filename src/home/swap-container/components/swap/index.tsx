import React from 'react';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { TokenList } from 'common/wallet-context';
import Typography from '@material-ui/core/Typography';
import Grow from '@material-ui/core/Grow';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/token-picker';
import TokenButton from 'common/token-button';
import TokenInput from 'common/token-input';
import FrequencyInput from 'common/frequency-input';
import FrequencyTypeInput from 'common/frequency-type-input';
import { SwapContextValue } from '../../SwapContext';
import Button from '@material-ui/core/Button';
import Divider from 'common/divider-wit-content';
import IconButton from '@material-ui/core/IconButton';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import find from 'lodash/find';
import WarningIcon from '@material-ui/icons/Warning';
import { BigNumber } from 'ethers';
import Web3Service from 'services/web3Service';
import usePromise from 'hooks/usePromise';

const StyledPaper = styled(Paper)`
  padding: 20px;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
`;

const StyledWarningContainer = styled(Paper)<{ in: boolean }>`
  border-radius: 3px;
  background-color: ${(props) => props.theme.palette.warning.light};
  display: ${(props) => (props.in ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const StyledWarningIcon = styled(WarningIcon)`
  color: ${(props) => props.theme.palette.warning.dark};
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
  web3Service: Web3Service;
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
  availablePairs,
  web3Service,
}: SwapProps) => {
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from);
  const [balance, isLoadingBalance, balanceErrors] = usePromise(
    web3Service,
    'getBalance',
    [from],
    !from || !web3Service.getAccount()
  );

  console.log(isLoadingBalance);

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

  const toggleFromTo = () => {
    setFrom(to);
    setTo(from);
  };

  const isPairExisting = React.useMemo(() => {
    let token0 = from < to ? from : to;
    let token1 = from < to ? to : from;
    return !!find(availablePairs, { token0, token1 });
  }, [from, to]);

  const hasError = fromValue && balance && BigNumber.from(fromValue).gt(BigNumber.from(balance));

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
            <TokenInput
              id="from-value"
              error={hasError ? 'Ammount cannot exceed balance' : ''}
              value={fromValue}
              label={tokenList[from]?.symbol}
              onChange={setFromValue}
              withBalance={!isLoadingBalance}
              isLoadingBalance={isLoadingBalance}
              balance={balance}
            />
          </Grid>
        </Grid>
        <Divider>
          <IconButton onClick={toggleFromTo}>
            <SwapVertIcon />
          </IconButton>
        </Divider>
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
        <Grid container alignItems="stretch" spacing={2}>
          <Grid item xs={12}>
            <Grow in={!isPairExisting}>
              <StyledWarningContainer elevation={0} in={!isPairExisting}>
                <StyledWarningIcon />
                <Typography variant="body1">
                  <FormattedMessage
                    description="This pair does not exist yet"
                    defaultMessage="This pair does not exist yet"
                  />
                </Typography>
                <Button size="small" variant="contained" disabled={isPairExisting} color="primary">
                  <Typography variant="button">
                    <FormattedMessage
                      description="Be the first to create it"
                      defaultMessage="Be the first to create it"
                    />
                  </Typography>
                </Button>
              </StyledWarningContainer>
            </Grow>
          </Grid>
          <Grid item xs={12}>
            <Button
              size="large"
              variant="contained"
              disabled={!isPairExisting || !fromValue || hasError}
              color="primary"
              style={{ width: '100%' }}
            >
              <Typography variant="button">
                <FormattedMessage description="Start trading" defaultMessage="Start trading" />
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Swap;
