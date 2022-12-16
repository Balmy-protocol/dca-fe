import React from 'react';
import { parseUnits } from '@ethersproject/units';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/aggregator-token-picker';
import findIndex from 'lodash/findIndex';
import Button from 'common/button';
import useBalance from 'hooks/useBalance';
import useUsedTokens from 'hooks/useUsedTokens';
import {
  SUPPORTED_NETWORKS,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_TYPES,
} from 'config/constants';
import useTransactionModal from 'hooks/useTransactionModal';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import { useTransactionAdder } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import useWalletService from 'hooks/useWalletService';
import useWeb3Service from 'hooks/useWeb3Service';
import useAggregatorService from 'hooks/useAggregatorService';
import useSpecificAllowance from 'hooks/useSpecificAllowance';
import TransferToModal from 'common/transfer-to-modal';
import TransactionConfirmation from 'common/transaction-confirmation';
import TransactionSteps, { TransactionAction as TransactionStep } from 'common/transaction-steps';
import { GasKeys } from 'config/constants/aggregator';
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
  setRefreshQuotes,
  toggleFromTo,
}: SwapProps) => {
  const web3Service = useWeb3Service();
  const containerRef = React.useRef(null);
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const aggregatorService = useAggregatorService();
  const [balance, , balanceErrors] = useBalance(from);
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();
  const [usedTokens] = useUsedTokens();
  const [shouldShowTransferModal, setShouldShowTransferModal] = React.useState(false);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);

  const [allowance, , allowanceErrors] = useSpecificAllowance(from, selectedRoute?.swapper.allowanceTarget);

  const handleApproveToken = async (transactions?: TransactionStep[]) => {
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
      const result = await walletService.approveSpecificToken(from, selectedRoute.swapper.allowanceTarget);

      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: from,
          addressFor: selectedRoute.swapper.allowanceTarget,
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
    if (!from || !to || !selectedRoute) return;
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

      const result = await aggregatorService.swap(selectedRoute);

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
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
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
    }
  };

  const handleMultiSteps = () => {
    if (!from || fromValue === '' || !to) {
      return;
    }

    const newSteps: TransactionStep[] = [];

    newSteps.push({
      hash: '',
      onAction: handleApproveToken,
      checkForPending: false,
      done: false,
      type: TRANSACTION_ACTION_APPROVE_TOKEN,
      extraData: {
        token: from,
        amount: parseUnits(fromValue, from.decimals),
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
        amount: parseUnits(fromValue, from.decimals),
      },
    });

    newSteps.push({
      hash: '',
      onAction: handleSwap,
      checkForPending: true,
      done: false,
      type: TRANSACTION_ACTION_SWAP,
      extraData: {
        from,
        to,
        sellAmount: parseUnits(fromValue, from.decimals),
        buyAmount: parseUnits(fromValue, from.decimals),
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

  const cantFund = from && !!fromValue && !!balance && parseUnits(fromValue, from.decimals).gt(balance);

  const isApproved =
    !from ||
    !selectedRoute ||
    (from &&
      selectedRoute &&
      (!fromValue
        ? true
        : (allowance.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValue ||
    cantFund ||
    !balance ||
    !selectedRoute ||
    balanceErrors ||
    allowanceErrors ||
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0)) ||
    isLoadingRoute;

  const shouldDisableButton = shouldDisableApproveButton || !isApproved;

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
        <FormattedMessage description="proceed agg" defaultMessage="Proceed" />
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
  } else if (!SUPPORTED_NETWORKS.includes(currentNetwork.chainId)) {
    ButtonToShow = NotConnectedButton;
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
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
          otherSelected={(from && selecting.address === from.address) || selecting.address === 'from' ? to : from}
        />
        <SwapFirstStep
          from={from}
          to={to}
          fromValue={fromValue}
          toValue={toValue}
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
        />
      </StyledPaper>
    </>
  );
};
export default Swap;
