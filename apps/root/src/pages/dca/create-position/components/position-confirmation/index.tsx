import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import { withStyles } from 'tss-react/mui';
import { useIsTransactionPending, useTransaction } from '@state/transactions/hooks';
import {
  Typography,
  Slide,
  CircularProgress,
  circularProgressClasses,
  CheckCircle as CheckCircleIcon,
  createStyles,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { LATEST_VERSION, NETWORKS } from '@constants';
import usePrevious from '@hooks/usePrevious';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import confetti from 'canvas-confetti';
import { TransactionTypes } from '@types';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import usePushToHistory from '@hooks/usePushToHistory';

const StyledOverlay = styled.div`
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

interface PositionConfirmationProps {
  shouldShow: boolean;
  handleClose: () => void;
  transaction: string;
}

const TIMES_PER_NETWORK = {
  [NETWORKS.arbitrum.chainId]: 10,
  [NETWORKS.polygon.chainId]: 20,
  [NETWORKS.optimism.chainId]: 10,
  [NETWORKS.mainnet.chainId]: 40,
};

const DEFAULT_TIME_PER_NETWORK = 30;

const PositionConfirmation = ({ shouldShow, handleClose, transaction }: PositionConfirmationProps) => {
  const { confettiParticleCount } = useAggregatorSettingsState();
  const getPendingTransaction = useIsTransactionPending();
  const isTransactionPending = getPendingTransaction(transaction);
  const [success, setSuccess] = React.useState(false);
  const previousTransactionPending = usePrevious(isTransactionPending);
  const currentNetwork = useSelectedNetwork();
  const [timer, setTimer] = React.useState(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
  const minutes = Math.floor(timer / 60);
  const seconds = timer - minutes * 60;
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const transactionReceipt = useTransaction(transaction);
  const trackEvent = useTrackEvent();
  const pushToHistory = usePushToHistory();

  const onGoToEtherscan = () => {
    const url = buildEtherscanTransaction(transaction, currentNetwork.chainId);
    window.open(url, '_blank');
    trackEvent('DCA - Transaction steps - View transaction details');
  };

  const onGoToPosition = () => {
    if (!transactionReceipt || transactionReceipt.type !== TransactionTypes.newPosition) {
      return;
    }

    const positionId = transactionReceipt.typeData.id;
    pushToHistory(`/${transactionReceipt.chainId}/positions/${LATEST_VERSION}/${positionId}`);
    trackEvent('DCA - Transaction steps - View details');
  };

  const handleNewPosition = () => {
    trackEvent('DCA - Transaction steps - New position');
    handleClose();
  };

  React.useEffect(() => {
    if (timer > 0 && shouldShow) {
      timerRef.current = setTimeout(() => setTimer((oldTimer) => oldTimer - 1), 1000);
    }
  }, [timer, shouldShow]);

  React.useEffect(() => {
    setSuccess(false);
    setTimer(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
  }, [transaction]);

  React.useEffect(() => {
    if (!success && isTransactionPending && !previousTransactionPending) {
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
    }
  }, [isTransactionPending, previousTransactionPending, success, timerRef]);

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
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
              <FormattedMessage
                description="transactionConfirmationBalanceChangesCreatePosition"
                defaultMessage="Position created"
              />
            )}
          </Typography>
        </StyledTitleContainer>
        <StyledConfirmationContainer>
          <StyledBottomCircularProgress
            size={270}
            variant="determinate"
            value={100}
            thickness={4}
            sx={{ position: 'absolute' }}
          />
          <StyledTopCircularProgress
            size={270}
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
        <StyledButonContainer>
          <Button
            variant="outlined"
            color="default"
            fullWidth
            onClick={success ? onGoToPosition : onGoToEtherscan}
            size="large"
          >
            {!success ? (
              <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
            ) : (
              <FormattedMessage
                description="transactionDCAConfirmationViewPosition"
                defaultMessage="View my position"
              />
            )}
          </Button>
          <Button variant="contained" color="secondary" onClick={handleNewPosition} fullWidth size="large">
            <FormattedMessage
              description="transactionDCAConfirmationNewPosition"
              defaultMessage="Create new position"
            />
          </Button>
        </StyledButonContainer>
      </StyledOverlay>
    </Slide>
  );
};

export default PositionConfirmation;
