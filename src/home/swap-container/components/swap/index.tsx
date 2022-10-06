import React from 'react';
import { parseUnits, formatUnits } from '@ethersproject/units';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import isUndefined from 'lodash/isUndefined';
import { Token, YieldOption, YieldOptions } from 'types';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/token-picker';
import Button from 'common/button';
import Tooltip from '@mui/material/Tooltip';
import find from 'lodash/find';
import useBalance from 'hooks/useBalance';
import useUsedTokens from 'hooks/useUsedTokens';
import CreatePairModal from 'common/create-pair-modal';
import StalePairModal from 'common/stale-pair-modal';
import LowLiquidityModal from 'common/low-liquidity-modal';
import {
  FULL_DEPOSIT_TYPE,
  MINIMUM_LIQUIDITY_USD,
  MODE_TYPES,
  POSSIBLE_ACTIONS,
  RATE_TYPE,
  SUPPORTED_NETWORKS,
  TRANSACTION_TYPES,
  ORACLES,
  WHALE_MODE_FREQUENCIES,
  WHALE_MINIMUM_VALUES,
  TESTNETS,
  NETWORKS,
  MAX_UINT_32,
  LATEST_VERSION,
  ONE_WEEK,
} from 'config/constants';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import useTransactionModal from 'hooks/useTransactionModal';
import { emptyTokenWithAddress } from 'utils/currency';
import { useTransactionAdder, useHasPendingApproval, useHasPendingPairCreation } from 'state/transactions/hooks';
import { calculateStale, STALE } from 'utils/parsing';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { BigNumber } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import useAllowance from 'hooks/useAllowance';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import useCanSupportPair from 'hooks/useCanSupportPair';
import useUsdPrice from 'hooks/useUsdPrice';
import useWalletService from 'hooks/useWalletService';
import useContractService from 'hooks/useContractService';
import usePositionService from 'hooks/usePositionService';
import usePairService from 'hooks/usePairService';
import useWeb3Service from 'hooks/useWeb3Service';
import SwapFirstStep from '../step1';
import SwapSecondStep from '../step2';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
`;

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledButton = styled(Button)`
  padding: 10px 18px;
  border-radius: 12px;
`;

interface AvailableSwapInterval {
  label: {
    singular: string;
    adverb: string;
  };
  value: BigNumber;
}

interface SwapProps {
  from: Token | null;
  fromValue: string;
  to: Token | null;
  frequencyType: BigNumber;
  frequencyValue: string;
  setFrom: (from: Token) => void;
  setTo: (to: Token) => void;
  toggleFromTo: () => void;
  setFromValue: (newFromValue: string) => void;
  setFrequencyType: (newFrequencyType: BigNumber) => void;
  setFrequencyValue: (newFrequencyValue: string) => void;
  setYieldEnabled: (newYieldEnabled: boolean) => void;
  currentNetwork: { chainId: number; name: string };
  availableFrequencies: AvailableSwapInterval[];
  yieldEnabled: boolean;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  fromYield: YieldOption | null | undefined;
  toYield: YieldOption | null | undefined;
  setFromYield: (newYield?: null | YieldOption) => void;
  setToYield: (newYield?: null | YieldOption) => void;
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
  availableFrequencies,
  yieldEnabled,
  setYieldEnabled,
  yieldOptions,
  isLoadingYieldOptions,
  fromYield,
  toYield,
  setFromYield,
  setToYield,
}: SwapProps) => {
  const web3Service = useWeb3Service();
  const containerRef = React.useRef(null);
  const [createStep, setCreateStep] = React.useState<0 | 1>(0);
  const [showFirstStep, setShowFirstStep] = React.useState(false);
  const [showSecondStep, setShowSecondStep] = React.useState(false);
  const [isRender, setIsRender] = React.useState(true);
  const [modeType, setModeType] = React.useState(MODE_TYPES.FULL_DEPOSIT.id);
  const [rate, setRate] = React.useState('0');
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [shouldShowPairModal, setShouldShowPairModal] = React.useState(false);
  const [shouldShowStalePairModal, setShouldShowStalePairModal] = React.useState(false);
  const [shouldShowLowLiquidityModal, setShouldShowLowLiquidityModal] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState<keyof typeof POSSIBLE_ACTIONS>('createPosition');
  const [isLoading, setIsLoading] = React.useState(false);
  const [whaleMode, setWhaleMode] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const positionService = usePositionService();
  const contractService = useContractService();
  const availablePairs = useAvailablePairs();
  const pairService = usePairService();
  const [balance, , balanceErrors] = useBalance(from);
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();

  const [usedTokens] = useUsedTokens();

  const existingPair = React.useMemo(() => {
    if (!from || !to) return undefined;
    let tokenA = fromYield?.tokenAddress || from.address;
    let tokenB = toYield?.tokenAddress || to.address;

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
  }, [from, to, availablePairs, (availablePairs && availablePairs.length) || 0, fromYield, toYield]);
  const isCreatingPair = useHasPendingPairCreation(from, to);

  const hasPendingApproval = useHasPendingApproval(from, web3Service.getAccount(), !!fromYield?.tokenAddress);

  const [allowance, , allowanceErrors] = useAllowance(from, !!fromYield?.tokenAddress);

  const [pairIsSupported, isLoadingPairIsSupported] = useCanSupportPair(from, to);

  const [usdPrice, isLoadingUsdPrice] = useUsdPrice(
    from,
    (fromValue !== '' && parseUnits(fromValue, from?.decimals)) || null
  );

  const fromCanHaveYield = !!(
    from && yieldOptions.filter((yieldOption) => yieldOption.enabledTokens.includes(from.address)).length
  );
  const toCanHaveYield = !!(
    to && yieldOptions.filter((yieldOption) => yieldOption.enabledTokens.includes(to.address)).length
  );

  const isAtLeastAWeek = !!frequencyValue && BigNumber.from(frequencyValue).mul(frequencyType).gte(ONE_WEEK);
  const hasEnoughUsdForYield = !!usdPrice && usdPrice >= 10;

  // only allowed if set for 10 days and at least 10 USD
  const shouldEnableYield = yieldEnabled && (fromCanHaveYield || toCanHaveYield);
  // isAtLeastAWeek &&
  // hasEnoughUsdForYield;

  React.useEffect(() => {
    if (!from) return;
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
    if (!from || !to) return;
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
      const result = await walletService.approveToken(from, !!(shouldEnableYield && fromYield?.tokenAddress));
      const hubAddress =
        shouldEnableYield && fromYield?.tokenAddress
          ? await contractService.getHUBCompanionAddress()
          : await contractService.getHUBAddress();
      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: from,
          addressFor: hubAddress,
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
      setModalError({ content: 'Error approving token', error: { code: e.code, message: e.message, data: e.data } });
    }
  };

  const handleSwap = async () => {
    if (!from || !to) return;
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
      const result = await positionService.deposit(
        from,
        to,
        fromValue,
        frequencyType,
        frequencyValue,
        shouldEnableYield ? fromYield?.tokenAddress : undefined,
        shouldEnableYield ? toYield?.tokenAddress : undefined
      );
      const hubAddress = await contractService.getHUBAddress();
      const companionAddress = await contractService.getHUBCompanionAddress();

      addTransaction(result, {
        type: TRANSACTION_TYPES.NEW_POSITION,
        typeData: {
          from,
          to,
          fromYield: shouldEnableYield ? fromYield?.tokenAddress : undefined,
          toYield: shouldEnableYield ? toYield?.tokenAddress : undefined,
          fromValue,
          frequencyType: frequencyType.toString(),
          frequencyValue,
          startedAt: Date.now(),
          id: result.hash,
          isCreatingPair: !existingPair,
          version: LATEST_VERSION,
          addressFor:
            to.address === PROTOCOL_TOKEN_ADDRESS || from.address === PROTOCOL_TOKEN_ADDRESS
              ? companionAddress
              : hubAddress,
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
      setToYield(undefined);
      setFromYield(undefined);
      setCreateStep(0);
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error creating position', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const preHandleApprove = () => {
    if (!existingPair) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleApproveToken();
      return;
    }

    const isStale =
      calculateStale(
        existingPair?.lastExecutedAt || 0,
        frequencyType,
        existingPair?.lastCreatedAt || 0,
        existingPair?.swapInfo || null
      ) === STALE;

    if (isStale) {
      setShouldShowStalePairModal(true);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleApproveToken();
    }
  };

  const preHandleSwap = () => {
    if (!existingPair) {
      setShouldShowPairModal(true);
      return;
    }
    const isStale =
      calculateStale(
        existingPair?.lastExecutedAt || 0,
        frequencyType,
        existingPair?.lastCreatedAt || 0,
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
    if (!from) return;
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
    if (!from) return;
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
    if (!from) return;
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

  const onLowLiquidityModalClose = () => {
    setShouldShowLowLiquidityModal(false);
  };

  const POSSIBLE_ACTIONS_FUNCTIONS = {
    createPosition: handleSwap,
    approveToken: handleApproveToken,
  };

  const PRE_POSSIBLE_ACTIONS_FUNCTIONS = {
    createPosition: preHandleSwap,
    approveToken: preHandleApprove,
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const checkForLowLiquidity = async (actionToDo: keyof typeof POSSIBLE_ACTIONS) => {
    setIsLoading(true);
    if (!from || !to) return;

    const oracle = await pairService.getPairOracle({ tokenA: from.address, tokenB: to.address }, !!existingPair);

    let hasLowLiquidity = oracle === ORACLES.UNISWAP;

    if (oracle === ORACLES.UNISWAP) {
      try {
        const liquidity = await pairService.getPairLiquidity(from, to);
        hasLowLiquidity = liquidity <= MINIMUM_LIQUIDITY_USD;
      } catch {
        hasLowLiquidity = false;
      }
    }

    setIsLoading(false);

    setCurrentAction(actionToDo);
    if (hasLowLiquidity) {
      setShouldShowLowLiquidityModal(true);
    } else if (PRE_POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      PRE_POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]();
    }
  };

  const closeLowLiquidityModal = () => {
    if (PRE_POSSIBLE_ACTIONS_FUNCTIONS[currentAction]) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      PRE_POSSIBLE_ACTIONS_FUNCTIONS[currentAction]();
    }
    onLowLiquidityModalClose();
  };

  const cantFund = from && !!fromValue && !!balance && parseUnits(fromValue, from.decimals).gt(balance);

  const isApproved =
    !from ||
    (from &&
      (!fromValue
        ? true
        : (allowance &&
            allowance.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValue ||
    !frequencyValue ||
    cantFund ||
    balanceErrors ||
    allowanceErrors ||
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0)) ||
    BigNumber.from(frequencyValue).lte(BigNumber.from(0)) ||
    (shouldEnableYield && fromCanHaveYield && isUndefined(fromYield)) ||
    (shouldEnableYield && toCanHaveYield && isUndefined(toYield));

  const shouldDisableButton = shouldDisableApproveButton || !isApproved;

  const ignoreValues = [...(from ? [from.address] : []), ...(to ? [to.address] : [])];

  const isTestnet = TESTNETS.includes(currentNetwork.chainId);

  let shouldShowNotEnoughForWhale =
    from &&
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

  const IncorrectNetworkButton = (
    <StyledButton size="large" color="primary" variant="contained" disabled fullWidth>
      <Typography variant="body1">
        <FormattedMessage
          description="incorrect network"
          defaultMessage="Change network to {network}"
          values={{ network: currentNetwork.name }}
        />
      </Typography>
    </StyledButton>
  );

  const ApproveTokenButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="primary"
      disabled={!!isApproved || hasPendingApproval || isLoading || !!shouldDisableApproveButton}
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.approveToken as keyof typeof POSSIBLE_ACTIONS)}
      style={{ pointerEvents: 'all' }}
    >
      <Typography variant="body1">
        {hasPendingApproval ? (
          <FormattedMessage
            description="waiting for approval"
            defaultMessage="Waiting for your {token} to be approved"
            values={{
              token: (from && from.symbol) || '',
            }}
          />
        ) : (
          <FormattedMessage
            description="Allow us to use your coin"
            defaultMessage="Approve {token}"
            values={{
              token: (from && from.symbol) || '',
            }}
          />
        )}
      </Typography>
      <Tooltip title="You only have to do this once per token" arrow placement="top">
        <StyledHelpOutlineIcon fontSize="small" />
      </Tooltip>
    </StyledButton>
  );

  const swapsIsMax = BigNumber.from(frequencyValue || '0').gt(BigNumber.from(MAX_UINT_32));
  const StartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={
        !!shouldDisableButton || isLoading || isLoadingPairIsSupported || !!shouldShowNotEnoughForWhale || swapsIsMax
      }
      color="secondary"
      fullWidth
      onClick={() => checkForLowLiquidity(POSSIBLE_ACTIONS.createPosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoading && !isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage
            description="swapsCannotBeMax"
            defaultMessage="Amount of swaps cannot be higher than {MAX_UINT_32}"
            values={{ MAX_UINT_32 }}
          />
        </Typography>
      )}
      {!isLoading && !isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && !swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage description="create position" defaultMessage="Create position" />
        </Typography>
      )}
      {!isLoading && !isLoadingPairIsSupported && !isLoadingUsdPrice && shouldShowNotEnoughForWhale && !swapsIsMax && (
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

  const handleSetStep = (step: 0 | 1) => {
    if (isRender) {
      setIsRender(false);
    }

    setCreateStep(step);
  };

  const NextStepButton = (
    <StyledButton
      size="large"
      disabled={!from || !to || !fromValue || fromValue === '0' || !frequencyValue || frequencyValue === '0'}
      color="secondary"
      variant="contained"
      fullWidth
      onClick={() => handleSetStep(1)}
    >
      <Typography variant="body1">
        <FormattedMessage description="continue" defaultMessage="Continue" />
      </Typography>
    </StyledButton>
  );

  let ButtonToShow;

  if (!web3Service.getAccount()) {
    ButtonToShow = NoWalletButton;
  } else if (!SUPPORTED_NETWORKS.includes(currentNetwork.chainId)) {
    ButtonToShow = NotConnectedButton;
  } else if (isLoading || isLoadingPairIsSupported) {
    ButtonToShow = LoadingButton;
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (!pairIsSupported && !isLoadingPairIsSupported && from && to) {
    ButtonToShow = PairNotSupportedButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (!createStep) {
    ButtonToShow = NextStepButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to) {
    ButtonToShow = ApproveTokenButton;
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
    <StyledPaper variant="outlined" ref={containerRef}>
      <CreatePairModal
        open={shouldShowPairModal}
        onCancel={() => setShouldShowPairModal(false)}
        from={from}
        to={to}
        onCreatePair={handleSwap}
      />
      <StalePairModal
        open={shouldShowStalePairModal}
        onConfirm={() => POSSIBLE_ACTIONS_FUNCTIONS[currentAction]()}
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
        onChange={(from && selecting.address === from.address) || selecting.address === 'from' ? setFrom : setTo}
        usedTokens={usedTokens}
        ignoreValues={ignoreValues}
      />
      <Slide
        direction="right"
        appear
        in={createStep === 0}
        container={containerRef.current}
        onEntered={() => setShowFirstStep(true)}
        onExit={() => {
          setShowSecondStep(true);
          setShowFirstStep(false);
        }}
        mountOnEnter
        unmountOnExit
        timeout={isRender ? 0 : 500}
        easing="ease-out"
      >
        <SwapFirstStep
          from={from}
          to={to}
          fromValue={fromValue}
          toggleFromTo={toggleFromTo}
          setFrequencyType={setFrequencyType}
          frequencyType={frequencyType}
          frequencyValue={frequencyValue}
          startSelectingCoin={startSelectingCoin}
          cantFund={cantFund}
          handleFromValueChange={handleFromValueChange}
          balance={balance}
          frequencies={filteredFrequencies}
          handleFrequencyChange={handleFrequencyChange}
          buttonToShow={ButtonToShow}
          show={showFirstStep}
        />
      </Slide>
      <Slide
        direction="left"
        in={createStep === 1}
        container={containerRef.current}
        onEntered={() => setShowSecondStep(true)}
        onExited={() => setShowSecondStep(false)}
        mountOnEnter
        unmountOnExit
        timeout={500}
        easing="ease-out"
      >
        <SwapSecondStep
          show={showSecondStep}
          onBack={() => setCreateStep(0)}
          from={from}
          to={to}
          rate={rate}
          usdPrice={usdPrice}
          handleRateValueChange={handleRateValueChange}
          handleFromValueChange={handleFromValueChange}
          frequencyType={frequencyType}
          frequencyValue={frequencyValue}
          fromValue={fromValue}
          handleFrequencyChange={handleFrequencyChange}
          buttonToShow={ButtonToShow}
          yieldEnabled={shouldEnableYield}
          setYieldEnabled={setYieldEnabled}
          fromCanHaveYield={fromCanHaveYield}
          yieldOptions={yieldOptions}
          isLoadingYieldOptions={isLoadingYieldOptions}
          fromYield={fromYield}
          toYield={toYield}
          setFromYield={setFromYield}
          setToYield={setToYield}
        />
      </Slide>
    </StyledPaper>
  );
};
export default Swap;
