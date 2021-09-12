import React from 'react';
import { parseUnits, formatUnits } from '@ethersproject/units';
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
import FrequencyInput from 'common/frequency-easy-input';
import FrequencyTypeInput from 'common/frequency-type-input';
import { SwapContextValue } from '../../SwapContext';
import Button from 'common/button';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from 'common/divider-wit-content';
import IconButton from '@material-ui/core/IconButton';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import find from 'lodash/find';
import WarningIcon from '@material-ui/icons/Warning';
import usePromise from 'hooks/usePromise';
import useBalance from 'hooks/useBalance';
import useUsedTokens from 'hooks/useUsedTokens';
import CreatePairModal from 'common/create-pair-modal';
import StalePairModal from 'common/stale-pair-modal';
import LowLiquidityModal from 'common/low-liquidity-modal';
import {
  FULL_DEPOSIT_TYPE,
  MINIMUM_LIQUIDITY_USD,
  MODE_TYPES,
  NETWORKS,
  POSSIBLE_ACTIONS,
  RATE_TYPE,
  TRANSACTION_TYPES,
} from 'config/constants';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import useTransactionModal from 'hooks/useTransactionModal';
import { formatCurrencyAmount } from 'utils/currency';
import {
  useTransactionAdder,
  useHasPendingApproval,
  useHasConfirmedApproval,
  useHasPendingPairCreation,
  useHasPendingWrap,
} from 'state/transactions/hooks';
import {
  DAY_IN_SECONDS,
  WEEK_IN_SECONDS,
  MONTH_IN_SECONDS,
  STRING_SWAP_INTERVALS,
  FIVE_MINUTES_IN_SECONDS,
  getFrequencyLabel,
  calculateStale,
  HOURS_IN_SECONDS,
} from 'utils/parsing';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { BigNumber } from 'ethers';
import { ETH, WETH } from 'mocks/tokens';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

const StyledPaper = styled(Paper)`
  padding: 8px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
`;

const StyledSwapContainer = styled.div`
  display: flex;
  background-color: #f6f6f6;
  border-radius: 20px;
  padding: 0px;
`;

const StyledFromContainer = styled(Grid)`
  padding: 24px 24px 32px 24px;
`;

const StyledToContainer = styled(Grid)`
  background-color: #e3e3e3;
  padding: 24px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  position: relative;
`;

const StyledSettingsContainer = styled.div`
  padding: 24px;
`;

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledSettingContainer = styled.div`
  margin-top: 32px;
`;

const StyledButton = styled(Button)`
  padding: 18px 22px;
  border-radius: 12px;
`;

const StyledSwapTokenButton = styled(IconButton)`
  position: absolute;
  border: 3px solid #e3e3e3;
  background-color: #ffffff;
  left: 50%;
  top: 24px;
  transform: translateX(-50%) translateY(-100%);
  :hover {
    background-color: #f0f0f0;
  }
`;

const getFrequencyTypeOptions = (chainId: number) => [
  ...(chainId !== NETWORKS.mainnet.chainId
    ? [
        {
          label: STRING_SWAP_INTERVALS[FIVE_MINUTES_IN_SECONDS.toString()],
          value: FIVE_MINUTES_IN_SECONDS,
        },
      ]
    : []),
  // {
  //   label: STRING_SWAP_INTERVALS[HOURS_IN_SECONDS.toString()],
  //   value: HOURS_IN_SECONDS,
  // },
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
  currentNetwork: number;
}

const Swap = ({
  from,
  to,
  fromValue,
  setFrom,
  setTo,
  toggleFromTo,
  setFromValue,
  tokenList,
  setFrequencyType,
  setFrequencyValue,
  frequencyType,
  frequencyValue,
  currentNetwork,
  web3Service,
}: SwapProps) => {
  const [modeType, setModeType] = React.useState(MODE_TYPES.FULL_DEPOSIT.id);
  const [rate, setRate] = React.useState('0');
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from);
  const [shouldShowPairModal, setShouldShowPairModal] = React.useState(false);
  const [shouldShowStalePairModal, setShouldShowStalePairModal] = React.useState(false);
  const [shouldShowLowLiquidityModal, setShouldShowLowLiquidityModal] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState<keyof typeof POSSIBLE_ACTIONS>('createPosition');
  const [isLoading, setIsLoading] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const availablePairs = useAvailablePairs();
  const [balance, isLoadingBalance, balanceErrors] = useBalance(tokenList[from]);

  const [usedTokens] = useUsedTokens();

  const existingPair = React.useMemo(() => {
    let token0 = from < to ? from : to;
    let token1 = from < to ? to : from;
    return find(availablePairs, { token0, token1 });
  }, [from, to, availablePairs, (availablePairs && availablePairs.length) || 0]);

  const hasPendingApproval = useHasPendingApproval(from, existingPair?.id);
  const hasPendingWrap = useHasPendingWrap();
  const hasConfirmedApproval = useHasConfirmedApproval(from, existingPair?.id);
  const hasPendingPairCreation = useHasPendingPairCreation(from, to);

  const [allowance, isLoadingAllowance, allowanceErrors] = usePromise<GetAllowanceResponse>(
    web3Service,
    'getAllowance',
    [tokenList[from], existingPair],
    !tokenList[from] || !web3Service.getAccount() || !existingPair || hasPendingApproval
  );

  React.useEffect(() => {
    setRate(
      (fromValue &&
        parseUnits(fromValue, tokenList[from].decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(
          parseUnits(fromValue, tokenList[from].decimals).div(BigNumber.from(frequencyValue)),
          tokenList[from].decimals
        )) ||
        '0'
    );
  }, [from]);

  React.useEffect(() => {
    if (!hasPendingWrap && from === ETH.address) {
      setFrom(WETH(currentNetwork).address);
    }
  }, [hasPendingWrap]);

  const handleApproveToken = async () => {
    const fromSymbol = from === ETH.address ? tokenList[WETH(currentNetwork).address].symbol : tokenList[from].symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="approving token"
              defaultMessage="Approving use of {from}"
              values={{ from: fromSymbol || '' }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.approveToken(tokenList[from], existingPair as AvailablePair);
      addTransaction(result, { type: TRANSACTION_TYPES.APPROVE_TOKEN, typeData: { id: from, pair: existingPair?.id } });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success approving token"
            defaultMessage="Approving use of {from} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ from: fromSymbol || '' }}
          />
        ),
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  const handleWrapToken = async () => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="wrapping eth"
              defaultMessage="Wrapping {value} ETH for you"
              values={{ value: fromValue }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.wrapETH(fromValue);
      addTransaction(result, { type: TRANSACTION_TYPES.WRAP_ETHER, typeData: { amount: fromValue } });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success wrapping eth"
            defaultMessage="Wrapping ETH has been succesfully submitted to the blockchain and will be confirmed soon"
          />
        ),
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  const handleSwap = async () => {
    setShouldShowStalePairModal(false);
    const fromSymbol = from === ETH.address ? tokenList[WETH(currentNetwork).address].symbol : tokenList[from].symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="creating position"
              defaultMessage="Creating a position to swap {from} to {to}"
              values={{ from: fromSymbol || '', to: (to && tokenList[to].symbol) || '' }}
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
      addTransaction(result, {
        type: TRANSACTION_TYPES.NEW_POSITION,
        typeData: {
          from: tokenList[from === ETH.address ? WETH(currentNetwork).address : from],
          to: tokenList[to],
          fromValue,
          frequencyType: frequencyType.toString(),
          frequencyValue,
          existingPair: existingPair as AvailablePair,
          startedAt: Date.now(),
          id: result.hash,
        },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success creating position"
            defaultMessage="Your position creation to swap {from} to {to} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ from: fromSymbol || '', to: (to && tokenList[to].symbol) || '' }}
          />
        ),
      });

      setFromValue('');
      setRate('0');
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  const preHandleSwap = () => {
    const isStale = calculateStale(existingPair?.lastExecutedAt || 0, frequencyType, existingPair?.createdAt || 0);

    if (isStale) {
      setShouldShowStalePairModal(true);
    } else {
      handleSwap();
    }
  };

  const startSelectingCoin = (token: string) => {
    setSelecting(token);
    setShouldShowPicker(true);
  };

  const handleFromValueChange = (fromValue: string) => {
    setModeType(FULL_DEPOSIT_TYPE);
    setFromValue(fromValue);
    setRate(
      (fromValue &&
        parseUnits(fromValue, tokenList[from].decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(
          parseUnits(fromValue, tokenList[from].decimals).div(BigNumber.from(frequencyValue)),
          tokenList[from].decimals
        )) ||
        '0'
    );
  };

  const handleRateValueChange = (rate: string) => {
    setModeType(RATE_TYPE);
    setRate(rate);
    setFromValue(
      (rate &&
        parseUnits(rate, tokenList[from].decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(
          parseUnits(rate, tokenList[from].decimals).mul(BigNumber.from(frequencyValue)),
          tokenList[from].decimals
        )) ||
        ''
    );
  };

  const handleFrequencyChange = (frequencyValue: string) => {
    setFrequencyValue(frequencyValue);
    if (modeType === RATE_TYPE) {
      setFromValue(
        (rate &&
          parseUnits(rate, tokenList[from].decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(
            parseUnits(rate, tokenList[from].decimals).mul(BigNumber.from(frequencyValue)),
            tokenList[from].decimals
          )) ||
          ''
      );
    } else {
      setRate(
        (fromValue &&
          parseUnits(fromValue, tokenList[from].decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(
            parseUnits(fromValue, tokenList[from].decimals).div(BigNumber.from(frequencyValue)),
            tokenList[from].decimals
          )) ||
          '0'
      );
    }
  };

  const POSSIBLE_ACTIONS_FUNCTIONS = {
    createPair: () => setShouldShowPairModal(true),
    createPosition: preHandleSwap,
    approveToken: handleApproveToken,
  };

  const onLowLiquidityModalClose = () => {
    setShouldShowLowLiquidityModal(false);
  };

  const checkForLowLiquidity = async (actionToDo: keyof typeof POSSIBLE_ACTIONS) => {
    let hasLowLiquidity = true;

    setIsLoading(true);

    const liquidity = await web3Service.getPairLiquidity(from, to);

    setIsLoading(false);

    hasLowLiquidity = liquidity <= MINIMUM_LIQUIDITY_USD;

    setCurrentAction(actionToDo);
    if (hasLowLiquidity) {
      setShouldShowLowLiquidityModal(true);
    } else {
      POSSIBLE_ACTIONS_FUNCTIONS[actionToDo] && POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]();
    }
  };

  const closeLowLiquidityModal = () => {
    POSSIBLE_ACTIONS_FUNCTIONS[currentAction] && POSSIBLE_ACTIONS_FUNCTIONS[currentAction]();
    onLowLiquidityModalClose();
  };

  const cantFund = fromValue && balance && parseUnits(fromValue, tokenList[from].decimals).gt(balance);

  const isApproved = !fromValue
    ? true
    : (!isLoadingAllowance &&
        allowance &&
        allowance.allowance &&
        allowance.token.address === from &&
        parseUnits(allowance.allowance, tokenList[from].decimals).gte(
          parseUnits(fromValue, tokenList[from].decimals)
        )) ||
      hasConfirmedApproval;

  const pairExists = existingPair;
  const shouldDisableButton =
    !pairExists ||
    !fromValue ||
    !frequencyValue ||
    cantFund ||
    isLoadingBalance ||
    balanceErrors ||
    allowanceErrors ||
    !isApproved ||
    parseUnits(fromValue, tokenList[from].decimals).lte(BigNumber.from(0)) ||
    BigNumber.from(frequencyValue).lte(BigNumber.from(0));

  const isETH = from === ETH.address;

  const ignoreValues = [from, to];

  const CreatePairButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="warning"
      disabled={!!pairExists || hasPendingPairCreation || isLoading}
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.createPair as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoading && (
        <Typography variant="body1">
          {hasPendingPairCreation ? (
            <FormattedMessage description="pair being created" defaultMessage="This pair is being created" />
          ) : (
            <FormattedMessage
              description="create pair button"
              defaultMessage="Create {from}/{to} pair"
              values={{
                from:
                  (from === ETH.address ? tokenList[WETH(currentNetwork).address].symbol : tokenList[from].symbol) ||
                  '',
                to: (tokenList[to] && tokenList[to].symbol) || '',
              }}
            />
          )}
        </Typography>
      )}
      {isLoading && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const NotConnectedButton = (
    <StyledButton size="large" variant="contained" fullWidth color="error" disabled>
      <Typography variant="body1">
        <FormattedMessage description="wrong chainId" defaultMessage="You are not currently connected to the mainnet" />
      </Typography>
    </StyledButton>
  );

  const NoWalletButton = (
    <StyledButton size="large" color="primary" variant="contained" fullWidth onClick={() => web3Service.connect()}>
      <Typography variant="body1">
        <FormattedMessage description="connect wallet" defaultMessage="Connect wallet" />
      </Typography>
    </StyledButton>
  );

  const ApproveTokenButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="primary"
      disabled={!!isApproved || hasPendingApproval || isLoading}
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.approveToken as keyof typeof POSSIBLE_ACTIONS)}
    >
      <Typography variant="body1">
        {hasPendingApproval ? (
          <FormattedMessage
            description="waiting for approval"
            defaultMessage="Waiting for your {token} to be approved"
            values={{
              token:
                (from === ETH.address ? tokenList[WETH(currentNetwork).address].symbol : tokenList[from].symbol) || '',
            }}
          />
        ) : (
          <FormattedMessage
            description="Allow us to use your coin"
            defaultMessage="Approve {token}"
            values={{
              token:
                (from === ETH.address ? tokenList[WETH(currentNetwork).address].symbol : tokenList[from].symbol) || '',
            }}
          />
        )}
      </Typography>
      <Tooltip title="You only have to do this once per token" arrow placement="top">
        <StyledHelpOutlineIcon fontSize="small" />
      </Tooltip>
    </StyledButton>
  );

  const WrapButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="primary"
      disabled={!isETH || cantFund || !fromValue || hasPendingWrap}
      onClick={handleWrapToken}
    >
      <Typography variant="body1">
        {hasPendingWrap ? (
          <FormattedMessage
            description="waiting for eth to wrap"
            defaultMessage="Waiting for your ETH to be wrapped to WETH"
          />
        ) : (
          <FormattedMessage description="wrap eth" defaultMessage="Wrap ETH" />
        )}
      </Typography>
      <Tooltip title="You can only operate with WETH. But we can wrap your ETH for you" arrow placement="top">
        <StyledHelpOutlineIcon fontSize="small" />
      </Tooltip>
    </StyledButton>
  );

  const StartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={shouldDisableButton || isLoading}
      color="secondary"
      fullWidth
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.createPosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoading && (
        <Typography variant="body1">
          <FormattedMessage description="create position" defaultMessage="Create position" />
        </Typography>
      )}
      {isLoading && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const NoFundsButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <Typography variant="body1">
        <FormattedMessage description="insufficient funds" defaultMessage="Insufficient funds" />
      </Typography>
    </StyledButton>
  );

  let ButtonToShow;
  if (!web3Service.getAccount()) {
    ButtonToShow = NoWalletButton;
  } else if (false) {
    ButtonToShow = NotConnectedButton;
  } else if (isETH) {
    ButtonToShow = WrapButton;
  } else if (!pairExists) {
    ButtonToShow = CreatePairButton;
  } else if (!isApproved) {
    ButtonToShow = ApproveTokenButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else {
    ButtonToShow = StartPositionButton;
  }

  return (
    <StyledPaper elevation={3}>
      <CreatePairModal
        open={shouldShowPairModal}
        onCancel={() => setShouldShowPairModal(false)}
        web3Service={web3Service}
        from={tokenList[from]}
        to={tokenList[to]}
      />
      <StalePairModal
        open={shouldShowStalePairModal}
        onConfirm={handleSwap}
        onCancel={() => setShouldShowStalePairModal(false)}
      />
      <LowLiquidityModal
        open={shouldShowLowLiquidityModal}
        onConfirm={closeLowLiquidityModal}
        onCancel={onLowLiquidityModalClose}
        actionToTake={currentAction}
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
        availableFrom={tokenList[from].pairableTokens}
      />
      <StyledSwapContainer>
        <Grid container>
          <StyledFromContainer container alignItems="center" justify="space-between">
            <Grid item xs={6}>
              <Typography variant="body1">
                <FormattedMessage description="You pay" defaultMessage="You pay" />
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <Typography variant="body2">
                <FormattedMessage
                  description="in position"
                  defaultMessage="In wallet: {balance} {symbol}"
                  values={{
                    balance: formatCurrencyAmount(balance, tokenList[from], 4),
                    symbol: tokenList[from].symbol,
                  }}
                />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TokenInput
                id="from-value"
                error={cantFund ? 'Amount cannot exceed balance' : ''}
                value={fromValue}
                label={tokenList[from]?.symbol}
                onChange={handleFromValueChange}
                withBalance={!isLoadingBalance}
                isLoadingBalance={isLoadingBalance}
                balance={balance}
                token={tokenList[from]}
              />
            </Grid>
            <Grid item xs={6}>
              <Grid container alignItems="center" justify="flex-end">
                <TokenButton token={tokenList[from]} onClick={() => startSelectingCoin(from)} />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <StyledSettingContainer>
                <Typography variant="body1" component="span">
                  <FormattedMessage description="rate detail" defaultMessage="We'll swap" />
                </Typography>
                <TokenInput
                  id="rate-value"
                  value={rate}
                  label={tokenList[from]?.symbol}
                  onChange={handleRateValueChange}
                  withBalance={false}
                  token={tokenList[from]}
                  isMinimal
                />
                <Typography variant="body1" component="span">
                  <FormattedMessage
                    description="rate detail"
                    defaultMessage="{from} every {frequency} for you"
                    values={{
                      from: tokenList[from].symbol,
                      frequency:
                        STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].singular,
                    }}
                  />
                </Typography>
              </StyledSettingContainer>
            </Grid>
          </StyledFromContainer>
          <StyledToContainer container alignItems="center" justify="space-between">
            <StyledSwapTokenButton onClick={() => toggleFromTo()}>
              <SwapVertIcon />
            </StyledSwapTokenButton>
            <Grid item xs={6}>
              <Typography variant="body1">
                <FormattedMessage description="will be swapped for" defaultMessage="Will be swapped for" />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Grid container alignItems="center" justify="flex-end">
                <TokenButton token={tokenList[to]} onClick={() => startSelectingCoin(to)} />
              </Grid>
            </Grid>
          </StyledToContainer>
        </Grid>
      </StyledSwapContainer>
      <StyledSettingsContainer>
        <Grid container>
          <Grid item xs={12}>
            <Grid container alignItems="center" justify="space-between" spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <FormattedMessage description="executes once" defaultMessage="Executes once" />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FrequencyTypeInput
                  id="frequency-type-value"
                  options={getFrequencyTypeOptions(currentNetwork)}
                  selected={frequencyType}
                  onChange={setFrequencyType}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <StyledSettingContainer>
              <Grid container alignItems="center" justify="space-between" spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="completes in"
                      defaultMessage="Amount of {type}"
                      values={{ type: getFrequencyLabel(frequencyType.toString(), frequencyValue) }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FrequencyInput
                    id="frequency-value"
                    value={frequencyValue}
                    label={frequencyType.toString()}
                    onChange={handleFrequencyChange}
                  />
                </Grid>
              </Grid>
            </StyledSettingContainer>
          </Grid>
          <Grid item xs={12}>
            <StyledSettingContainer>
              <Grid container alignItems="stretch" spacing={2}>
                <Grid item xs={12}>
                  {ButtonToShow}
                </Grid>
              </Grid>
            </StyledSettingContainer>
          </Grid>
        </Grid>
      </StyledSettingsContainer>
    </StyledPaper>
  );
};
export default Swap;
