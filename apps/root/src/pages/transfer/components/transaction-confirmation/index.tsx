import React from 'react';
import styled from 'styled-components';
import { withStyles } from 'tss-react/mui';
import {
  Typography,
  CircularProgress,
  circularProgressClasses,
  Slide,
  createStyles,
  Button,
  colors,
  SuccessCircleIcon,
  ContainerBox,
  TransactionReceipt,
  TransactionReceiptProp,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { NETWORKS } from '@constants';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import confetti from 'canvas-confetti';
import { Token, TransactionEventTypes } from '@types';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { useThemeMode } from '@state/config/hooks';
import useTransactionReceipt from '@hooks/useTransactionReceipt';

const StyledOverlay = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 10, justifyContent: 'center' })`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99;
    padding: ${spacing(6)};
    background-color: ${colors[mode].background.secondary};
  `}
`;

const StyledConfirmationContainer = styled(ContainerBox).attrs({ justifyContent: 'center', alignItems: 'center' })`
  align-self: stretch;
  flex: 1;
`;

const StyledProgressContent = styled.div`
  position: absolute;
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
    root: {},
    circle: {
      strokeLinecap: 'round',
    },
  })
);

const StyledTypography = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledContentTitle = styled(Typography).attrs({ variant: 'h5' })`
  color: ${({ theme: { palette } }) => colors[palette.mode].typography.typo1};
  text-align: center;
  font-weight: bold;
`;

interface TransactionConfirmationProps {
  shouldShow: boolean;
  handleClose: () => void;
  txHash: string;
  from: Token | null;
}

const TIMES_PER_NETWORK = {
  [NETWORKS.arbitrum.chainId]: 10,
  [NETWORKS.polygon.chainId]: 20,
  [NETWORKS.optimism.chainId]: 10,
  [NETWORKS.mainnet.chainId]: 40,
};

const DEFAULT_TIME_PER_NETWORK = 30;

const TransferConfirmationContent = ({ tokenSymbol, amount }: { tokenSymbol: string; amount: string }) => (
  <ContainerBox flexDirection="column" fullWidth gap={2}>
    <StyledContentTitle>
      <FormattedMessage description="transactionConfirmationSuccessful" defaultMessage="Transfer successful" />
    </StyledContentTitle>
    <Typography variant="body" textAlign="center">
      <FormattedMessage
        description="transferSuccessfulDescription"
        defaultMessage="<b>You have sent {amount} {symbol}.</b> You can view the transaction details in your activity log. Check your receipt for more info."
        values={{
          symbol: tokenSymbol,
          amount,
          b: (chunks) => <b>{chunks}</b>,
        }}
      />
    </Typography>
  </ContainerBox>
);

const buildConfirmationContent = ({ transaction }: { transaction: TransactionReceiptProp | undefined }) => {
  if (!transaction) {
    return (
      <StyledContentTitle>
        <FormattedMessage description="transactionConfirmationInProgress" defaultMessage="Transaction in progress" />
      </StyledContentTitle>
    );
  }

  switch (transaction.type) {
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return (
        <TransferConfirmationContent
          tokenSymbol={transaction.data.token.symbol}
          amount={transaction.data.amount.amountInUnits}
        />
      );

    default:
      break;
  }
};

const TransactionConfirmation = ({ shouldShow, handleClose, txHash, from }: TransactionConfirmationProps) => {
  const { confettiParticleCount } = useAggregatorSettingsState();
  const transactionReceipt = useTransactionReceipt(txHash);
  const [hasShownSuccess, setHasShownSuccess] = React.useState(false);
  const currentNetwork = useSelectedNetwork();
  const [timer, setTimer] = React.useState(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
  const minutes = Math.floor(timer / 60);
  const seconds = timer - minutes * 60;
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const mode = useThemeMode();

  React.useEffect(() => {
    if (timer > 0 && shouldShow) {
      timerRef.current = setTimeout(() => setTimer((currTimer) => currTimer - 1), 1000);
    }
  }, [timer, shouldShow]);

  React.useEffect(() => {
    setTimer(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
  }, [txHash]);

  React.useEffect(() => {
    if (!transactionReceipt) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setTimer(TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK);
    }
    if (transactionReceipt && !hasShownSuccess) {
      setTimer(0);
      setHasShownSuccess(true);
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
  }, [timerRef, from, transactionReceipt, hasShownSuccess]);

  const onGoToEtherscan = () => {
    const url = buildEtherscanTransaction(txHash, currentNetwork.chainId);
    window.open(url, '_blank');
  };

  const handleNewTrade = () => {
    handleClose();
  };

  const onViewReceipt = () => {
    setShowReceipt(true);
  };

  return (
    <>
      <TransactionReceipt open={showReceipt} onClose={() => setShowReceipt(false)} transaction={transactionReceipt} />
      <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
        <StyledOverlay>
          <StyledConfirmationContainer>
            <svg width={0} height={0}>
              <linearGradient id="progressGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor={colors[mode].violet.violet200} />
                <stop offset="123.4%" stopColor={colors[mode].violet.violet800} />
              </linearGradient>
            </svg>
            {!transactionReceipt && (
              <>
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
                  value={(1 - timer / (TIMES_PER_NETWORK[currentNetwork.chainId] || DEFAULT_TIME_PER_NETWORK)) * 100}
                  thickness={4}
                  sx={{
                    [`& .${circularProgressClasses.circle}`]: {
                      strokeLinecap: 'round',
                      stroke: "url('#progressGradient')",
                    },
                  }}
                />
              </>
            )}
            <StyledProgressContent>
              <StyledTypography variant={!transactionReceipt && timer === 0 ? 'h4' : 'h2'}>
                {!transactionReceipt && timer > 0 && `${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`}
                {!transactionReceipt && timer === 0 && (
                  <FormattedMessage description="transactionConfirmationProcessing" defaultMessage="Processing" />
                )}
                {transactionReceipt && <SuccessCircleIcon />}
              </StyledTypography>
            </StyledProgressContent>
          </StyledConfirmationContainer>
          {buildConfirmationContent({ transaction: transactionReceipt })}
          <ContainerBox flexDirection="column" gap={3} fullWidth alignItems="center">
            <Button onClick={handleNewTrade} variant="contained" fullWidth size="large">
              <FormattedMessage description="transactionConfirmationDone" defaultMessage="Done" />
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              onClick={transactionReceipt ? onViewReceipt : onGoToEtherscan}
            >
              {transactionReceipt ? (
                <FormattedMessage description="transactionConfirmationViewReceipt" defaultMessage="View receipt" />
              ) : (
                <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
              )}
            </Button>
          </ContainerBox>
        </StyledOverlay>
      </Slide>
    </>
  );
};

export default TransactionConfirmation;
