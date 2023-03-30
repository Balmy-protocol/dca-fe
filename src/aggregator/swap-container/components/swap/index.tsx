import React from 'react';
import { formatUnits, parseUnits } from '@ethersproject/units';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import find from 'lodash/find';
import { BlowfishResponse, NetworkStruct, SwapOption, SwapOptionWithTx, Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/aggregator-token-picker';
import findIndex from 'lodash/findIndex';
import Button from 'common/button';
import useBalance from 'hooks/useBalance';
import useUsedTokens from 'hooks/useUsedTokens';
import {
  BLOWFISH_ENABLED_CHAINS,
  NETWORKS,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
  TRANSACTION_TYPES,
} from 'config/constants';
import useTransactionModal from 'hooks/useTransactionModal';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import { useTransactionAdder } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useWalletService from 'hooks/useWalletService';
import useWeb3Service from 'hooks/useWeb3Service';
import useAggregatorService from 'hooks/useAggregatorService';
import useSpecificAllowance from 'hooks/useSpecificAllowance';
import TransferToModal from 'common/transfer-to-modal';
import TransactionConfirmation from 'common/transaction-confirmation';
import TransactionSteps, { TransactionAction as TransactionStep } from 'common/transaction-steps';
import { GasKeys } from 'config/constants/aggregator';
import { useAppDispatch } from 'state/hooks';
import useSimulationService from 'hooks/useSimulationService';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { setAggregatorChainId } from 'state/aggregator/actions';
import useMeanApiService from 'hooks/useMeanApiService';
import { shouldTrackError } from 'utils/errors';
import useErrorService from 'hooks/useErrorService';
import useReplaceHistory from 'hooks/useReplaceHistory';
import { setNetwork } from 'state/config/actions';
import { addCustomToken } from 'state/token-lists/actions';
import useLoadedAsSafeApp from 'hooks/useLoadedAsSafeApp';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TransactionResponse } from '@ethersproject/providers';
import SwapFirstStep from '../step1';
import SwapSettings from '../swap-settings';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
`;

const StyledButton = styled(Button)`
  padding: 10px 18px;
  border-radius: 12px;
`;

interface SwapProps {
  from: Token | null;
  fromValue: string;
  isBuyOrder: boolean;
  toValue: string;
  to: Token | null;
  setFrom: (from: Token) => void;
  setTo: (to: Token) => void;
  setFromValue: (newFromValue: string, updateMode?: boolean) => void;
  setToValue: (newToValue: string, updateMode?: boolean) => void;
  currentNetwork: { chainId: number; name: string };
  selectedRoute: SwapOption | null;
  isLoadingRoute: boolean;
  onResetForm: () => void;
  toggleFromTo: () => void;
  transferTo: string | null;
  slippage: string;
  gasSpeed: GasKeys;
  disabledDexes: string[];
  setRefreshQuotes: (refreshQuotes: boolean) => void;
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
  isBuyOrder,
  selectedRoute,
  currentNetwork,
  isLoadingRoute,
  onResetForm,
  transferTo,
  slippage,
  gasSpeed,
  disabledDexes,
  setRefreshQuotes,
  toggleFromTo,
}: SwapProps) => {
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();
  const containerRef = React.useRef(null);
  const meanApiService = useMeanApiService();
  const { openConnectModal } = useConnectModal();
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const errorService = useErrorService();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const aggregatorService = useAggregatorService();
  const [balance, , balanceErrors] = useBalance(from);
  const [usedTokens] = useUsedTokens();
  const [shouldShowTransferModal, setShouldShowTransferModal] = React.useState(false);
  const [transactionWillFail, setTransactionWillFail] = React.useState(false);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const simulationService = useSimulationService();
  const replaceHistory = useReplaceHistory();
  const actualCurrentNetwork = useCurrentNetwork();
  const loadedAsSafeApp = useLoadedAsSafeApp();

  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const [allowance, , allowanceErrors] = useSpecificAllowance(from, selectedRoute?.swapper.allowanceTarget);

  const handleChangeNetwork = (chainId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetworkAutomatically(chainId, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
      if (networkToSet) {
        web3Service.setNetwork(networkToSet?.chainId);
      }
    });
    dispatch(setAggregatorChainId(chainId));
    replaceHistory(`/swap/${chainId}`);
  };

  const onChangeNetwork = (chainId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, () => {
      const networkToSet = find(NETWORKS, { chainId });
      replaceHistory(`/swap/${chainId}`);
      dispatch(setNetwork(networkToSet as NetworkStruct));
      if (networkToSet) {
        web3Service.setNetwork(networkToSet?.chainId);
      }
    });
  };

  const fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0'
      : fromValue;

  const toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute?.buyAmount.amount || '0', selectedRoute?.buyToken.decimals)) ||
      '0' ||
      '';

  const handleApproveToken = async (transactions?: TransactionStep[], amount?: BigNumber) => {
    if (!from || !to || !selectedRoute) return;
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
      const result = await walletService.approveSpecificToken(from, selectedRoute.swapper.allowanceTarget, amount);

      addTransaction(result, {
        type: amount ? TRANSACTION_TYPES.APPROVE_TOKEN_EXACT : TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: from,
          addressFor: selectedRoute.swapper.allowanceTarget,
          ...(!!amount && { amount: amount.toString() }),
        },
      });

      setModalClosed({ content: '' });

      if (transactions?.length) {
        const newSteps = [...transactions];

        const approveIndex = findIndex(transactions, { type: TRANSACTION_ACTION_APPROVE_TOKEN });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            done: true,
            hash: result.hash,
          };

          const waitIndex = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL });
          if (waitIndex !== -1) {
            newSteps[waitIndex] = {
              ...newSteps[waitIndex],
              hash: result.hash,
            };
          }
        }

        setTransactionsToExecute(newSteps);
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error approving token', error: { code: e.code, message: e.message, data: e.data } });
    }
  };

  const handleSwap = async (transactions?: TransactionStep[]) => {
    if (!from || !to || !selectedRoute || !selectedRoute.tx) return;
    const fromSymbol = from.symbol;
    const toSymbol = to.symbol;
    const fromAmount = formatCurrencyAmount(selectedRoute.sellAmount.amount, from, 4, 6);
    const toAmount = formatCurrencyAmount(selectedRoute.buyAmount.amount, to, 4, 6);
    try {
      const isWrap = from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address;
      const isUnwrap = from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS;
      setRefreshQuotes(false);

      setModalLoading({
        content: (
          <Typography variant="body1">
            {isWrap && <FormattedMessage description="wrap agg loading" defaultMessage="Wrapping" />}
            {isUnwrap && <FormattedMessage description="unwrap agg loading" defaultMessage="Unwrapping" />}
            {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
              (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
              <FormattedMessage description="swap agg loading" defaultMessage="Swapping" />
            )}
            {` `}
            <FormattedMessage
              description="swap aggregator loading title"
              defaultMessage="{fromAmount} {from} for {toAmount} {to} for you"
              values={{ from: fromSymbol, to: toSymbol, fromAmount, toAmount }}
            />
          </Typography>
        ),
      });

      let balanceBefore: BigNumber | null = null;

      if (from.address === PROTOCOL_TOKEN_ADDRESS || to.address === PROTOCOL_TOKEN_ADDRESS) {
        balanceBefore = await walletService.getBalance(PROTOCOL_TOKEN_ADDRESS);
      }

      const result = await aggregatorService.swap(selectedRoute as SwapOptionWithTx);

      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        meanApiService.trackEvent('Swap on aggregator', {
          swapper: selectedRoute.swapper.id,
          chainId: currentNetwork.chainId,
          chainName: currentNetwork.name,
          from: selectedRoute.sellToken.address,
          fromSymbol: selectedRoute.sellToken.symbol,
          to: selectedRoute.buyToken.address,
          toSymbol: selectedRoute.buyToken.symbol,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          buyAmountUsd: selectedRoute.buyAmount.amountInUSD,
          sellAmountUsd: selectedRoute.sellAmount.amountInUSD,
          type: selectedRoute.type,
        });
      } catch (e) {
        console.error('Error tracking through mixpanel', e);
      }

      let transactionType = TRANSACTION_TYPES.SWAP;

      if (isWrap) {
        transactionType = TRANSACTION_TYPES.WRAP;
      } else if (isUnwrap) {
        transactionType = TRANSACTION_TYPES.UNWRAP;
      }

      addTransaction(result, {
        type: transactionType,
        typeData: {
          from: fromSymbol,
          to: toSymbol,
          amountFrom: fromAmount,
          amountTo: toAmount,
          balanceBefore: (balanceBefore && balanceBefore?.toString()) || null,
          transferTo,
        },
      });

      setModalClosed({ content: '' });
      setCurrentTransaction(result.hash);
      setShouldShowConfirmation(true);
      setShouldShowSteps(false);

      if (transactions?.length) {
        const newSteps = [...transactions];

        const index = findIndex(transactions, { type: TRANSACTION_ACTION_SWAP });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.hash,
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      setRefreshQuotes(true);

      onResetForm();
    } catch (e) {
      if (shouldTrackError(e)) {
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error swapping', JSON.stringify(e), {
          swapper: selectedRoute.swapper.id,
          chainId: currentNetwork.chainId,
          from: selectedRoute.sellToken.address,
          to: selectedRoute.buyToken.address,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          type: selectedRoute.type,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
    }
  };

  const handleSafeApproveAndSwap = async (transactions?: TransactionStep[]) => {
    if (!from || !to || !selectedRoute || !selectedRoute.tx || !loadedAsSafeApp) return;
    const fromSymbol = from.symbol;
    const toSymbol = to.symbol;
    const fromAmount = formatCurrencyAmount(selectedRoute.sellAmount.amount, from, 4, 6);
    const toAmount = formatCurrencyAmount(selectedRoute.buyAmount.amount, to, 4, 6);
    try {
      const isWrap = from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address;
      const isUnwrap = from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS;
      setRefreshQuotes(false);

      setModalLoading({
        content: (
          <Typography variant="body1">
            {isWrap && <FormattedMessage description="wrap agg loading" defaultMessage="Wrapping" />}
            {isUnwrap && <FormattedMessage description="unwrap agg loading" defaultMessage="Unwrapping" />}
            {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
              (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
              <FormattedMessage description="swap agg loading" defaultMessage="Swapping" />
            )}
            {` `}
            <FormattedMessage
              description="swap aggregator loading title"
              defaultMessage="{fromAmount} {from} for {toAmount} {to} for you"
              values={{ from: fromSymbol, to: toSymbol, fromAmount, toAmount }}
            />
          </Typography>
        ),
      });

      let balanceBefore: BigNumber | null = null;

      if (from.address === PROTOCOL_TOKEN_ADDRESS || to.address === PROTOCOL_TOKEN_ADDRESS) {
        balanceBefore = await walletService.getBalance(PROTOCOL_TOKEN_ADDRESS);
      }

      const result = await aggregatorService.approveAndSwapSafe(selectedRoute as SwapOptionWithTx);

      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        meanApiService.trackEvent('Swap on aggregator', {
          swapper: selectedRoute.swapper.id,
          chainId: currentNetwork.chainId,
          chainName: currentNetwork.name,
          from: selectedRoute.sellToken.address,
          fromSymbol: selectedRoute.sellToken.symbol,
          to: selectedRoute.buyToken.address,
          toSymbol: selectedRoute.buyToken.symbol,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          buyAmountUsd: selectedRoute.buyAmount.amountInUSD,
          sellAmountUsd: selectedRoute.sellAmount.amountInUSD,
          type: selectedRoute.type,
        });
      } catch (e) {
        console.error('Error tracking through mixpanel', e);
      }

      let transactionType = TRANSACTION_TYPES.SWAP;

      if (isWrap) {
        transactionType = TRANSACTION_TYPES.WRAP;
      } else if (isUnwrap) {
        transactionType = TRANSACTION_TYPES.UNWRAP;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.hash = result.safeTxHash;

      addTransaction(result as unknown as TransactionResponse, {
        type: transactionType,
        typeData: {
          from: fromSymbol,
          to: toSymbol,
          amountFrom: fromAmount,
          amountTo: toAmount,
          balanceBefore: (balanceBefore && balanceBefore?.toString()) || null,
          transferTo,
        },
      });

      setModalClosed({ content: '' });
      setCurrentTransaction(result.safeTxHash);
      setShouldShowConfirmation(true);
      setShouldShowSteps(false);

      if (transactions?.length) {
        const newSteps = [...transactions];

        const index = findIndex(transactions, { type: TRANSACTION_ACTION_SWAP });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.safeTxHash,
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      setRefreshQuotes(true);

      onResetForm();
    } catch (e) {
      if (shouldTrackError(e)) {
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error swapping', JSON.stringify(e), {
          swapper: selectedRoute.swapper.id,
          chainId: currentNetwork.chainId,
          from: selectedRoute.sellToken.address,
          to: selectedRoute.buyToken.address,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          type: selectedRoute.type,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
    }
  };

  const addCustomTokenToList = (token: Token) => {
    dispatch(addCustomToken(token));
  };

  const handleTransactionSimulationWait = (transactions?: TransactionStep[], response?: BlowfishResponse) => {
    if (!transactions?.length) {
      return;
    }

    const newSteps = [...transactions];

    const index = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_SIMULATION });

    if (index !== -1) {
      newSteps[index] = {
        ...newSteps[index],
        done: true,
        failed: !response,
        checkForPending: false,
        extraData: {
          ...newSteps[index].extraData,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          simulation: response,
        },
      };

      setTransactionsToExecute(newSteps);
    }
  };

  const handleTransactionEndedForWait = (transactions?: TransactionStep[]) => {
    if (!transactions?.length) {
      return;
    }

    const newSteps = [...transactions];

    const index = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL });

    if (index !== -1) {
      newSteps[index] = {
        ...newSteps[index],
        done: true,
        checkForPending: false,
      };

      setTransactionsToExecute(newSteps);

      if (
        newSteps[index + 1] &&
        newSteps[index + 1].type === TRANSACTION_ACTION_WAIT_FOR_SIMULATION &&
        selectedRoute &&
        selectedRoute.tx
      ) {
        const simulatePromise = simulationService.simulateTransaction(
          selectedRoute.tx,
          currentNetwork.chainId,
          !!transferTo
        );
        simulatePromise
          .then((blowfishResponse) => blowfishResponse && handleTransactionSimulationWait(newSteps, blowfishResponse))
          .catch(() => handleTransactionSimulationWait(newSteps));
      }
    }
  };

  const handleMultiSteps = () => {
    if (!from || fromValueToUse === '' || !to || !selectedRoute) {
      return;
    }

    const newSteps: TransactionStep[] = [];

    const amountToApprove =
      isBuyOrder && selectedRoute
        ? BigNumber.from(selectedRoute.maxSellAmount.amount)
        : parseUnits(fromValueToUse, from.decimals);

    newSteps.push({
      hash: '',
      onAction: handleApproveToken,
      checkForPending: false,
      done: false,
      type: TRANSACTION_ACTION_APPROVE_TOKEN,
      extraData: {
        token: from,
        amount: amountToApprove,
        swapper: selectedRoute.swapper.name,
      },
    });

    newSteps.push({
      hash: '',
      onAction: handleTransactionEndedForWait,
      checkForPending: true,
      done: false,
      type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
      extraData: {
        token: from,
        amount: amountToApprove,
      },
    });

    if (BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && selectedRoute.tx) {
      newSteps.push({
        hash: '',
        onAction: handleTransactionSimulationWait,
        checkForPending: true,
        done: false,
        type: TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
        extraData: {
          tx: selectedRoute.tx,
          chainId: currentNetwork.chainId,
        },
      });
    }

    newSteps.push({
      hash: '',
      onAction: handleSwap,
      checkForPending: true,
      done: false,
      type: TRANSACTION_ACTION_SWAP,
      extraData: {
        from,
        to,
        sellAmount: parseUnits(fromValueToUse, from.decimals),
        buyAmount: parseUnits(toValueToUse, to.decimals),
      },
    });

    setTransactionsToExecute(newSteps);
    setRefreshQuotes(false);
    setShouldShowSteps(true);
  };

  const startSelectingCoin = (token: Token) => {
    setSelecting(token);
    setShouldShowPicker(true);
  };

  const handleFromValueChange = (newFromValue: string) => {
    if (!from) return;
    setFromValue(newFromValue, true);
  };

  const handleToValueChange = (newToValue: string) => {
    if (!to) return;
    setToValue(newToValue, true);
  };

  const handleBackTransactionSteps = () => {
    setShouldShowSteps(false);
    setRefreshQuotes(true);
  };

  const formattedUnits =
    selectedRoute?.maxSellAmount.amount &&
    formatUnits(selectedRoute.maxSellAmount.amount, selectedRoute.sellToken.decimals);

  const cantFund =
    from &&
    isOnCorrectNetwork &&
    !!fromValueToUse &&
    !!balance &&
    parseUnits(formattedUnits || fromValueToUse, selectedRoute?.sellToken.decimals || from.decimals).gt(balance);

  const isApproved =
    !from ||
    !selectedRoute ||
    (from &&
      selectedRoute &&
      (!fromValueToUse
        ? true
        : (allowance.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValueToUse, from.decimals))) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValueToUse ||
    cantFund ||
    !balance ||
    !selectedRoute ||
    balanceErrors ||
    allowanceErrors ||
    parseUnits(fromValueToUse, selectedRoute?.sellToken.decimals || from.decimals).lte(BigNumber.from(0)) ||
    isLoadingRoute;

  const shouldDisableButton = shouldDisableApproveButton || !isApproved || !selectedRoute.tx || transactionWillFail;

  const NoWalletButton = (
    <StyledButton size="large" color="default" variant="outlined" fullWidth onClick={openConnectModal}>
      <Typography variant="body1">
        <FormattedMessage description="connect wallet" defaultMessage="Connect wallet" />
      </Typography>
    </StyledButton>
  );

  const IncorrectNetworkButton = (
    <StyledButton
      size="large"
      color="secondary"
      variant="contained"
      onClick={() => onChangeNetwork(currentNetwork.chainId)}
      fullWidth
    >
      <Typography variant="body1">
        <FormattedMessage
          description="incorrect network"
          defaultMessage="Change network to {network}"
          values={{ network: currentNetwork.name }}
        />
      </Typography>
    </StyledButton>
  );

  const ProceedButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton}
      color="secondary"
      fullWidth
      onClick={handleMultiSteps}
    >
      <Typography variant="body1">
        <FormattedMessage description="proceed agg" defaultMessage="Continue" />
      </Typography>
    </StyledButton>
  );

  const SwapButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableButton}
      color="secondary"
      fullWidth
      onClick={() => handleSwap()}
    >
      {isLoadingRoute && <CenteredLoadingIndicator />}
      {!isLoadingRoute && (
        <Typography variant="body1">
          {from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address && (
            <FormattedMessage description="wrap agg" defaultMessage="Wrap" />
          )}
          {from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS && (
            <FormattedMessage description="unwrap agg" defaultMessage="Unwrap" />
          )}
          {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
            (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
            <FormattedMessage description="swap agg" defaultMessage="Swap" />
          )}
        </Typography>
      )}
    </StyledButton>
  );

  const ApproveAndSwapSafeButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton}
      color="secondary"
      fullWidth
      onClick={() => handleSafeApproveAndSwap()}
    >
      {isLoadingRoute && <CenteredLoadingIndicator />}
      {!isLoadingRoute && (
        <Typography variant="body1">
          {from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address && (
            <FormattedMessage
              description="wrap agg"
              defaultMessage="Approve {from} and wrap"
              values={{ from: from.symbol }}
            />
          )}
          {from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS && (
            <FormattedMessage description="unwrap agg" defaultMessage="Unwrap" />
          )}
          {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
            (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
            <FormattedMessage
              description="approve and swap agg"
              defaultMessage="Approve {from} and swap"
              values={{ from: from?.symbol || '' }}
            />
          )}
        </Typography>
      )}
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
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to && loadedAsSafeApp) {
    ButtonToShow = ApproveAndSwapSafeButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to) {
    ButtonToShow = ProceedButton;
  } else {
    ButtonToShow = SwapButton;
  }

  return (
    <>
      <TransferToModal
        transferTo={transferTo}
        onCancel={() => setShouldShowTransferModal(false)}
        open={shouldShowTransferModal}
      />
      <StyledPaper variant="outlined" ref={containerRef}>
        <SwapSettings shouldShow={shouldShowSettings} onClose={() => setShouldShowSettings(false)} />
        <TransactionConfirmation
          to={to}
          from={from}
          shouldShow={shouldShowConfirmation}
          transaction={currentTransaction}
          handleClose={() => setShouldShowConfirmation(false)}
        />
        <TransactionSteps
          shouldShow={shouldShowSteps}
          handleClose={handleBackTransactionSteps}
          transactions={transactionsToExecute}
        />
        <TokenPicker
          shouldShow={shouldShowPicker}
          onClose={() => setShouldShowPicker(false)}
          isFrom={selecting === from}
          onChange={(from && selecting.address === from.address) || selecting.address === 'from' ? setFrom : setTo}
          usedTokens={usedTokens}
          ignoreValues={[]}
          yieldOptions={[]}
          isLoadingYieldOptions={false}
          onAddToken={addCustomTokenToList}
        />
        <SwapFirstStep
          from={from}
          to={to}
          setTransactionWillFail={setTransactionWillFail}
          disabledDexes={disabledDexes}
          onChangeNetwork={handleChangeNetwork}
          fromValue={fromValueToUse}
          toValue={toValueToUse}
          toggleFromTo={toggleFromTo}
          startSelectingCoin={startSelectingCoin}
          cantFund={cantFund}
          handleFromValueChange={handleFromValueChange}
          handleToValueChange={handleToValueChange}
          balance={balance}
          buttonToShow={ButtonToShow}
          selectedRoute={selectedRoute}
          isBuyOrder={isBuyOrder}
          isLoadingRoute={isLoadingRoute}
          transferTo={transferTo}
          onOpenTransferTo={() => setShouldShowTransferModal(true)}
          onShowSettings={() => setShouldShowSettings(true)}
          slippage={slippage}
          gasSpeed={gasSpeed}
          isApproved={isApproved}
        />
      </StyledPaper>
    </>
  );
};
export default Swap;
