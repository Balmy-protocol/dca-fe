import React from 'react';
import { parseUnits, formatUnits } from '@ethersproject/units';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Web3Service, GetAllowanceResponse, AvailablePair, SetStateCallback, Token } from 'types';
import Typography from '@material-ui/core/Typography';
import Grow from '@material-ui/core/Grow';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/token-picker';
import TokenButton from 'common/token-button';
import TokenInput from 'common/token-input';
import FrequencyInput from 'common/frequency-easy-input';
import FrequencyTypeInput from 'common/frequency-type-input';
import Button from 'common/button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import find from 'lodash/find';
import usePromise from 'hooks/usePromise';
import useBalance from 'hooks/useBalance';
import useUsedTokens from 'hooks/useUsedTokens';
import CreatePairModal from 'common/create-pair-modal';
import StalePairModal from 'common/stale-pair-modal';
import LowLiquidityModal from 'common/low-liquidity-modal';
import {
  FIVE_MINUTES,
  FULL_DEPOSIT_TYPE,
  MINIMUM_LIQUIDITY_USD,
  MODE_TYPES,
  NETWORKS,
  ONE_HOUR,
  ONE_WEEK,
  ONE_DAY,
  STRING_SWAP_INTERVALS,
  POSSIBLE_ACTIONS,
  RATE_TYPE,
  SUPPORTED_NETWORKS,
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
import { getFrequencyLabel, calculateStale } from 'utils/parsing';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { BigNumber } from 'ethers';
import { ETH, WETH } from 'mocks/tokens';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import NetworkMenu from 'common/network-menu';
import { STALE } from 'hooks/useIsStale';

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
          label: STRING_SWAP_INTERVALS[FIVE_MINUTES.toString()],
          value: FIVE_MINUTES,
        },
      ]
    : []),
  {
    label: STRING_SWAP_INTERVALS[ONE_HOUR.toString()],
    value: ONE_HOUR,
  },
  {
    label: STRING_SWAP_INTERVALS[ONE_DAY.toString()],
    value: ONE_DAY,
  },
  {
    label: STRING_SWAP_INTERVALS[ONE_WEEK.toString()],
    value: ONE_WEEK,
  },
];

interface SwapProps {
  from: Token;
  fromValue: string;
  to: Token;
  frequencyType: BigNumber;
  frequencyValue: string;
  setFrom: SetStateCallback<Token>;
  setTo: SetStateCallback<Token>;
  toggleFromTo: () => void;
  setFromValue: SetStateCallback<string>;
  setFrequencyType: SetStateCallback<BigNumber>;
  setFrequencyValue: SetStateCallback<string>;
  web3Service: Web3Service;
  currentNetwork: { chainId: number; name: string };
}

const Swap = ({
  from,
  to,
  fromValue,
  setFrom,
  setTo,
  toggleFromTo,
  setFromValue,
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
  const [shouldOpenNetworkMenu, setShouldOpenNetworkMenu] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState<keyof typeof POSSIBLE_ACTIONS>('createPosition');
  const [isLoading, setIsLoading] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const availablePairs = useAvailablePairs();
  const [balance, isLoadingBalance, balanceErrors] = useBalance(from);

  const [usedTokens] = useUsedTokens();

  const existingPair = React.useMemo(() => {
    const token0 = from.address < to.address ? from.address : to.address;
    const token1 = from.address < to.address ? to.address : from.address;
    return find(availablePairs, (pair) => pair.token0.address === token0 && pair.token1.address === token1);
  }, [from, to, availablePairs, (availablePairs && availablePairs.length) || 0]);

  const hasPendingApproval = useHasPendingApproval(from, existingPair?.id);
  const hasPendingWrap = useHasPendingWrap();
  const hasConfirmedApproval = useHasConfirmedApproval(from, existingPair?.id);
  const hasPendingPairCreation = useHasPendingPairCreation(from, to);

  const [allowance, isLoadingAllowance, allowanceErrors] = usePromise<GetAllowanceResponse>(
    web3Service,
    'getAllowance',
    [from, existingPair],
    !from || !web3Service.getAccount() || !existingPair || hasPendingApproval
  );

  const [hasPool, isLoadingHasPool] = usePromise<boolean>(web3Service, 'hasPool', [from, to], !from || !to);

  React.useEffect(() => {
    setRate(
      (fromValue &&
        parseUnits(fromValue, from.decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(parseUnits(fromValue, from.decimals).div(BigNumber.from(frequencyValue)), from.decimals)) ||
        '0'
    );
  }, [from]);

  React.useEffect(() => {
    if (!hasPendingWrap && from.address === ETH.address) {
      setFrom(WETH(currentNetwork.chainId));
    }
  }, [hasPendingWrap]);

  const handleApproveToken = async () => {
    const fromSymbol = from.address === ETH.address ? WETH(currentNetwork.chainId).symbol : from.symbol;

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
      const result = await web3Service.approveToken(from, existingPair as AvailablePair);
      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: { token: from, pair: (existingPair as AvailablePair).id },
      });
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
    const fromSymbol = from.address === ETH.address ? WETH(currentNetwork.chainId).symbol : from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="creating position"
              defaultMessage="Creating a position to swap {from} to {to}"
              values={{ from: fromSymbol || '', to: (to && to.symbol) || '' }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.deposit(
        from,
        to,
        fromValue,
        frequencyType,
        frequencyValue,
        existingPair as AvailablePair
      );
      addTransaction(result, {
        type: TRANSACTION_TYPES.NEW_POSITION,
        typeData: {
          from: from.address === ETH.address ? WETH(currentNetwork.chainId) : from,
          to,
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
            values={{ from: fromSymbol || '', to: (to && to.symbol) || '' }}
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
    const isStale =
      calculateStale(
        existingPair?.lastExecutedAt || 0,
        frequencyType,
        existingPair?.createdAt || 0,
        existingPair?.swapInfo || null
      ) === STALE;

    if (isStale) {
      setShouldShowStalePairModal(true);
    } else {
      handleSwap();
    }
  };

  const startSelectingCoin = (token: Token) => {
    setSelecting(token);
    setShouldShowPicker(true);
  };

  const handleFromValueChange = (fromValue: string) => {
    setModeType(FULL_DEPOSIT_TYPE);
    setFromValue(fromValue);
    setRate(
      (fromValue &&
        parseUnits(fromValue, from.decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(parseUnits(fromValue, from.decimals).div(BigNumber.from(frequencyValue)), from.decimals)) ||
        '0'
    );
  };

  const handleRateValueChange = (rate: string) => {
    setModeType(RATE_TYPE);
    setRate(rate);
    setFromValue(
      (rate &&
        parseUnits(rate, from.decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(parseUnits(rate, from.decimals).mul(BigNumber.from(frequencyValue)), from.decimals)) ||
        ''
    );
  };

  const handleFrequencyChange = (frequencyValue: string) => {
    setFrequencyValue(frequencyValue);
    if (modeType === RATE_TYPE) {
      setFromValue(
        (rate &&
          parseUnits(rate, from.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(rate, from.decimals).mul(BigNumber.from(frequencyValue)), from.decimals)) ||
          ''
      );
    } else {
      setRate(
        (fromValue &&
          parseUnits(fromValue, from.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(fromValue, from.decimals).div(BigNumber.from(frequencyValue)), from.decimals)) ||
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

  const cantFund = fromValue && balance && parseUnits(fromValue, from.decimals).gt(balance);

  const isApproved = !fromValue
    ? true
    : (!isLoadingAllowance &&
        allowance &&
        allowance.allowance &&
        allowance.token.address === from.address &&
        parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
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
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0)) ||
    BigNumber.from(frequencyValue).lte(BigNumber.from(0));

  const isETH = from.address === ETH.address;

  const ignoreValues = [from.address, to.address];

  const CreatePairButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="warning"
      disabled={!!pairExists || hasPendingPairCreation || isLoading || isLoadingHasPool}
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.createPair as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoading && !isLoadingHasPool && (
        <Typography variant="body1">
          {hasPendingPairCreation ? (
            <FormattedMessage description="pair being created" defaultMessage="This pair is being created" />
          ) : (
            <FormattedMessage
              description="create pair button"
              defaultMessage="Create {from}/{to} pair"
              values={{
                from: (from.address === ETH.address ? WETH(currentNetwork.chainId).symbol : from.symbol) || '',
                to: (to && to.symbol) || '',
              }}
            />
          )}
        </Typography>
      )}
      {(isLoading || isLoadingHasPool) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const NotConnectedButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="error"
      onClick={() => setShouldOpenNetworkMenu(true)}
    >
      <Typography variant="body1">
        <FormattedMessage description="wrong chainId" defaultMessage="We do not support this chain yet" />
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
      style={{ pointerEvents: 'all' }}
    >
      <Typography variant="body1">
        {hasPendingApproval ? (
          <FormattedMessage
            description="waiting for approval"
            defaultMessage="Waiting for your {token} to be approved"
            values={{
              token: (from.address === ETH.address ? WETH(currentNetwork.chainId).symbol : from.symbol) || '',
            }}
          />
        ) : (
          <FormattedMessage
            description="Allow us to use your coin"
            defaultMessage="Approve {token}"
            values={{
              token: (from.address === ETH.address ? WETH(currentNetwork.chainId).symbol : from.symbol) || '',
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
      style={{ pointerEvents: 'all' }}
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
      disabled={shouldDisableButton || isLoading || isLoadingHasPool}
      color="secondary"
      fullWidth
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.createPosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoading && !isLoadingHasPool && (
        <Typography variant="body1">
          <FormattedMessage description="create position" defaultMessage="Create position" />
        </Typography>
      )}
      {(isLoading || isLoadingHasPool) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const NoFundsButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <Typography variant="body1">
        <FormattedMessage description="insufficient funds" defaultMessage="Insufficient funds" />
      </Typography>
    </StyledButton>
  );

  const PairNotSupportedButton = (
    <StyledButton size="large" color="error" variant="contained" fullWidth disabled style={{ pointerEvents: 'all' }}>
      <Typography variant="body1">
        <FormattedMessage description="pairNotOnUniswap" defaultMessage="We do not support this pair" />
      </Typography>
      <Tooltip
        title="If you want to use this pair of tokens you must first create a pool for it on UniswapV3"
        arrow
        placement="top"
      >
        <StyledHelpOutlineIcon fontSize="small" />
      </Tooltip>
    </StyledButton>
  );

  const LoadingButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <CenteredLoadingIndicator />
    </StyledButton>
  );

  let ButtonToShow;

  if (!web3Service.getAccount()) {
    ButtonToShow = NoWalletButton;
  } else if (!SUPPORTED_NETWORKS.includes(currentNetwork.chainId)) {
    ButtonToShow = NotConnectedButton;
  } else if (isLoading || isLoadingHasPool) {
    ButtonToShow = LoadingButton;
  } else if (!hasPool && !isLoadingHasPool) {
    ButtonToShow = PairNotSupportedButton;
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
        from={from}
        to={to}
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
        onChange={selecting.address === from.address ? setFrom : setTo}
        usedTokens={usedTokens}
        ignoreValues={ignoreValues}
      />
      <NetworkMenu open={shouldOpenNetworkMenu} onClose={() => setShouldOpenNetworkMenu(false)} />
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
                    balance: formatCurrencyAmount(balance, from, 4),
                    symbol: from.symbol,
                  }}
                />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TokenInput
                id="from-value"
                error={cantFund ? 'Amount cannot exceed balance' : ''}
                value={fromValue}
                label={from.symbol}
                onChange={handleFromValueChange}
                withBalance={!isLoadingBalance}
                isLoadingBalance={isLoadingBalance}
                balance={balance}
                token={from}
              />
            </Grid>
            <Grid item xs={6}>
              <Grid container alignItems="center" justify="flex-end">
                <TokenButton token={from} onClick={() => startSelectingCoin(from)} />
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
                  label={from.symbol}
                  onChange={handleRateValueChange}
                  withBalance={false}
                  token={from}
                  isMinimal
                />
                <Typography variant="body1" component="span">
                  <FormattedMessage
                    description="rate detail"
                    defaultMessage="{from} every {frequency} for you"
                    values={{
                      from: from.symbol,
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
                <TokenButton token={to} onClick={() => startSelectingCoin(to)} />
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
                  options={getFrequencyTypeOptions(currentNetwork.chainId)}
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
