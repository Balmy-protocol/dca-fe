import React from 'react';
import { parseUnits } from '@ethersproject/units';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {
  TokenList,
  Web3Service,
  Network,
  GetUsedTokensDataResponse,
  AvailablePairs,
  GetAllowanceResponse,
  AvailablePair,
} from 'types';
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
import Tooltip from '@material-ui/core/Tooltip';
import Divider from 'common/divider-wit-content';
import IconButton from '@material-ui/core/IconButton';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import find from 'lodash/find';
import WarningIcon from '@material-ui/icons/Warning';
import usePromise from 'hooks/usePromise';
import CreatePairModal from 'common/create-pair-modal';
import { NETWORKS } from 'config/constants';
import { ETH, DAI } from 'mocks/tokens';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { buildEtherscanTransaction } from 'utils/etherscan';
import { TRANSACTION_ERRORS } from 'utils/errors';
import Link from '@material-ui/core/Link';
import useTransactionModal from 'hooks/useTransactionModal';
import { DAY_IN_SECONDS, WEEK_IN_SECONDS, MONTH_IN_SECONDS, STRING_SWAP_INTERVALS } from 'utils/parsing';

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

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledWarningIcon = styled(WarningIcon)`
  color: ${(props) => props.theme.palette.warning.dark};
`;

const frequencyTypeOptions = [
  {
    label: STRING_SWAP_INTERVALS[DAY_IN_SECONDS.toString()],
    value: DAY_IN_SECONDS,
  },
  {
    label: STRING_SWAP_INTERVALS[WEEK_IN_SECONDS.toString()],
    value: WEEK_IN_SECONDS,
  },
  {
    label: STRING_SWAP_INTERVALS[MONTH_IN_SECONDS.toString()],
    value: MONTH_IN_SECONDS,
  },
];

interface SwapProps extends SwapContextValue {
  tokenList: TokenList;
  web3Service: Web3Service;
  availablePairs: AvailablePairs;
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
  web3Service,
  availablePairs,
}: SwapProps) => {
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from);
  const [shouldShowPairModal, setShouldShowPairModal] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const [balance, isLoadingBalance, balanceErrors] = usePromise<string>(
    web3Service,
    'getBalance',
    [from, (tokenList[from] && tokenList[from].decimals) || 18],
    !from || !web3Service.getAccount()
  );

  const [currentNetwork, isLoadingNetwork, networkErrors] = usePromise<Network>(
    web3Service,
    'getNetwork',
    [],
    !web3Service.getAccount()
  );

  const [usedTokensData, isLoadingUsedTokens, usedTokensErrors] = usePromise<GetUsedTokensDataResponse>(
    web3Service,
    'getUsedTokens',
    [],
    !web3Service.getAccount()
  );

  const existingPair = React.useMemo(() => {
    let token0 = from < to ? from : to;
    let token1 = from < to ? to : from;
    return find(availablePairs, { token0, token1 });
  }, [from, to, availablePairs]);

  const [allowance, isLoadingAllowance, allowanceErrors] = usePromise<GetAllowanceResponse>(
    web3Service,
    'getAllowance',
    [tokenList[from], existingPair],
    !tokenList[from] || !web3Service.getAccount() || !existingPair
  );

  const handleApproveToken = async () => {
    try {
      setModalLoading({
        content: (
          <Typography variant="subtitle2">
            <FormattedMessage
              description="approving token"
              defaultMessage="Approving use of {from}"
              values={{ from: (from && tokenList[from].symbol) || '' }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.approveToken(tokenList[from], existingPair as AvailablePair);
      setModalSuccess({
        hash: result.hash,
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  const handleSwap = async () => {
    try {
      setModalLoading({
        content: (
          <Typography variant="subtitle2">
            <FormattedMessage
              description="creating position"
              defaultMessage="Creating a position to swap {from} to {to}"
              values={{ from: (from && tokenList[from].symbol) || '', to: (to && tokenList[to].symbol) || '' }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.deposit(
        tokenList[from],
        tokenList[to],
        fromValue,
        frequencyType,
        frequencyValue,
        existingPair as AvailablePair
      );
      setModalSuccess({
        hash: result.hash,
      });

      setFromValue('');
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  const startSelectingCoin = (token: string) => {
    setSelecting(token);
    setShouldShowPicker(true);
  };

  const toggleFromTo = () => {
    setFrom(to);
    setTo(from);
  };

  const hasError =
    fromValue &&
    balance &&
    parseUnits(fromValue, tokenList[from].decimals).gt(parseUnits(balance, tokenList[from].decimals));

  const networkError =
    !isLoadingNetwork &&
    currentNetwork &&
    currentNetwork.chainId !== NETWORKS[process.env.ETH_NETWORK as keyof typeof NETWORKS];

  const isApproved = !fromValue
    ? true
    : !isLoadingAllowance &&
      allowance &&
      parseUnits(allowance, tokenList[from].decimals).gte(parseUnits(fromValue, tokenList[from].decimals));

  const pairExists = existingPair;
  const shouldDisableButton =
    !pairExists ||
    !fromValue ||
    hasError ||
    networkError ||
    isLoadingNetwork ||
    isLoadingBalance ||
    balanceErrors ||
    allowanceErrors ||
    !isApproved ||
    networkErrors;

  const usedTokens =
    (!isLoadingUsedTokens &&
      !usedTokensErrors &&
      usedTokensData &&
      usedTokensData.data.tokens &&
      usedTokensData.data.tokens.map((token) => token.tokenInfo.address)) ||
    [];

  const ignoreValues = [from, to];

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
        usedTokens={usedTokens}
        ignoreValues={ignoreValues}
      />
      <Grid container>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={12}>
            <Typography variant="h6">
              <FormattedMessage description="You pay" defaultMessage="You pay" />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TokenButton token={tokenList[from]} onClick={() => startSelectingCoin(from)} />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={3}>
            <TokenButton token={tokenList[to]} onClick={() => startSelectingCoin(to)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TokenInput id="to-value" value={toValue} disabled label={tokenList[to]?.symbol} onChange={setToValue} />
          </Grid>
        </Grid>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={12}>
            <Typography variant="h6">
              <FormattedMessage description="Set for" defaultMessage="Set for" />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FrequencyInput id="frequency-value" value={frequencyValue} label="" onChange={setFrequencyValue} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FrequencyTypeInput
              id="frequency-type-value"
              options={frequencyTypeOptions}
              selected={frequencyType}
              onChange={setFrequencyType}
            />
          </Grid>
        </Grid>
        <Grid container alignItems="stretch" spacing={2}>
          {!pairExists ? (
            <Grid item xs={12}>
              <Grow in={!pairExists}>
                <StyledWarningContainer elevation={0} in={!pairExists}>
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
                    disabled={!!pairExists}
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
          ) : null}
          {networkError ? (
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
          ) : null}
          {!isApproved ? (
            <Grid item xs={12}>
              <Grow in={!isApproved}>
                <StyledWarningContainer elevation={0} in={!isApproved}>
                  <Button
                    size="large"
                    variant="contained"
                    disabled={!!isApproved}
                    color="primary"
                    style={{ width: '100%' }}
                    onClick={handleApproveToken}
                  >
                    <Typography variant="button">
                      <FormattedMessage
                        description="Allow us to use your coin"
                        defaultMessage="Allow us to use your {token}"
                        values={{ token: (tokenList[from] && tokenList[from].symbol) || '' }}
                      />
                    </Typography>
                    <Tooltip title="You only have to do this once per token" arrow placement="top">
                      <StyledHelpOutlineIcon fontSize="small" />
                    </Tooltip>
                  </Button>
                </StyledWarningContainer>
              </Grow>
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <Button
              size="large"
              variant="contained"
              disabled={shouldDisableButton}
              color="primary"
              style={{ width: '100%' }}
              onClick={handleSwap}
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
