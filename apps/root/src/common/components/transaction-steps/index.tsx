import React, { memo } from 'react';
import styled from 'styled-components';
import findIndex from 'lodash/findIndex';
import { useHasPendingApproval, useIsTransactionPending } from '@state/transactions/hooks';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import {
  TransactionActionApproveTokenType,
  TransactionActionApproveTokenData,
  TransactionActionApproveTokenSignType,
  TransactionActionWaitForApprovalType,
  TransactionActionWaitForApprovalData,
  TransactionActionSwapType,
  TransactionActionSwapData,
  TransactionActionType,
  TransactionActionWaitForSimulationType,
  TransactionActionWaitForSimulationData,
  BlowfishResponse,
  TransactionActionWaitForQuotesSimulationType,
  TransactionActionWaitForQuotesSimulationData,
  TransactionActionCreatePositionType,
  TransactionActionCreatePositionData,
} from '@types';
import {
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN,
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_ACTION_WAIT_FOR_SIGN_APPROVAL,
  TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
  TRANSACTION_ACTION_WAIT_FOR_QUOTES_SIMULATION,
  TRANSACTION_ACTION_CREATE_POSITION,
} from '@constants';
import { withStyles } from 'tss-react/mui';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import {
  Typography,
  CircularProgress,
  Tooltip,
  Slide,
  createStyles,
  Button,
  baseColors,
  colors,
  BackControl,
  Divider,
  ContainerBox,
  WalletMoneyIcon,
  TransactionReceipt,
} from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import Address from '@common/components/address';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import TransactionSimulation from '@common/components/transaction-simulation';
import useActiveWallet from '@hooks/useActiveWallet';
import useTransactionReceipt from '@hooks/useTransactionReceipt';

const StyledOverlay = styled.div`
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
    padding: ${spacing(8)};
    display: flex;
    background-color: ${colors[mode].background.quarteryNoAlpha};
  `}
`;

const StyledExplanation = styled.div`
  display: flex;
  padding-top: 10px;
  cursor: help;
  align-self: flex-start;
`;

interface TransactionActionBase {
  hash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (transactions: any) => void;
  onActionConfirmed?: (hash: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions?: any;
  checkForPending?: boolean;
  done?: boolean;
  failed?: boolean;
  explanation?: string;
}

interface ItemProps {
  getPendingTransaction: (transactionHash: string) => boolean;
  onGoToEtherscan: (hash: string) => void;
  step: number;
  isLast: boolean;
  isCurrentStep: boolean;
}

interface TransactionActionApproveToken extends TransactionActionBase {
  type: TransactionActionApproveTokenType;
  extraData: TransactionActionApproveTokenData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: bigint) => void;
  onActionConfirmed?: (hash: string) => void;
}

interface TransactionActionApproveTokenProps extends TransactionActionApproveToken, ItemProps {}

interface TransactionActionApproveTokenSign extends TransactionActionBase {
  type: TransactionActionApproveTokenSignType;
  extraData: TransactionActionApproveTokenData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: bigint) => void;
}

interface TransactionActionApproveTokenSignProps extends TransactionActionApproveTokenSign, ItemProps {}

interface TransactionActionWaitForApproval extends TransactionActionBase {
  type: TransactionActionWaitForApprovalType;
  extraData: TransactionActionWaitForApprovalData;
}

interface TransactionActionWaitForApprovalProps extends TransactionActionWaitForApproval, ItemProps {}

interface TransactionActionWaitForSimulation extends Omit<TransactionActionBase, 'onAction'> {
  type: TransactionActionWaitForSimulationType;
  extraData: TransactionActionWaitForSimulationData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (transactions: any, response: BlowfishResponse) => void;
}

interface TransactionActionWaitForSimulationProps extends TransactionActionWaitForSimulation, ItemProps {}

interface TransactionActionWaitForQuotesSimulation extends Omit<TransactionActionBase, 'onAction'> {
  type: TransactionActionWaitForQuotesSimulationType;
  extraData: TransactionActionWaitForQuotesSimulationData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (transactions: any, response: BlowfishResponse) => void;
}

interface TransactionActionWaitForQuotesSimulationProps extends TransactionActionWaitForQuotesSimulation, ItemProps {}

interface TransactionActionSwap extends TransactionActionBase {
  type: TransactionActionSwapType;
  extraData: TransactionActionSwapData;
}

interface TransactionActionSwapProps extends TransactionActionSwap, ItemProps {}

interface TransactionActionCreatePosition extends TransactionActionBase {
  type: TransactionActionCreatePositionType;
  extraData: TransactionActionCreatePositionData;
}

interface TransactionActionCreatePositionProps extends TransactionActionCreatePosition, ItemProps {}

export type TransactionAction =
  | TransactionActionApproveToken
  | TransactionActionApproveTokenSign
  | TransactionActionWaitForApproval
  | TransactionActionWaitForSimulation
  | TransactionActionWaitForQuotesSimulation
  | TransactionActionSwap
  | TransactionActionCreatePosition;
type TransactionActions = TransactionAction[];

interface TransactionConfirmationProps {
  shouldShow: boolean;
  handleClose: () => void;
  transactions: TransactionActions;
  onAction: () => void;
  onActionConfirmed?: (hash: string) => void;
}

const StyledTransactionStepIcon = styled.div<{ isLast: boolean; isCurrentStep: boolean }>`
  ${({ theme: { palette, spacing }, isLast, isCurrentStep }) => `
  display: flex;
  align-items: start;
  height: 100%;
  position: relative;
  ${
    !isLast &&
    `&:after {
    content: '';
    position: absolute;
    width: ${spacing(1.25)};
    left: calc(50% - ${spacing(0.625)});
    top: ${spacing(15)};
    right: 0;
    bottom: 0;
    background: ${
      isCurrentStep
        ? `linear-gradient(0deg, ${colors[palette.mode].background.secondary} -1.99%, ${
            baseColors.violet.violet500
          } 100%)`
        : colors[palette.mode].background.secondary
    };
    z-index: -1;
  }`
  }
`}
`;

const StyledTransactionStepIconContent = styled.div<{ isCurrentStep: boolean }>`
  ${({ theme: { palette, spacing }, isCurrentStep }) => `
  display: flex;
  padding: ${spacing(4)};
  background-color: ${colors[palette.mode].background.tertiary};
  border-radius: 50%;
  border: ${spacing(0.625)} solid;
  border-color: ${isCurrentStep ? baseColors.violet.violet500 : colors[palette.mode].background.secondary}
`}
`;

const StyledTransactionStepContent = styled(ContainerBox).attrs({
  flexDirection: 'column',
  justifyContent: 'center',
  fullWidth: true,
  gap: 6,
})<{ isLast: boolean }>`
  ${({ theme: { spacing }, isLast }) => `
  padding-bottom: ${isLast ? '0' : spacing(16)};
`}
`;

const StyledTransactionStepButtonContainer = styled.div`
  display: flex;
  flex: 1;
  padding-top: 15px;
`;

const buildApproveTokenItem = ({
  onAction,
  onActionConfirmed,
  extraData,
  onGoToEtherscan,
  getPendingTransaction,
  hash,
  isLast,
  isCurrentStep,
  explanation,
}: TransactionActionApproveTokenProps) => ({
  content: () => {
    const activeWallet = useActiveWallet();
    const account = activeWallet?.address;
    const { token, amount, isPermit2Enabled, swapper } = extraData;
    const [showReceipt, setShowReceipt] = React.useState(false);
    const receipt = useTransactionReceipt(hash);
    const isPendingTransaction = getPendingTransaction(hash);
    const hasConfirmedRef = React.useRef(false);
    const hasPendingApproval = useHasPendingApproval(token, activeWallet?.address);

    React.useEffect(() => {
      if (hash && !isPendingTransaction && receipt && !hasConfirmedRef.current && onActionConfirmed) {
        hasConfirmedRef.current = true;
        onActionConfirmed(hash);
      }
    }, [hash, isPendingTransaction, receipt]);

    const infiniteBtnText = (
      <FormattedMessage
        description="Allow us to use your coin (modal max)"
        defaultMessage="Authorize Max {symbol}"
        values={{
          symbol: token.symbol,
        }}
      />
    );

    const specificBtnTextAsSecondary = (
      <FormattedMessage
        description="Allow us to use your coin (home exact secondary)"
        defaultMessage="{amount} {symbol}"
        values={{ symbol: token.symbol, amount: formatCurrencyAmount(amount, token, 4) }}
      />
    );

    const specificBtnText = (
      <FormattedMessage
        description="Allow us to use your coin (home exact)"
        defaultMessage="Authorize {amount} {symbol}"
        values={{ symbol: token.symbol, amount: formatCurrencyAmount(amount, token, 4) }}
      />
    );

    const waitingForAppvText = (
      <FormattedMessage
        description="waiting for approval"
        defaultMessage="Waiting for your {symbol} to be authorized"
        values={{
          symbol: token.symbol,
        }}
      />
    );

    return (
      <>
        <TransactionReceipt open={showReceipt} onClose={() => setShowReceipt(false)} transaction={receipt} />
        <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
          <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
            <WalletMoneyIcon />
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent isLast={isLast}>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="body">
              {isPermit2Enabled ? (
                <FormattedMessage
                  description="transationStepApprove"
                  defaultMessage="Enable universal approval for {token}"
                  values={{ token: token.symbol }}
                />
              ) : (
                <FormattedMessage
                  description="transationStepApprove"
                  defaultMessage="Allow {target} to use your {token}"
                  values={{ target: swapper, token: token.symbol }}
                />
              )}
            </Typography>
            <Typography variant="bodySmall">
              <Address trimAddress address={account || ''} />
            </Typography>
          </ContainerBox>
          {!hash ? (
            <ContainerBox gap={3}>
              <Button
                onClick={isPermit2Enabled ? () => onAction() : () => onAction(amount)}
                size="large"
                variant="contained"
                fullWidth
                disabled={hasPendingApproval}
              >
                {hasPendingApproval ? waitingForAppvText : isPermit2Enabled ? infiniteBtnText : specificBtnText}
              </Button>
              {!isPermit2Enabled && (
                <Button
                  onClick={() => onAction(amount)}
                  size="large"
                  variant="contained"
                  color="secondary"
                  disabled={hasPendingApproval}
                >
                  {specificBtnTextAsSecondary}
                </Button>
              )}
            </ContainerBox>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              disabled={isPendingTransaction}
              onClick={() => (receipt && !isPendingTransaction ? setShowReceipt(true) : onGoToEtherscan(hash))}
            >
              {isPendingTransaction ? (
                <CircularProgress size={20} />
              ) : receipt ? (
                <FormattedMessage description="viewReceipt" defaultMessage="View receipt" />
              ) : (
                <FormattedMessage description="viewExplorer" defaultMessage="View in explorer" />
              )}
            </Button>
          )}
          {explanation && (
            <ContainerBox flexDirection="column" gap={1}>
              <Typography variant="bodySmall" fontWeight="bold">
                <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
              </Typography>
              <Typography variant="bodySmall">{explanation}</Typography>
            </ContainerBox>
          )}
        </StyledTransactionStepContent>
      </>
    );
  },
});

const buildApproveTokenSignItem = ({
  onAction,
  extraData,
  step,
  isLast,
  isCurrentStep,
  explanation,
}: TransactionActionApproveTokenSignProps) => ({
  content: () => {
    const activeWallet = useActiveWallet();
    const account = activeWallet?.address;

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
          <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
            <TokenIcon token={extraData.token} size="40px" />
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent isLast={isLast}>
          <Typography variant="body">
            <FormattedMessage
              description="transationStepApproveSign"
              defaultMessage="{step} - Sign token authorization with your wallet"
              values={{ step }}
            />
          </Typography>
          <Typography variant="bodySmall">
            <Address trimAddress address={account || ''} />
          </Typography>
          {isCurrentStep && (
            <StyledTransactionStepButtonContainer>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={() => onAction(extraData.amount)}
              >
                <FormattedMessage description="signWithWallet" defaultMessage="Sign with your wallet" />
              </Button>
            </StyledTransactionStepButtonContainer>
          )}
          {explanation && (
            <StyledExplanation>
              <Tooltip title={explanation} arrow placement="top">
                <Typography variant="bodySmall">
                  <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
                </Typography>
              </Tooltip>
            </StyledExplanation>
          )}
        </StyledTransactionStepContent>
      </>
    );
  },
});

const WaitIcons = {
  disabled: <TokenIcon token={emptyTokenWithAddress('CLOCK')} size="40px" />,
  pending: <CircularProgress size={40} />,
  success: <TokenIcon token={emptyTokenWithAddress('CHECK')} size="40px" />,
  failed: <TokenIcon token={emptyTokenWithAddress('FAILED')} size="40px" />,
};

const buildWaitForSimulationItem = ({
  checkForPending,
  step,
  isLast,
  isCurrentStep,
  done,
  extraData,
  failed,
  explanation,
}: TransactionActionWaitForSimulationProps) => ({
  content: () => {
    const [icon, setIcon] = React.useState<keyof typeof WaitIcons>(
      // eslint-disable-next-line no-nested-ternary
      checkForPending ? 'disabled' : failed ? 'failed' : 'success'
    );

    React.useEffect(() => {
      if (!extraData.simulation && isCurrentStep) {
        setIcon('pending');
      }
      if (extraData.simulation && isCurrentStep) {
        setIcon('success');
      }
      if (failed && isCurrentStep) {
        setIcon('failed');
      }
    }, [extraData]);

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
          <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
            {WaitIcons[icon]}
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent isLast={isLast}>
          <Typography variant="body">
            {failed && (
              <FormattedMessage
                description="transationStepWaitSimulateFailed"
                defaultMessage="{step} - Transaction simulation failed"
                values={{ step }}
              />
            )}
            {checkForPending && !extraData.simulation && isCurrentStep && !failed && (
              <FormattedMessage
                description="transationStepWaitSimulatePending"
                defaultMessage="{step} - The transaction is being simulated"
                values={{ step }}
              />
            )}
            {checkForPending && !extraData.simulation && !isCurrentStep && !failed && (
              <FormattedMessage
                description="transationStepWaitSimulatePending"
                defaultMessage="{step} - The transaction will be simulated"
                values={{ step }}
              />
            )}
            {(checkForPending || done) && extraData.simulation && !failed && (
              <>
                <FormattedMessage
                  description="transationStepWaitSimulateSuccess"
                  defaultMessage="{step} - Transaction simulated"
                  values={{ step }}
                />
                <TransactionSimulation items={extraData.simulation} />
              </>
            )}
          </Typography>
          {explanation && (
            <StyledExplanation>
              <Tooltip title={explanation} arrow placement="top">
                <Typography variant="bodySmall">
                  <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
                </Typography>
              </Tooltip>
            </StyledExplanation>
          )}
        </StyledTransactionStepContent>
      </>
    );
  },
});

const SimulationItem = ({ quotes, step }: { quotes: number; step: number }) => {
  const [timer, setTimer] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (timer < quotes) {
      timerRef.current = setTimeout(() => setTimer(timer + 1), (7 / quotes) * 200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  return (
    <FormattedMessage
      description="transationStepWaitSimulatePending"
      defaultMessage="{step} - Validating quotes to get you the best price ({current}/{total})"
      values={{
        step,
        total: quotes,
        current: timer,
      }}
    />
  );
};

const StyledTopCircularProgress = withStyles(CircularProgress, () =>
  createStyles({
    circle: {
      strokeLinecap: 'round',
    },
  })
);

const StyledCircularContainer = styled.div`
  align-self: stretch;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledBottomCircularProgress = withStyles(CircularProgress, () =>
  createStyles({
    circle: {
      strokeLinecap: 'round',
    },
  })
);

const SimulationItemProgressBar = ({ quotes }: { quotes: number }) => {
  const [timer, setTimer] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (timer < quotes) {
      timerRef.current = setTimeout(() => setTimer(timer + 1), (7 / quotes) * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, quotes]);

  return (
    <StyledCircularContainer>
      <StyledBottomCircularProgress
        size={40}
        variant="determinate"
        value={100}
        thickness={4}
        sx={{ position: 'absolute' }}
      />
      <StyledTopCircularProgress
        size={40}
        variant="determinate"
        value={(1 - (quotes - timer) / quotes) * 100}
        thickness={4}
      />
    </StyledCircularContainer>
  );
};

const buildWaitForQuotesSimulationItem = ({
  checkForPending,
  step,
  isLast,
  isCurrentStep,
  done,
  extraData,
  failed,
  explanation,
}: TransactionActionWaitForQuotesSimulationProps) => ({
  content: () => {
    const [icon, setIcon] = React.useState<keyof typeof WaitIcons>(
      // eslint-disable-next-line no-nested-ternary
      checkForPending ? 'disabled' : failed ? 'failed' : 'success'
    );

    React.useEffect(() => {
      if (!extraData.simulation && isCurrentStep) {
        setIcon('pending');
      }
      if (extraData.simulation && isCurrentStep) {
        setIcon('success');
      }
      if (failed && isCurrentStep) {
        setIcon('failed');
      }
    }, [extraData]);

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
          <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
            {checkForPending && !extraData.simulation && isCurrentStep && !failed ? (
              <SimulationItemProgressBar quotes={extraData.quotes} />
            ) : (
              WaitIcons[icon]
            )}
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent isLast={isLast}>
          <Typography variant="body">
            {failed && (
              <FormattedMessage
                description="transationStepWaitSimulateFailed"
                defaultMessage="{step} - Quotes validation failed"
                values={{ step }}
              />
            )}
            {checkForPending && !extraData.simulation && isCurrentStep && !failed && (
              <SimulationItem quotes={extraData.quotes} step={step} />
            )}
            {checkForPending && !extraData.simulation && !isCurrentStep && !failed && (
              <FormattedMessage
                description="transationStepWaitSimulatePending"
                defaultMessage="{step} - Quotes will be validated"
                values={{ step }}
              />
            )}
            {(checkForPending || done) && extraData.simulation && !failed && (
              <>
                <FormattedMessage
                  description="transationStepWaitSimulationSuccess"
                  defaultMessage="{step} - Quotes validated and transaction simulated"
                  values={{ step }}
                />
                <TransactionSimulation items={extraData.simulation} />
              </>
            )}
          </Typography>
          {explanation && (
            <StyledExplanation>
              <Tooltip title={explanation} arrow placement="top">
                <Typography variant="bodySmall">
                  <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
                </Typography>
              </Tooltip>
            </StyledExplanation>
          )}
        </StyledTransactionStepContent>
      </>
    );
  },
});

const buildWaitForApprovalItem = ({
  hash,
  onAction,
  checkForPending,
  step,
  isLast,
  getPendingTransaction,
  transactions,
  isCurrentStep,
  done,
  explanation,
}: TransactionActionWaitForApprovalProps) => ({
  content: () => {
    const isPendingTransaction = getPendingTransaction(hash);
    const [icon, setIcon] = React.useState<keyof typeof WaitIcons>(checkForPending ? 'disabled' : 'success');

    React.useEffect(() => {
      if (hash && checkForPending && isPendingTransaction && isCurrentStep) {
        setIcon('pending');
      }
      if (hash && checkForPending && !isPendingTransaction && isCurrentStep) {
        setIcon('success');
        onAction(transactions);
      }
    }, [isPendingTransaction, checkForPending, onAction, transactions]);

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
          <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
            {WaitIcons[icon]}
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent isLast={isLast}>
          <Typography variant="body">
            {hash && checkForPending && isPendingTransaction && isCurrentStep && (
              <FormattedMessage
                description="transationStepWaitApproveConfirmed"
                defaultMessage="{step} - Token authorization is being confirmed"
                values={{ step }}
              />
            )}
            {((!hash && checkForPending && !isPendingTransaction) || done) && (
              <FormattedMessage
                description="transationStepWaitApproveSubmitted"
                defaultMessage="{step} - Token authorization is submitted"
                values={{ step }}
              />
            )}
          </Typography>
          {explanation && (
            <StyledExplanation>
              <Tooltip title={explanation} arrow placement="top">
                <Typography variant="bodySmall">
                  <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
                </Typography>
              </Tooltip>
            </StyledExplanation>
          )}
        </StyledTransactionStepContent>
      </>
    );
  },
});

const buildWaitForSignApprovalItem = ({
  hash,
  onAction,
  checkForPending,
  step,
  isLast,
  getPendingTransaction,
  transactions,
  isCurrentStep,
  explanation,
}: TransactionActionWaitForApprovalProps) => ({
  content: () => {
    const isPendingTransaction = getPendingTransaction(hash);
    const [icon, setIcon] = React.useState<keyof typeof WaitIcons>(checkForPending ? 'disabled' : 'success');

    React.useEffect(() => {
      if (hash && checkForPending && isPendingTransaction && isCurrentStep) {
        setIcon('pending');
      }
      if (hash && checkForPending && !isPendingTransaction && isCurrentStep) {
        setIcon('success');
        onAction(transactions);
      }
    }, [isPendingTransaction, checkForPending, onAction, transactions]);

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
          <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
            {WaitIcons[icon]}
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent isLast={isLast}>
          <Typography variant="body">
            <FormattedMessage
              description="transationStepWaitForApproveSubmitted"
              defaultMessage="{step} - The token approval is submitted"
              values={{ step }}
            />
          </Typography>
          {explanation && (
            <StyledExplanation>
              <Tooltip title={explanation} arrow placement="top">
                <Typography variant="bodySmall">
                  <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
                </Typography>
              </Tooltip>
            </StyledExplanation>
          )}
        </StyledTransactionStepContent>
      </>
    );
  },
});

const buildSwapItem = ({
  onAction,
  extraData,
  step,
  isLast,
  isCurrentStep,
  transactions,
  explanation,
}: TransactionActionSwapProps) => ({
  content: () => (
    <>
      <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
        <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
          <TokenIcon token={extraData.to} size="40px" />
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent isLast={isLast}>
        <Typography variant="body">
          <FormattedMessage
            description="transationStepSwapTokens"
            defaultMessage="{step} - Swap tokens"
            values={{ step }}
          />
        </Typography>
        {isCurrentStep && (
          <StyledTransactionStepButtonContainer>
            <Button variant="contained" color="secondary" fullWidth size="large" onClick={() => onAction(transactions)}>
              <FormattedMessage description="swapWallet" defaultMessage="Swap" />
            </Button>
          </StyledTransactionStepButtonContainer>
        )}
        {explanation && (
          <StyledExplanation>
            <Tooltip title={explanation} arrow placement="top">
              <Typography variant="bodySmall">
                <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
              </Typography>
            </Tooltip>
          </StyledExplanation>
        )}
      </StyledTransactionStepContent>
    </>
  ),
});

const buildCreatePositionItem = ({
  onAction,
  extraData,
  step,
  isLast,
  isCurrentStep,
  transactions,
}: TransactionActionCreatePositionProps) => ({
  content: () => (
    <>
      <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
        <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
          <TokenIcon token={extraData.to} size="40px" />
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent isLast={isLast}>
        <Typography variant="body">
          <FormattedMessage
            description="transationStepSwapTokens"
            defaultMessage="{step} - Create position"
            values={{ step }}
          />
        </Typography>
        {isCurrentStep && (
          <StyledTransactionStepButtonContainer>
            <Button variant="contained" color="secondary" fullWidth size="large" onClick={() => onAction(transactions)}>
              <FormattedMessage description="createPositionWallet" defaultMessage="Create position" />
            </Button>
          </StyledTransactionStepButtonContainer>
        )}
      </StyledTransactionStepContent>
    </>
  ),
});

type TransactionActionProps =
  | TransactionActionApproveTokenProps
  | TransactionActionApproveTokenSignProps
  | TransactionActionWaitForApprovalProps
  | TransactionActionWaitForSimulationProps
  | TransactionActionWaitForQuotesSimulationProps
  | TransactionActionSwapProps
  | TransactionActionCreatePositionProps;

const ITEMS_MAP: Record<TransactionActionType, (props: TransactionActionProps) => { content: () => JSX.Element }> = {
  [TRANSACTION_ACTION_APPROVE_TOKEN]: buildApproveTokenItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN]: buildApproveTokenSignItem,
  [TRANSACTION_ACTION_WAIT_FOR_APPROVAL]: buildWaitForApprovalItem,
  [TRANSACTION_ACTION_WAIT_FOR_SIGN_APPROVAL]: buildWaitForSignApprovalItem,
  [TRANSACTION_ACTION_WAIT_FOR_SIMULATION]: buildWaitForSimulationItem,
  [TRANSACTION_ACTION_WAIT_FOR_QUOTES_SIMULATION]: buildWaitForQuotesSimulationItem,
  [TRANSACTION_ACTION_SWAP]: buildSwapItem,
  [TRANSACTION_ACTION_CREATE_POSITION]: buildCreatePositionItem,
};

const TransactionSteps = ({
  shouldShow,
  handleClose,
  transactions,
  onAction,
  onActionConfirmed,
}: TransactionConfirmationProps) => {
  const getPendingTransaction = useIsTransactionPending();
  const currentNetwork = useSelectedNetwork();
  const intl = useIntl();

  const onGoToEtherscan = (transaction: string) => {
    const url = buildEtherscanTransaction(transaction, currentNetwork.chainId);
    window.open(url, '_blank');
  };

  const currentStep = findIndex(transactions, { done: false });

  return (
    <Slide direction="up" in={shouldShow}>
      <StyledOverlay>
        <ContainerBox flexDirection="column" gap={12} fullWidth>
          <BackControl
            onClick={handleClose}
            label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
          />
          <Divider />
          <ContainerBox flexDirection="column">
            {transactions.map((transaction, index) => {
              const { type, hash } = transaction;
              const step = index + 1;
              const isLast = step === transactions.length;
              const isCurrentStep = currentStep === index;

              const item = ITEMS_MAP[transaction.type]({
                ...transaction,
                transactions,
                onGoToEtherscan,
                getPendingTransaction,
                step,
                isLast,
                isCurrentStep,
                onAction,
                onActionConfirmed,
              });
              return (
                <ContainerBox gap={8} alignItems="start" key={`${type}-${hash}-${step}`}>
                  <item.content />
                </ContainerBox>
              );
            })}
          </ContainerBox>
        </ContainerBox>
      </StyledOverlay>
    </Slide>
  );
};

// TransactionSteps.whyDidYouRender = true;

const memoed = memo(TransactionSteps);

// memoed.whyDidYouRender = true;
export default memoed;
