import React from 'react';
import { parseUnits, formatUnits } from '@ethersproject/units';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/token-picker';
import TokenButton from 'common/token-button';
import TokenInput from 'common/token-input';
import FrequencyInput from 'common/frequency-easy-input';
import FrequencyTypeInput from 'common/frequency-type-input';
import Button from 'common/button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
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
  STRING_SWAP_INTERVALS,
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

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
`;

const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 24px;
  border-radius: 8px;
`;

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledButton = styled(Button)`
  padding: 10px 18px;
  border-radius: 12px;
  margin-top: 16px;
`;

const StyledTokensContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const StyledTokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0;
  gap: 5px;
`;

const StyledToggleContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const StyledToggleTokenButton = styled(IconButton)`
  border: 4px solid #1b1821;
  background-color: #292929;
  :hover {
    background-color: #484848;
  }
`;

const StyledRateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledFrequencyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledFrequencyTypeContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const StyledFrequencyValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledSummaryContainer = styled.div``;

const StyledInputContainer = styled.div`
  margin: 5px 6px;
  display: inline-flex;
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
  availableFrequencies,
}: SwapProps) => {
  const web3Service = useWeb3Service();
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

  const hasPendingApproval = useHasPendingApproval(from, web3Service.getAccount());

  const [allowance, , allowanceErrors] = useAllowance(from);

  const [pairIsSupported, isLoadingPairIsSupported] = useCanSupportPair(from, to);

  const [usdPrice, isLoadingUsdPrice] = useUsdPrice(
    from,
    (fromValue !== '' && parseUnits(fromValue, from?.decimals)) || null
  );

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
      const result = await walletService.approveToken(from);
      const hubAddress = await contractService.getHUBAddress();
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
      const result = await positionService.deposit(from, to, fromValue, frequencyType, frequencyValue);
      const hubAddress = await contractService.getHUBAddress();
      const companionAddress = await contractService.getHUBCompanionAddress();

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
        : (allowance?.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  const shouldDisableButton =
    !from ||
    !to ||
    !fromValue ||
    !frequencyValue ||
    cantFund ||
    !balance ||
    balanceErrors ||
    allowanceErrors ||
    !isApproved ||
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0)) ||
    BigNumber.from(frequencyValue).lte(BigNumber.from(0));

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
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to) {
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
    <StyledPaper variant="outlined">
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
      <Grid container rowSpacing={2}>
        <Grid item xs={12}>
          <StyledContentContainer>
            <StyledTokensContainer>
              <StyledTokenContainer>
                <Typography variant="body1">
                  <FormattedMessage description="sell" defaultMessage="Sell" />
                </Typography>
                <TokenButton token={from} onClick={() => startSelectingCoin(from || emptyTokenWithAddress('from'))} />
              </StyledTokenContainer>
              <StyledToggleContainer>
                <StyledToggleTokenButton onClick={() => toggleFromTo()}>
                  <SwapHorizIcon />
                </StyledToggleTokenButton>
              </StyledToggleContainer>
              <StyledTokenContainer>
                <Typography variant="body1">
                  <FormattedMessage description="receive" defaultMessage="Receive" />
                </Typography>
                <TokenButton token={to} onClick={() => startSelectingCoin(to || emptyTokenWithAddress('to'))} />
              </StyledTokenContainer>
            </StyledTokensContainer>
          </StyledContentContainer>
        </Grid>
        <Grid item xs={12}>
          <StyledContentContainer>
            {/* rate */}
            <StyledRateContainer>
              <Typography variant="body1">
                <FormattedMessage
                  description="howMuchToSell"
                  defaultMessage="How much {from} do you want to invest?"
                  values={{ from: from?.symbol || '' }}
                />
              </Typography>
              <TokenInput
                id="from-value"
                error={cantFund ? 'Amount cannot exceed balance' : ''}
                value={fromValue}
                onChange={handleFromValueChange}
                withBalance={!!balance}
                balance={balance}
                token={from}
                withMax
                withHalf
                fullWidth
              />
            </StyledRateContainer>
          </StyledContentContainer>
        </Grid>
        <Grid item xs={12}>
          <StyledContentContainer>
            <StyledFrequencyContainer>
              <StyledFrequencyTypeContainer>
                <Typography variant="body1">
                  <FormattedMessage description="executes" defaultMessage="Executes" />
                </Typography>
                <FrequencyTypeInput
                  options={filteredFrequencies}
                  selected={frequencyType}
                  onChange={setFrequencyType}
                />
              </StyledFrequencyTypeContainer>
              <StyledFrequencyValueContainer>
                <Typography variant="body1">
                  <FormattedMessage
                    description="howManyFreq"
                    defaultMessage="How many {type}?"
                    values={{
                      type: STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS]
                        .subject,
                    }}
                  />
                </Typography>
                <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} />
              </StyledFrequencyValueContainer>
            </StyledFrequencyContainer>
          </StyledContentContainer>
        </Grid>
        <Grid item xs={12}>
          <StyledContentContainer>
            <StyledSummaryContainer>
              <Typography variant="body1" component="span">
                <FormattedMessage description="rate detail" defaultMessage="We'll swap" />
              </Typography>
              <StyledInputContainer>
                <TokenInput
                  id="rate-value"
                  value={rate}
                  onChange={handleRateValueChange}
                  withBalance={false}
                  token={from}
                  isMinimal
                />
              </StyledInputContainer>
              <Typography variant="body1" component="span">
                <FormattedMessage
                  description="rate detail"
                  defaultMessage="{frequency} for you for"
                  values={{
                    frequency:
                      STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].every,
                  }}
                />
              </Typography>
              <StyledInputContainer>
                <FrequencyInput
                  id="frequency-value"
                  value={frequencyValue}
                  onChange={handleFrequencyChange}
                  isMinimal
                />
              </StyledInputContainer>
              {STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject}
            </StyledSummaryContainer>
            {ButtonToShow}
          </StyledContentContainer>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Swap;
