import React from 'react';
import { parseUnits, formatUnits } from '@ethersproject/units';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Web3Service, GetAllowanceResponse, SetStateCallback, Token } from 'types';
import Typography from '@material-ui/core/Typography';
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
  FULL_DEPOSIT_TYPE,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MINIMUM_LIQUIDITY_USD,
  MODE_TYPES,
  STRING_SWAP_INTERVALS,
  POSSIBLE_ACTIONS,
  RATE_TYPE,
  SUPPORTED_NETWORKS,
  TRANSACTION_TYPES,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ORACLES,
  COMPANION_ADDRESS,
  HUB_ADDRESS,
  WHALE_MODE_FREQUENCIES,
  WHALE_MINIMUM_VALUES,
  TESTNETS,
  NETWORKS,
} from 'config/constants';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import useTransactionModal from 'hooks/useTransactionModal';
import { formatCurrencyAmount } from 'utils/currency';
import {
  useTransactionAdder,
  useHasPendingApproval,
  useHasConfirmedApproval,
  useHasPendingPairCreation,
} from 'state/transactions/hooks';
import { calculateStale } from 'utils/parsing';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { BigNumber } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { STALE } from 'hooks/useIsStale';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Switch from '@material-ui/core/Switch';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import FormControlLabel from '@material-ui/core/FormControlLabel';
import useIsWhitelisted from 'hooks/useIsWhitelisted';

const StyledPaper = styled(Paper)`
  padding: 8px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
`;

const StyledSwapContainer = styled.div`
  ${({ theme }) => `
    display: flex;
    background-color: ${theme.palette.type === 'light' ? '#f6f6f6' : 'rgba(255, 255, 255, 0.12)'};
    border-radius: 20px;
    padding: 0px;
  `}
`;

const StyledFromContainer = styled(Grid)`
  padding: 24px 24px 32px 24px;
`;

const StyledToContainer = styled(Grid)`
  ${({ theme }) => `
    background-color: ${theme.palette.type === 'light' ? '#e3e3e3' : 'rgba(255, 255, 255, 0.1)'};
    padding: 24px;
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    position: relative;
  `}
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledWhaleModeContainer = styled.div`
  display: flex;
  align-items: center;
`;
const StyledSwapTokenButton = styled(IconButton)`
  ${({ theme }) => `
    position: absolute;
    border: 3px solid ${theme.palette.type === 'light' ? '#e3e3e3' : '#6a6a6a'};
    background-color: ${theme.palette.type === 'light' ? '#ffffff' : '#595959'};
    left: 50%;
    top: 24px;
    transform: translateX(-50%) translateY(-100%);
    :hover {
      background-color: ${theme.palette.type === 'light' ? '#f0f0f0' : '#484848'};
    }
  `}
`;

interface AvailableSwapInterval {
  label: {
    singular: string;
    adverb: string;
  };
  value: BigNumber;
}

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
  availableFrequencies: AvailableSwapInterval[];
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
  availableFrequencies,
}: SwapProps) => {
  const [modeType, setModeType] = React.useState(MODE_TYPES.FULL_DEPOSIT.id);
  const [rate, setRate] = React.useState('0');
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from);
  const [shouldShowPairModal, setShouldShowPairModal] = React.useState(false);
  const [shouldShowStalePairModal, setShouldShowStalePairModal] = React.useState(false);
  const [shouldShowLowLiquidityModal, setShouldShowLowLiquidityModal] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState<keyof typeof POSSIBLE_ACTIONS>('createPosition');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = React.useState(false);
  const [whaleMode, setWhaleMode] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const availablePairs = useAvailablePairs();
  const [balance, isLoadingBalance, balanceErrors] = useBalance(from);
  const isWhitelisted = useIsWhitelisted();

  const [usedTokens] = useUsedTokens();

  const existingPair = React.useMemo(() => {
    let tokenA = from.address;
    let tokenB = to.address;

    if (tokenA === PROTOCOL_TOKEN_ADDRESS) {
      tokenA = getWrappedProtocolToken(currentNetwork.chainId).address;
    }
    if (tokenB === PROTOCOL_TOKEN_ADDRESS) {
      tokenB = getWrappedProtocolToken(currentNetwork.chainId).address;
    }

    const token0 = tokenA < tokenB ? tokenA : tokenB;
    const token1 = tokenA < tokenB ? tokenB : tokenA;

    return find(
      availablePairs,
      (pair) => pair.token0.address === token0.toLocaleLowerCase() && pair.token1.address === token1.toLocaleLowerCase()
    );
  }, [from, to, availablePairs, (availablePairs && availablePairs.length) || 0]);
  const isCreatingPair = useHasPendingPairCreation(from, to);

  const hasPendingApproval = useHasPendingApproval(from, to, web3Service.getAccount());
  const hasConfirmedApproval = useHasConfirmedApproval(from, to, web3Service.getAccount());

  const [allowance, isLoadingAllowance, allowanceErrors] = usePromise<GetAllowanceResponse>(
    web3Service,
    'getAllowance',
    [from, to],
    !from || !to || !web3Service.getAccount() || hasPendingApproval
  );

  const [pairIsSupported, isLoadingPairIsSupported] = usePromise<boolean>(
    web3Service,
    'canSupportPair',
    [from, to],
    !from || !to
  );

  const [usdPrice, isLoadingUsdPrice] = usePromise<number>(
    web3Service,
    'getUsdPrice',
    [from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : from],
    !from
  );

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleWhaleMode = () => {
    if (whaleMode) {
      if (
        (WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]).includes(
          frequencyType.toString()
        )
      ) {
        const firstNonFilteredResult = availableFrequencies.filter(
          (frequency) =>
            !(
              WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]
            ).includes(frequency.value.toString())
        )[0];

        setFrequencyType(firstNonFilteredResult.value);
      }
    }

    setWhaleMode(!whaleMode);
  };

  const handleApproveToken = async () => {
    const fromSymbol = from.symbol;

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
      const result = await web3Service.approveToken(from, to);
      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: from,
          addressFor:
            to.address === PROTOCOL_TOKEN_ADDRESS
              ? COMPANION_ADDRESS[currentNetwork.chainId]
              : HUB_ADDRESS[currentNetwork.chainId],
        },
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error approving token', error: { code: e.code, message: e.message } });
    }
  };

  const handleSwap = async () => {
    setShouldShowPairModal(false);
    setShouldShowStalePairModal(false);
    const fromSymbol = from.symbol;

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
      const result = await web3Service.deposit(from, to, fromValue, frequencyType, frequencyValue);
      addTransaction(result, {
        type: TRANSACTION_TYPES.NEW_POSITION,
        typeData: {
          from,
          to,
          fromValue,
          frequencyType: frequencyType.toString(),
          frequencyValue,
          startedAt: Date.now(),
          id: result.hash,
          isCreatingPair: !existingPair,
          addressFor:
            to.address === PROTOCOL_TOKEN_ADDRESS || from.address === PROTOCOL_TOKEN_ADDRESS
              ? COMPANION_ADDRESS[currentNetwork.chainId]
              : HUB_ADDRESS[currentNetwork.chainId],
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error creating position', error: { code: e.code, message: e.message } });
    }
  };

  const preHandleSwap = () => {
    if (!isWhitelisted) {
      return;
    }
    if (!existingPair) {
      setShouldShowPairModal(true);
      return;
    }
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
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleSwap();
    }
  };

  const startSelectingCoin = (token: Token) => {
    setSelecting(token);
    setShouldShowPicker(true);
  };

  const handleFromValueChange = (newFromValue: string) => {
    setModeType(FULL_DEPOSIT_TYPE);
    setFromValue(newFromValue);
    setRate(
      (newFromValue &&
        parseUnits(newFromValue, from.decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(parseUnits(newFromValue, from.decimals).div(BigNumber.from(frequencyValue)), from.decimals)) ||
        '0'
    );
  };

  const handleRateValueChange = (newRate: string) => {
    setModeType(RATE_TYPE);
    setRate(newRate);
    setFromValue(
      (newRate &&
        parseUnits(newRate, from.decimals).gt(BigNumber.from(0)) &&
        frequencyValue &&
        BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
        from &&
        formatUnits(parseUnits(newRate, from.decimals).mul(BigNumber.from(frequencyValue)), from.decimals)) ||
        ''
    );
  };

  const handleFrequencyChange = (newFrequencyValue: string) => {
    setFrequencyValue(newFrequencyValue);
    if (modeType === RATE_TYPE) {
      setFromValue(
        (rate &&
          parseUnits(rate, from.decimals).gt(BigNumber.from(0)) &&
          newFrequencyValue &&
          BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(rate, from.decimals).mul(BigNumber.from(newFrequencyValue)), from.decimals)) ||
          ''
      );
    } else {
      setRate(
        (fromValue &&
          parseUnits(fromValue, from.decimals).gt(BigNumber.from(0)) &&
          newFrequencyValue &&
          BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(fromValue, from.decimals).div(BigNumber.from(newFrequencyValue)), from.decimals)) ||
          '0'
      );
    }
  };

  const POSSIBLE_ACTIONS_FUNCTIONS = {
    createPosition: preHandleSwap,
    approveToken: handleApproveToken,
  };

  const onLowLiquidityModalClose = () => {
    setShouldShowLowLiquidityModal(false);
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const checkForLowLiquidity = async (actionToDo: keyof typeof POSSIBLE_ACTIONS) => {
    // setIsLoading(true);

    // const oracleInUse = await web3Service.getPairOracle({ tokenA: from.address, tokenB: to.address }, !!existingPair);

    // let hasLowLiquidity = oracleInUse === ORACLES.UNISWAP;

    // if (oracleInUse === ORACLES.UNISWAP) {
    //   const liquidity = await web3Service.getPairLiquidity(from, to);

    //   hasLowLiquidity = liquidity <= MINIMUM_LIQUIDITY_USD;
    // }

    // setIsLoading(false);

    setCurrentAction(actionToDo);
    if (POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]();
    }
    // if (hasLowLiquidity) {
    //   setShouldShowLowLiquidityModal(true);
    // } else if (POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]) {
    //   // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //   POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]();
    // }
  };

  const closeLowLiquidityModal = () => {
    if (POSSIBLE_ACTIONS_FUNCTIONS[currentAction]) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      POSSIBLE_ACTIONS_FUNCTIONS[currentAction]();
    }
    onLowLiquidityModalClose();
  };

  const cantFund = !!fromValue && !!balance && parseUnits(fromValue, from.decimals).gt(balance);

  const isApproved = !fromValue
    ? true
    : (!isLoadingAllowance &&
        allowance &&
        allowance.allowance &&
        allowance.token.address === from.address &&
        parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
      hasConfirmedApproval ||
      from.address === PROTOCOL_TOKEN_ADDRESS;

  const shouldDisableButton =
    !isWhitelisted ||
    !fromValue ||
    !frequencyValue ||
    cantFund ||
    isLoadingBalance ||
    balanceErrors ||
    allowanceErrors ||
    !isApproved ||
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0)) ||
    BigNumber.from(frequencyValue).lte(BigNumber.from(0));

  const ignoreValues = [from.address, to.address];

  const isTestnet = TESTNETS.includes(currentNetwork.chainId);

  let shouldShowNotEnoughForWhale =
    whaleMode &&
    (WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]).includes(
      frequencyType.toString()
    ) &&
    fromValue &&
    frequencyValue &&
    !isLoadingUsdPrice &&
    usdPrice &&
    parseFloat(formatUnits(parseUnits(fromValue, from.decimals).mul(BigNumber.from(frequencyValue)), from.decimals)) *
      usdPrice <
      (WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] || Infinity);

  shouldShowNotEnoughForWhale =
    !isTestnet &&
    (shouldShowNotEnoughForWhale ||
      (whaleMode &&
        !usdPrice &&
        (WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]).includes(
          frequencyType.toString()
        )));
  const NotConnectedButton = (
    <StyledButton size="large" variant="contained" fullWidth color="error">
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

  const NotWhitelistedButton = (
    <StyledButton size="large" variant="contained" fullWidth color="primary" disabled>
      <Typography variant="body1">
        <FormattedMessage description="not whitelisted" defaultMessage="We are sorry, but you are not whitelisted" />
      </Typography>
    </StyledButton>
  );

  const ApproveTokenButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="primary"
      disabled={!!isApproved || hasPendingApproval || isLoading || !isWhitelisted}
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.approveToken as keyof typeof POSSIBLE_ACTIONS)}
      style={{ pointerEvents: 'all' }}
    >
      <Typography variant="body1">
        {hasPendingApproval ? (
          <FormattedMessage
            description="waiting for approval"
            defaultMessage="Waiting for your {token} to be approved"
            values={{
              token: from.symbol || '',
            }}
          />
        ) : (
          <FormattedMessage
            description="Allow us to use your coin"
            defaultMessage="Approve {token}"
            values={{
              token: from.symbol || '',
            }}
          />
        )}
      </Typography>
      <Tooltip title="You only have to do this once per token" arrow placement="top">
        <StyledHelpOutlineIcon fontSize="small" />
      </Tooltip>
    </StyledButton>
  );

  const StartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableButton || isLoading || isLoadingPairIsSupported || !!shouldShowNotEnoughForWhale}
      color="secondary"
      fullWidth
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.createPosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoading && !isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && (
        <Typography variant="body1">
          <FormattedMessage description="create position" defaultMessage="Create position" />
        </Typography>
      )}
      {!isLoading && !isLoadingPairIsSupported && !isLoadingUsdPrice && shouldShowNotEnoughForWhale && (
        <Typography variant="body1">
          <FormattedMessage
            description="notenoughwhale"
            defaultMessage="You can only deposit with a minimum value of {value} USD"
            values={{ value: WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] }}
          />
        </Typography>
      )}
      {(isLoading || isLoadingPairIsSupported || isLoadingUsdPrice) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const CreatingPairButton = (
    <StyledButton size="large" variant="contained" disabled color="secondary" fullWidth>
      <Typography variant="body1">
        <FormattedMessage description="creating pair" defaultMessage="Creating this pair" />
      </Typography>
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
  } else if (!isWhitelisted) {
    ButtonToShow = NotWhitelistedButton;
  } else if (isLoading || isLoadingPairIsSupported) {
    ButtonToShow = LoadingButton;
  } else if (!pairIsSupported && !isLoadingPairIsSupported) {
    ButtonToShow = PairNotSupportedButton;
  } else if (!isApproved) {
    ButtonToShow = ApproveTokenButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (isCreatingPair) {
    ButtonToShow = CreatingPairButton;
  } else {
    ButtonToShow = StartPositionButton;
  }

  const filteredFrequencies = whaleMode
    ? availableFrequencies
    : availableFrequencies.filter(
        (frequency) =>
          !(
            WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]
          ).includes(frequency.value.toString())
      );

  return (
    <StyledPaper elevation={3}>
      <CreatePairModal
        open={shouldShowPairModal}
        onCancel={() => setShouldShowPairModal(false)}
        web3Service={web3Service}
        from={from}
        to={to}
        amountOfSwaps={frequencyValue}
        swapInterval={frequencyType}
        toDeposit={fromValue}
        onCreatePair={handleSwap}
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
        onChange={selecting.address === from.address ? setFrom : setTo}
        usedTokens={usedTokens}
        ignoreValues={ignoreValues}
      />
      <StyledSwapContainer>
        <Grid container>
          <StyledFromContainer container alignItems="center" justify="space-between">
            {/* <Grid item xs={12}>
              <StyledWhaleModeContainer>
                <FormControlLabel
                  style={{ margin: 0 }}
                  control={<Switch checked={whaleMode} color="primary" onChange={toggleWhaleMode} />}
                  label="Whale mode"
                />
                <Tooltip
                  title="This mode will allow you to create positions with shorter frequencies, but you will have to deposit more funds"
                  arrow
                  placement="top"
                >
                  <StyledHelpOutlineIcon fontSize="small" />
                </Tooltip>
              </StyledWhaleModeContainer>
            </Grid> */}
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
                onChange={handleFromValueChange}
                withBalance={!isLoadingBalance}
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
                  onChange={handleRateValueChange}
                  withBalance={false}
                  token={from}
                  isMinimal
                />
                <Typography variant="body1" component="span">
                  <FormattedMessage
                    description="rate detail"
                    defaultMessage="{from} {frequency} for you"
                    values={{
                      from: from.symbol,
                      frequency:
                        STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].every,
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
                  options={filteredFrequencies}
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
                      values={{ type: STRING_SWAP_INTERVALS[frequencyType.toString()].subject }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} />
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
