import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import { withStyles } from 'tss-react/mui';
import { useIsTransactionPending, useTransaction } from '@state/transactions/hooks';
import {
  Typography,
  CircularProgress,
  circularProgressClasses,
  Slide,
  Divider,
  CheckCircleIcon,
  createStyles,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { NETWORKS } from '@constants';
import usePrevious from '@hooks/usePrevious';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import confetti from 'canvas-confetti';
import useAggregatorService from '@hooks/useAggregatorService';
import useWalletService from '@hooks/useWalletService';
import { Token, TransactionTypes } from '@types';
import { BigNumber } from 'ethers';
import TokenIcon from '@common/components/token-icon';
import { formatUnits } from '@ethersproject/units';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { parseUsdPrice } from '@common/utils/currency';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledOverlay = styled.div<{ showingBalances: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: #1b1b1c;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: ${({ showingBalances }) => (showingBalances ? '20px' : '40px')};
`;

const StyledTitleContainer = styled.div`
  text-align: center;
`;

const StyledConfirmationContainer = styled.div`
  align-self: stretch;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledProgressContent = styled.div`
  position: absolute;
`;

const StyledButonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

const StyledTopCircularProgress = withStyles(CircularProgress, () =>
  createStyles({
    circle: {
      stroke: "url('#progressGradient')",
      strokeLinecap: 'round',
    },
  })
);

const StyledBottomCircularProgress = withStyles(CircularProgress, () =>
  createStyles({
    root: {
      color: 'rgba(255, 255, 255, 0.05)',
    },
    circle: {
      strokeLinecap: 'round',
    },
  })
);

const StyledCheckCircleIcon = withStyles(CheckCircleIcon, () =>
  createStyles({
    root: {
      stroke: "url('#successGradient')",
      fill: "url('#successGradient')",
    },
  })
);

const StyledTypography = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBalanceChangesContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(216, 216, 216, 0.1);
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  gap: 16px;
`;

const StyledBalanceChange = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledBalanceChangeToken = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

interface TransactionConfirmationProps {
  shouldShow: boolean;
  handleClose: () => void;
  transaction: string;
  to: Token | null;
  from: Token | null;
}

const TIMES_PER_NETWORK = {
  [NETWORKS.arbitrum.chainId]: 10,
  [NETWORKS.polygon.chainId]: 20,
  [NETWORKS.optimism.chainId]: 10,
  [NETWORKS.mainnet.chainId]: 40,
};

const DEFAULT_TIME_PER_NETWORK = 30;

const TransactionConfirmation = ({ shouldShow, handleClose, transaction, to, from }: TransactionConfirmationProps) => {
  const { confettiParticleCount } = useAggregatorSettingsState();
  const getPendingTransaction = useIsTransactionPending();
  const walletService = useWalletService();
  const isTransactionPending = getPendingTransaction(transaction);
  const [success, setSuccess] = React.useState(false);
  const [balanceAfter, setBalanceAfter] = React.useState<BigNumber | null>(null);
  const previousTransactionPending = usePrevious(isTransactionPending);
  const currentNetwork = useSelectedNetwork();
  const [timer, setTimer] = React.useState(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
  const minutes = Math.floor(timer / 60);
  const seconds = timer - minutes * 60;
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const transactionReceipt = useTransaction(transaction);
  const aggregatorService = useAggregatorService();
  const [fromPrice] = useRawUsdPrice(from);
  const [toPrice] = useRawUsdPrice(to);
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const [protocolPrice] = useRawUsdPrice(protocolToken);
  const trackEvent = useTrackEvent();

  const handleNewTrade = () => {
    trackEvent('Aggregator - New trade');
    handleClose();
  };

  React.useEffect(() => {
    if (timer > 0 && shouldShow) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
  }, [timer, shouldShow]);

  React.useEffect(() => {
    setSuccess(false);
    setTimer(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
  }, [transaction]);

  React.useEffect(() => {
    if (!success && isTransactionPending && !previousTransactionPending) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setTimer(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
    }
    if (!isTransactionPending && previousTransactionPending) {
      setTimer(0);
      setSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      confetti({
        particleCount: confettiParticleCount,
        spread: 70,
        angle: 60,
        origin: { x: 0 },
      });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      confetti({
        particleCount: confettiParticleCount,
        spread: 70,
        angle: 120,
        origin: { x: 1 },
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (
        (from?.address === PROTOCOL_TOKEN_ADDRESS || to?.address === PROTOCOL_TOKEN_ADDRESS) &&
        transactionReceipt?.type === TransactionTypes.swap
      ) {
        walletService
          .getBalance(transactionReceipt?.typeData.transferTo || transactionReceipt.from, PROTOCOL_TOKEN_ADDRESS)
          .then((newBalance) => setBalanceAfter(newBalance))
          .catch((e) => console.error('Error fetching balance after swap', e));
      }
    }
  }, [isTransactionPending, previousTransactionPending, success, timerRef, from, to, transactionReceipt]);

  const onGoToEtherscan = () => {
    const url = buildEtherscanTransaction(transaction, currentNetwork.chainId);
    window.open(url, '_blank');
    trackEvent('Aggregator - View transaction details');
  };

  let sentFrom: BigNumber | null = null;
  let gotTo: BigNumber | null = null;
  let gasUsed: BigNumber | null = null;
  let typeData;

  if (transactionReceipt?.type === TransactionTypes.swap) {
    typeData = transactionReceipt.typeData;
  }
  const transferTo: string | undefined | null = typeData?.transferTo;
  if (transactionReceipt?.receipt && to && from && typeData) {
    const { balanceBefore } = typeData;

    gasUsed = BigNumber.from(transactionReceipt.receipt.gasUsed).mul(
      BigNumber.from(transactionReceipt.receipt.effectiveGasPrice)
    );

    if (from.address !== PROTOCOL_TOKEN_ADDRESS) {
      sentFrom =
        aggregatorService.findTransferValue(
          {
            ...transactionReceipt.receipt,
            gasUsed: BigNumber.from(transactionReceipt.receipt.gasUsed),
            cumulativeGasUsed: BigNumber.from(transactionReceipt.receipt.cumulativeGasUsed),
            effectiveGasPrice: BigNumber.from(transactionReceipt.receipt.effectiveGasPrice),
          },
          from.address || '',
          { from: { address: transactionReceipt.from } }
        )[0] || null;
    } else if (balanceAfter && balanceBefore) {
      sentFrom = BigNumber.from(balanceBefore).sub(balanceAfter.add(gasUsed));
    }
    if (to.address !== PROTOCOL_TOKEN_ADDRESS) {
      gotTo =
        aggregatorService.findTransferValue(
          {
            ...transactionReceipt.receipt,
            gasUsed: BigNumber.from(transactionReceipt.receipt.gasUsed),
            cumulativeGasUsed: BigNumber.from(transactionReceipt.receipt.cumulativeGasUsed),
            effectiveGasPrice: BigNumber.from(transactionReceipt.receipt.effectiveGasPrice),
          },
          to.address || '',
          { to: { address: transferTo || transactionReceipt.from } }
        )[0] || null;
    } else if (balanceAfter && balanceBefore) {
      gotTo = balanceAfter.sub(BigNumber.from(balanceBefore)).add(gasUsed);
    }
  }

  const showingBalances = !!gotTo && !!sentFrom && !!gasUsed;

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay showingBalances={showingBalances}>
        <StyledTitleContainer>
          <svg width={0} height={0}>
            <linearGradient id="progressGradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#3076F6" />
              <stop offset="123.4%" stopColor="#B518FF" />
            </linearGradient>
            <linearGradient id="successGradient" gradientTransform="rotate(135)">
              <stop offset="0%" stopColor="#7AE7AC" />
              <stop offset="100%" stopColor="#1E9619" />
            </linearGradient>
          </svg>
          <Typography variant="h6">
            {!success ? (
              <FormattedMessage
                description="transactionConfirmationInProgress"
                defaultMessage="Transaction in progress"
              />
            ) : (
              <FormattedMessage description="transactionConfirmationBalanceChanges" defaultMessage="Trade confirmed" />
            )}
          </Typography>
        </StyledTitleContainer>
        <StyledConfirmationContainer>
          <StyledBottomCircularProgress
            size={showingBalances ? 200 : 270}
            variant="determinate"
            value={100}
            thickness={4}
            sx={{ position: 'absolute' }}
          />
          <StyledTopCircularProgress
            size={showingBalances ? 200 : 270}
            variant="determinate"
            value={
              !success
                ? (1 - timer / (TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK)) * 100
                : 100
            }
            thickness={4}
            sx={{
              [`& .${circularProgressClasses.circle}`]: {
                strokeLinecap: 'round',
                stroke: !success ? "url('#progressGradient')" : "url('#successGradient')",
              },
            }}
          />
          <StyledProgressContent>
            <StyledTypography variant={!success && isTransactionPending && timer === 0 ? 'h4' : 'h2'}>
              {!success && isTransactionPending && timer > 0 && `${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`}
              {!success && isTransactionPending && timer === 0 && (
                <FormattedMessage description="transactionConfirmationProcessing" defaultMessage="Processing" />
              )}
              {success && <StyledCheckCircleIcon fontSize="inherit" />}
            </StyledTypography>
          </StyledProgressContent>
        </StyledConfirmationContainer>
        {from && to && (sentFrom || gotTo) && (
          <StyledBalanceChangesContainer>
            {sentFrom && from && (
              <StyledBalanceChange>
                <StyledBalanceChangeToken>
                  <TokenIcon token={from} /> {from?.symbol}
                </StyledBalanceChangeToken>
                <StyledAmountContainer>
                  <Typography variant="body1" color="#EB5757">
                    -{formatUnits(sentFrom, from.decimals)}
                  </Typography>
                  {toPrice && (
                    <Typography variant="caption" color="#939494">
                      ${parseUsdPrice(from, sentFrom, fromPrice).toFixed(2)}
                    </Typography>
                  )}
                </StyledAmountContainer>
              </StyledBalanceChange>
            )}
            {sentFrom && gotTo && <Divider />}
            {gotTo && (
              <StyledBalanceChange>
                <StyledBalanceChangeToken>
                  <TokenIcon token={to} /> {to?.symbol}
                </StyledBalanceChangeToken>
                <StyledAmountContainer>
                  <Typography variant="body1" color="#219653">
                    +{formatUnits(gotTo, to.decimals)}
                  </Typography>
                  {toPrice && (
                    <Typography variant="caption" color="#939494">
                      ${parseUsdPrice(to, gotTo, toPrice).toFixed(2)}
                    </Typography>
                  )}
                  {transferTo && (
                    <Typography variant="caption" color="#939494">
                      <FormattedMessage
                        description="transactionConfirmationTransferTo"
                        defaultMessage="Transfered to: {account}"
                        values={{ account: `${transferTo.slice(0, 6)}...${transferTo.slice(-6)}` }}
                      />
                    </Typography>
                  )}
                </StyledAmountContainer>
              </StyledBalanceChange>
            )}
            {gasUsed && gasUsed.gt(BigNumber.from(0)) && gotTo && <Divider />}
            {gasUsed && gasUsed.gt(BigNumber.from(0)) && (
              <StyledBalanceChange>
                <StyledBalanceChangeToken>
                  <FormattedMessage
                    description="transactionConfirmationBalanceChangesGasUsed"
                    defaultMessage="Transaction cost:"
                  />
                </StyledBalanceChangeToken>
                <StyledAmountContainer>
                  <Typography variant="body1" color="#219653">
                    {formatUnits(gasUsed, protocolToken.decimals)} {protocolToken.symbol}
                  </Typography>
                  {protocolPrice && (
                    <Typography variant="caption" color="#939494">
                      ${parseUsdPrice(protocolToken, gasUsed, protocolPrice).toFixed(2)}
                    </Typography>
                  )}
                </StyledAmountContainer>
              </StyledBalanceChange>
            )}
          </StyledBalanceChangesContainer>
        )}
        <StyledButonContainer>
          <Button variant="outlined" color="default" fullWidth onClick={onGoToEtherscan} size="large">
            {!success ? (
              <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
            ) : (
              <FormattedMessage description="transactionConfirmationViewReceipt" defaultMessage="View receipt" />
            )}
          </Button>
          <Button variant="contained" color="secondary" onClick={handleNewTrade} fullWidth size="large">
            <FormattedMessage description="transactionConfirmationNewTrade" defaultMessage="New trade" />
          </Button>
        </StyledButonContainer>
      </StyledOverlay>
    </Slide>
  );
};

export default TransactionConfirmation;
