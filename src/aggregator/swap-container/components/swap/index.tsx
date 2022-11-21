import React from 'react';
import { parseUnits } from '@ethersproject/units';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/token-picker';
import Button from 'common/button';
import Tooltip from '@mui/material/Tooltip';
import useBalance from 'hooks/useBalance';
import useUsedTokens from 'hooks/useUsedTokens';
import { SUPPORTED_NETWORKS, TRANSACTION_TYPES } from 'config/constants';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import useTransactionModal from 'hooks/useTransactionModal';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import { useTransactionAdder, useHasPendingApproval } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import useWalletService from 'hooks/useWalletService';
import useWeb3Service from 'hooks/useWeb3Service';
import useAggregatorService from 'hooks/useAggregatorService';
import useSpecificAllowance from 'hooks/useSpecificAllowance';
import TransferToModal from 'common/transfer-to-modal';
import SwapFirstStep from '../step1';

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
  transferTo: string | null;
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
}: SwapProps) => {
  const web3Service = useWeb3Service();
  const containerRef = React.useRef(null);
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const aggregatorService = useAggregatorService();
  const [balance, , balanceErrors] = useBalance(from);
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();
  const [usedTokens] = useUsedTokens();
  const [shouldShowTransferModal, setShouldShowTransferModal] = React.useState(false);

  const hasPendingApproval = useHasPendingApproval(
    from,
    web3Service.getAccount(),
    false,
    selectedRoute?.swapper.allowanceTarget
  );

  const [allowance, , allowanceErrors] = useSpecificAllowance(from, selectedRoute?.swapper.allowanceTarget);

  const handleApproveToken = async () => {
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
    if (!from || !to || !selectedRoute) return;
    const fromSymbol = from.symbol;
    const toSymbol = to.symbol;
    const fromAmount = formatCurrencyAmount(selectedRoute.sellAmount.amount, from, 4);
    const toAmount = formatCurrencyAmount(selectedRoute.buyAmount.amount, to, 4);

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="swap aggregator"
              defaultMessage="Swapping {fromAmount} {from} for {toAmount} {to} for you"
              values={{ from: fromSymbol, to: toSymbol, fromAmount, toAmount }}
            />
          </Typography>
        ),
      });

      const result = await aggregatorService.swap(selectedRoute);

      addTransaction(result, {
        type: TRANSACTION_TYPES.SWAP,
        typeData: {
          from: fromSymbol,
          to: toSymbol,
          amountFrom: fromAmount,
          amountTo: toAmount,
        },
      });

      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success swapping"
            defaultMessage="Your transaction to swap {fromAmount} {from} for {toAmount} {to} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ from: fromSymbol, to: toSymbol, fromAmount, toAmount }}
          />
        ),
      });

      onResetForm();
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
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
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0));

  const shouldDisableButton = shouldDisableApproveButton || !isApproved;

  const ignoreValues = [...(from ? [from.address] : []), ...(to ? [to.address] : [])];

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
      disabled={!!isApproved || hasPendingApproval || !!shouldDisableApproveButton}
      onClick={handleApproveToken}
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

  const SwapButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableButton}
      color="secondary"
      fullWidth
      onClick={handleSwap}
    >
      <Typography variant="body1">
        <FormattedMessage description="swap agg" defaultMessage="Swap" />
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
    ButtonToShow = ApproveTokenButton;
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
        <TokenPicker
          shouldShow={shouldShowPicker}
          onClose={() => setShouldShowPicker(false)}
          isFrom={selecting === from}
          onChange={(from && selecting.address === from.address) || selecting.address === 'from' ? setFrom : setTo}
          usedTokens={usedTokens}
          ignoreValues={ignoreValues}
          yieldOptions={[]}
          isLoadingYieldOptions={false}
          otherSelected={(from && selecting.address === from.address) || selecting.address === 'from' ? to : from}
        />
        <SwapFirstStep
          from={from}
          to={to}
          fromValue={fromValue}
          toValue={toValue}
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
        />
      </StyledPaper>
    </>
  );
};
export default Swap;
