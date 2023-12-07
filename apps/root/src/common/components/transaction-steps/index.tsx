import React, { memo } from 'react';
import styled from 'styled-components';
import findIndex from 'lodash/findIndex';
import { useIsTransactionPending } from '@state/transactions/hooks';
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
  AllowanceType,
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
import { FormattedMessage } from 'react-intl';
import ArrowLeft from '@assets/svg/atom/arrow-left';
import { Typography, CircularProgress, Tooltip, IconButton, Slide, createStyles, Button, baseColors } from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import Address from '@common/components/address';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import AllowanceSplitButton from '@common/components/allowance-split-button';
import TransactionSimulation from '@common/components/transaction-simulation';
import useActiveWallet from '@hooks/useActiveWallet';

const StyledIconButton = styled(IconButton)`
  margin-right: 5px;
`;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  padding: 24px 0px;
  display: flex;
`;

const StyledTransactionStepsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledGoBackContainer = styled.div`
  display: flex;
  padding: 0px 24px;
`;

const StyledTransactionSteps = styled.div`
  display: flex;
  flex-direction: column;
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
  isFirst: boolean;
  isCurrentStep: boolean;
}

interface TransactionActionApproveToken extends TransactionActionBase {
  type: TransactionActionApproveTokenType;
  extraData: TransactionActionApproveTokenData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: BigNumber) => void;
}

interface TransactionActionApproveTokenProps extends TransactionActionApproveToken, ItemProps {}

interface TransactionActionApproveTokenSign extends TransactionActionBase {
  type: TransactionActionApproveTokenSignType;
  extraData: TransactionActionApproveTokenData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: BigNumber) => void;
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
}

const StyledTransactionStep = styled.div<{ isLast: boolean; isCurrentStep: boolean }>`
  display: flex;
  gap: 24px;
  padding: 0px 24px 0px 24px;
  ${({ isLast }) => (!isLast ? `border-bottom: 1px solid ${baseColors.greyscale.greyscale3};` : '')}
  ${({ isCurrentStep }) => (!isCurrentStep ? `color: ${baseColors.disabledText};` : '')}
`;

const StyledTransactionStepIcon = styled.div<{ isFirst: boolean; isLast: boolean }>`
  display: flex;
  position: relative;
  padding-top: 24px;
  padding-bottom: 24px;
  &:after {
    content: '';
    position: absolute;
    left: calc(50% - 1px);
    top: 0px;
    right: 0px;
    bottom: 0;
    border-left: 1px dashed ${baseColors.disabledText};
    z-index: -1;
    ${({ isFirst }) => (isFirst ? 'top: 24px;' : '')}
    ${({ isLast }) => (isLast ? 'bottom: calc(100% - 24px);' : '')}
  }
`;

const StyledTransactionStepIconContent = styled.div`
  display: flex;
  align-self: flex-start;
`;

const StyledTransactionStepContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding-top: 24px;
  padding-bottom: 24px;
`;

const StyledTransactionStepButtonContainer = styled.div`
  display: flex;
  flex: 1;
  padding-top: 15px;
`;

const buildApproveTokenItem = ({
  onAction,
  extraData,
  onGoToEtherscan,
  hash,
  step,
  isLast,
  isFirst,
  isCurrentStep,
  done,
  explanation,
}: TransactionActionApproveTokenProps) => ({
  content: () => {
    const activeWallet = useActiveWallet();
    const account = activeWallet?.address;

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>
            <TokenIcon token={extraData.token} size="40px" />
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
          <Typography variant="body">
            {extraData.isPermit2Enabled ? (
              <FormattedMessage
                description="transationStepApprove"
                defaultMessage="{step} - Enable universal approval for {token}"
                values={{ step, target: extraData.swapper, token: extraData.token.symbol }}
              />
            ) : (
              <FormattedMessage
                description="transationStepApprove"
                defaultMessage="{step} - Allow {target} to use your {token}"
                values={{ step, target: extraData.swapper, token: extraData.token.symbol }}
              />
            )}
          </Typography>
          <Typography variant="bodySmall">
            <Address trimAddress address={account || ''} />
          </Typography>
          {isCurrentStep && (
            <StyledTransactionStepButtonContainer>
              <AllowanceSplitButton
                onMaxApprove={() => onAction()}
                onApproveExact={(amount) => onAction(amount)}
                amount={extraData.amount}
                token={extraData.token}
                target={extraData.swapper}
                tokenYield={null}
                color="secondary"
                defaultApproval={extraData.defaultApproval || AllowanceType.specific}
                tooltipText={extraData.help}
                hideTooltip
              />
            </StyledTransactionStepButtonContainer>
          )}
          {!isCurrentStep && done && (
            <StyledTransactionStepButtonContainer>
              <Button variant="outlined" color="primary" fullWidth size="large" onClick={() => onGoToEtherscan(hash)}>
                <FormattedMessage description="viewReceipt" defaultMessage="View receipt" />
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

const buildApproveTokenSignItem = ({
  onAction,
  extraData,
  step,
  isLast,
  isFirst,
  isCurrentStep,
  explanation,
}: TransactionActionApproveTokenSignProps) => ({
  content: () => {
    const activeWallet = useActiveWallet();
    const account = activeWallet?.address;

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>
            <TokenIcon token={extraData.token} size="40px" />
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
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
  isFirst,
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
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>{WaitIcons[icon]}</StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
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
  isFirst,
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
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>
            {checkForPending && !extraData.simulation && isCurrentStep && !failed ? (
              <SimulationItemProgressBar quotes={extraData.quotes} />
            ) : (
              WaitIcons[icon]
            )}
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
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
  isFirst,
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
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>{WaitIcons[icon]}</StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
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
  isFirst,
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
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>{WaitIcons[icon]}</StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
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
  isFirst,
  isCurrentStep,
  transactions,
  explanation,
}: TransactionActionSwapProps) => ({
  content: () => (
    <>
      <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
        <StyledTransactionStepIconContent>
          <TokenIcon token={extraData.to} size="40px" />
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent>
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
  isFirst,
  isCurrentStep,
  transactions,
}: TransactionActionCreatePositionProps) => ({
  content: () => (
    <>
      <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
        <StyledTransactionStepIconContent>
          <TokenIcon token={extraData.to} size="40px" />
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent>
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

const TransactionSteps = ({ shouldShow, handleClose, transactions, onAction }: TransactionConfirmationProps) => {
  const getPendingTransaction = useIsTransactionPending();
  const currentNetwork = useSelectedNetwork();

  const onGoToEtherscan = (transaction: string) => {
    const url = buildEtherscanTransaction(transaction, currentNetwork.chainId);
    window.open(url, '_blank');
  };

  const currentStep = findIndex(transactions, { done: false });

  return (
    <Slide direction="up" in={shouldShow}>
      <StyledOverlay>
        <StyledTransactionStepsContainer>
          <StyledGoBackContainer>
            <StyledIconButton aria-label="close" size="small" onClick={handleClose}>
              <ArrowLeft size="20px" />
            </StyledIconButton>
            <Typography variant="h6">
              <FormattedMessage description="goBack" defaultMessage="Back" />
            </Typography>
          </StyledGoBackContainer>
          <StyledTransactionSteps>
            {transactions.map((transaction, index) => {
              const { type, hash } = transaction;
              const step = index + 1;
              const isFirst = index === 0;
              const isLast = step === transactions.length;
              const isCurrentStep = currentStep === index;

              const item = ITEMS_MAP[transaction.type]({
                ...transaction,
                transactions,
                onGoToEtherscan,
                getPendingTransaction,
                step,
                isFirst,
                isLast,
                isCurrentStep,
                onAction,
              });
              return (
                <StyledTransactionStep key={`${type}-${hash}-${step}`} isLast={isLast} isCurrentStep={isCurrentStep}>
                  <item.content />
                </StyledTransactionStep>
              );
            })}
          </StyledTransactionSteps>
        </StyledTransactionStepsContainer>
      </StyledOverlay>
    </Slide>
  );
};

// TransactionSteps.whyDidYouRender = true;

const memoed = memo(TransactionSteps);

// memoed.whyDidYouRender = true;
export default memoed;
