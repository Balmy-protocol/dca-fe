import React from 'react';
import { useParams } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { TokenList, Web3Service } from 'types';
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
import usePromise from 'hooks/usePromise';
import CreatePairModal from 'common/create-pair-modal';
import { NETWORKS } from 'config/constants';
import { WETH, DAI } from 'mocks/tokens';

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
  const [shouldShowPairModal, setShouldShowPairModal] = React.useState(false);
  const routeParams = useParams<{ from: string; to: string }>();
  const [balance, isLoadingBalance, balanceErrors] = usePromise(
    web3Service,
    'getBalance',
    [from],
    !from || !web3Service.getAccount()
  );
  const [currentNetwork, isLoadingNetwork, networkErrors] = usePromise(
    web3Service,
    'getNetwork',
    [],
    !web3Service.getAccount()
  );
  const [usedTokens, isLoadingUsedTokens, usedTokensErrors] = usePromise(
    web3Service,
    'getUsedTokens',
    [],
    !web3Service.getAccount()
  );

  React.useEffect(() => {
    if (Object.keys(tokenList).length) {
      if (!from) {
        setFrom((routeParams && routeParams.from) || DAI.address);
      }
      if (!to) {
        setTo((routeParams && routeParams.to) || WETH.address);
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

  const networkError =
    !isLoadingNetwork &&
    currentNetwork &&
    currentNetwork.chainId !== NETWORKS[process.env.ETH_NETWORK as keyof typeof NETWORKS];

  const shouldDisableButton =
    !isPairExisting ||
    !fromValue ||
    hasError ||
    networkError ||
    isLoadingNetwork ||
    isLoadingBalance ||
    balanceErrors ||
    networkErrors;

  console.log(usedTokens);
  return (
    <StyledPaper elevation={3}>
      <CreatePairModal
        open={shouldShowPairModal}
        onCancel={() => setShouldShowPairModal(false)}
        web3Service={web3Service}
        from={tokenList[from]}
        to={tokenList[to]}
      />
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
                <Button
                  size="small"
                  variant="contained"
                  disabled={isPairExisting}
                  onClick={() => setShouldShowPairModal(true)}
                  color="primary"
                >
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
            <Grow in={networkError}>
              <StyledWarningContainer elevation={0} in={networkError}>
                <StyledWarningIcon />
                <Typography variant="body1">
                  <FormattedMessage
                    description="wrong chainId"
                    defaultMessage="You are not currently connected to the mainnet"
                  />
                </Typography>
              </StyledWarningContainer>
            </Grow>
          </Grid>
          <Grid item xs={12}>
            <Button
              size="large"
              variant="contained"
              disabled={shouldDisableButton}
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
