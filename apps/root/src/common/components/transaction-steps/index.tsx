import React, { memo } from 'react';
import styled from 'styled-components';
import findIndex from 'lodash/findIndex';
import { useHasPendingApproval, useIsTransactionPending } from '@state/transactions/hooks';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import {
  TransactionActionApproveTokenType,
  TransactionActionApproveTokenData,
  TransactionActionWaitForApprovalType,
  TransactionActionWaitForApprovalData,
  TransactionActionSwapType,
  TransactionActionSwapData,
  TransactionActionType,
  TransactionActionWaitForSimulationType,
  TransactionActionWaitForSimulationData,
  BlowfishResponse,
  TransactionActionCreatePositionType,
  TransactionActionCreatePositionData,
  SignStatus,
  TransactionActionApproveTokenSignSwapData,
  TransactionActionApproveTokenSignDCAData,
  TransactionActionApproveTokenSignDCAType,
  TransactionActionApproveTokenSignSwapType,
  SetStateCallback,
} from '@types';
import {
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
  TRANSACTION_ACTION_CREATE_POSITION,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP,
} from '@constants';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import {
  Typography,
  CircularProgress,
  Tooltip,
  Slide,
  Button,
  colors,
  baseColors,
  BackControl,
  Divider,
  ContainerBox,
  WalletMoneyIcon,
  TransactionReceipt,
  TickCircleIcon,
  WalletCheckIcon,
  useTheme,
} from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import Address from '@common/components/address';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import TransactionSimulation from '@common/components/transaction-simulation';
import useActiveWallet from '@hooks/useActiveWallet';
import useTransactionReceipt from '@hooks/useTransactionReceipt';
import { DollarSquareIcon } from 'ui-library/src/icons';

const StyledOverlay = styled.div`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
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
  isLast: boolean;
  isCurrentStep: boolean;
  done?: boolean;
  explanation?: string;
}

interface TransactionActionApproveToken extends TransactionActionBase {
  type: TransactionActionApproveTokenType;
  extraData: TransactionActionApproveTokenData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: bigint) => void;
  onActionConfirmed?: (hash: string) => void;
}

interface TransactionActionApproveTokenProps extends TransactionActionApproveToken, ItemProps {}

interface TransactionActionApproveTokenSignDCA extends TransactionActionBase {
  type: TransactionActionApproveTokenSignDCAType;
  extraData: TransactionActionApproveTokenSignDCAData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: bigint) => void;
}

interface TransactionActionApproveTokenSignDCAProps extends TransactionActionApproveTokenSignDCA, ItemProps {}

interface TransactionActionApproveTokenSignSwap extends TransactionActionBase {
  type: TransactionActionApproveTokenSignSwapType;
  extraData: TransactionActionApproveTokenSignSwapData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: bigint) => void;
}

interface TransactionActionApproveTokenSignSwapProps extends TransactionActionApproveTokenSignSwap, ItemProps {}

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

type TransactionActionApproveTokenSign = TransactionActionApproveTokenSignDCA | TransactionActionApproveTokenSignSwap;

type TransactionActionApproveTokenSignProps =
  | TransactionActionApproveTokenSignDCAProps
  | TransactionActionApproveTokenSignSwapProps;

export type TransactionAction =
  | TransactionActionApproveToken
  | TransactionActionApproveTokenSign
  | TransactionActionWaitForApproval
  | TransactionActionWaitForSimulation
  | TransactionActionSwap
  | TransactionActionCreatePosition;
type TransactionActions = TransactionAction[];

type TransactionActionProps =
  | TransactionActionApproveTokenProps
  | TransactionActionApproveTokenSignProps
  | TransactionActionWaitForApprovalProps
  | TransactionActionWaitForSimulationProps
  | TransactionActionSwapProps
  | TransactionActionCreatePositionProps;

type CommonTransactionActionProps = Omit<ItemProps, 'getPendingTransaction' | 'onGoToEtherscan'> & {
  title: React.ReactElement;
  icon: React.ReactElement;
  isLoading?: boolean;
  hideWalletLabel?: boolean;
};

interface TransactionConfirmationProps {
  shouldShow: boolean;
  handleClose: () => void;
  transactions: TransactionActions;
  onAction: () => void;
  onActionConfirmed?: (hash: string) => void;
  recapData: React.ReactElement;
  setShouldShowFirstStep: SetStateCallback<boolean>;
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
    background: ${isCurrentStep ? palette.gradient.main : colors[palette.mode].background.secondary};
  }`
  }
`}
`;

const StyledTransactionStepIconContent = styled.div<{ isCurrentStep: boolean; done?: boolean }>`
  ${({ theme: { palette, spacing }, isCurrentStep, done }) => `
  display: flex;
  padding: ${spacing(4)};
  background-color: ${colors[palette.mode].background.tertiary};
  border-radius: 50%;
  border: ${spacing(0.625)} solid;
  border-color: ${isCurrentStep ? colors[palette.mode].violet.violet500 : colors[palette.mode].background.secondary};
  ${isCurrentStep ? `box-shadow: ${baseColors.dropShadow.dropShadow100}` : ''};
  z-index: 99;
  & .MuiSvgIcon-root {
    color: ${done ? colors[palette.mode].violet.violet400 : colors[palette.mode].violet.violet600};
  }
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

const StyledTransactionStepTitle = styled(Typography).attrs({ variant: 'h5' })<{ isCurrentStep: boolean }>`
  ${({ theme: { palette }, isCurrentStep }) => `
  font-weight: bold;
  color: ${isCurrentStep ? colors[palette.mode].typography.typo1 : colors[palette.mode].typography.typo3};
  `}
`;

const StyledTransactionStepWallet = styled(Typography).attrs({ variant: 'bodyLarge' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
  `}
`;

const StyledTickCircleIcon = styled(TickCircleIcon)`
  color: ${({ theme: { palette } }) => colors[palette.mode].semantic.success.darker};
`;

const CommonTransactionStepItem = ({
  isLast,
  isCurrentStep,
  done,
  title,
  icon,
  explanation,
  children,
  isLoading,
  hideWalletLabel,
}: React.PropsWithChildren<CommonTransactionActionProps>) => {
  const activeWallet = useActiveWallet();
  const account = activeWallet?.address;
  const { spacing } = useTheme();

  return (
    <>
      <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
        <StyledTransactionStepIconContent isCurrentStep={isCurrentStep} done={done}>
          {isLoading ? <CircularProgress size={spacing(6)} thickness={5} /> : icon}
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent isLast={isLast}>
        <ContainerBox flexDirection="column" gap={1}>
          <StyledTransactionStepTitle isCurrentStep={isCurrentStep}>{title}</StyledTransactionStepTitle>
          {!hideWalletLabel && (
            <StyledTransactionStepWallet>
              <Address trimAddress address={account || ''} />
            </StyledTransactionStepWallet>
          )}
        </ContainerBox>
        {children}
        {explanation && isCurrentStep && (
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
};

const TransactionStepSuccessLabel = ({ label }: { label: React.ReactElement }) => (
  <ContainerBox gap={2} alignItems="center">
    <StyledTickCircleIcon />
    <Typography variant="body" fontWeight="600">
      {label}
    </Typography>
  </ContainerBox>
);

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
  done,
}: TransactionActionApproveTokenProps) => ({
  content: () => {
    const activeWallet = useActiveWallet();
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

    const stepTitle = isPermit2Enabled ? (
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
    );

    return (
      <>
        <TransactionReceipt open={showReceipt} onClose={() => setShowReceipt(false)} transaction={receipt} />
        <CommonTransactionStepItem
          isLast={isLast}
          isCurrentStep={isCurrentStep}
          done={done}
          explanation={explanation}
          icon={<WalletMoneyIcon />}
          title={stepTitle}
          isLoading={isPendingTransaction}
        >
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
              {isPermit2Enabled && (
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
            <ContainerBox gap={4} alignItems="center">
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                disabled={isPendingTransaction}
                onClick={() => (receipt && !isPendingTransaction ? setShowReceipt(true) : onGoToEtherscan(hash))}
              >
                {receipt && !isPendingTransaction ? (
                  <FormattedMessage description="viewReceipt" defaultMessage="View receipt" />
                ) : (
                  <FormattedMessage description="viewExplorer" defaultMessage="View in explorer" />
                )}
              </Button>
              {!isPendingTransaction && receipt && (
                <TransactionStepSuccessLabel
                  label={
                    <FormattedMessage
                      description="approveAmount"
                      defaultMessage="Approve {amount} {symbol}"
                      values={{
                        symbol: token.symbol,
                        amount: formatCurrencyAmount(amount, token, 4),
                      }}
                    />
                  }
                />
              )}
            </ContainerBox>
          )}
        </CommonTransactionStepItem>
      </>
    );
  },
});

const buildApproveTokenSignItem = ({
  onAction,
  extraData,
  isLast,
  isCurrentStep,
  explanation,
  done,
  failed,
  type,
}: TransactionActionApproveTokenSignProps) => ({
  content: () => {
    const [isSigning, setIsSigning] = React.useState(false);

    React.useEffect(() => {
      if (isSigning) {
        setIsSigning(false);
      }
    }, [extraData.signStatus]);

    let stepSuccessLabels = <></>;
    let isLoadingQuoteSimulations = false;

    if (type === TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA) {
      stepSuccessLabels = (
        <TransactionStepSuccessLabel
          label={<FormattedMessage description="signTransactionStep" defaultMessage="Token authorization signed" />}
        />
      );
    } else if (type === TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP) {
      isLoadingQuoteSimulations =
        extraData.signStatus === SignStatus.signed && !extraData.simulation && isCurrentStep && !failed;
      stepSuccessLabels = (
        <ContainerBox flexDirection="column" gap={2}>
          <TransactionStepSuccessLabel
            label={
              <FormattedMessage
                description="signSwapSellAmount"
                defaultMessage="Sell {amount} {symbol}"
                values={{
                  symbol: extraData.from.symbol,
                  amount: formatCurrencyAmount(extraData.fromAmount, extraData.from, 4),
                }}
              />
            }
          />
          <TransactionStepSuccessLabel
            label={
              <FormattedMessage
                description="signSwapBuyAmount"
                defaultMessage="Buy {amount} {symbol} on {swapper}"
                values={{
                  symbol: extraData.to.symbol,
                  amount: formatCurrencyAmount(extraData.toAmount, extraData.to, 4),
                  swapper: extraData.swapper,
                }}
              />
            }
          />
        </ContainerBox>
      );
    }

    const handleSign = () => {
      setIsSigning(true);
      if (!isLoadingQuoteSimulations) {
        onAction('fromAmount' in extraData ? extraData.fromAmount : undefined);
      }
    };

    return (
      <>
        <CommonTransactionStepItem
          isLast={isLast}
          isCurrentStep={isCurrentStep}
          done={done}
          icon={<WalletCheckIcon />}
          title={
            <FormattedMessage
              description="transationStepApproveSign"
              defaultMessage="Sign token authorization with your wallet"
            />
          }
          isLoading={isSigning || isLoadingQuoteSimulations}
          explanation={explanation}
        >
          {isCurrentStep && (
            <Button variant="contained" fullWidth size="large" onClick={handleSign}>
              {isSigning ? (
                <FormattedMessage description="signing" defaultMessage="Signing..." />
              ) : isLoadingQuoteSimulations ? (
                <FormattedMessage description="simulatingQuotes" defaultMessage="Simulating quotes..." />
              ) : (
                <FormattedMessage description="signWithWallet" defaultMessage="Sign with your wallet" />
              )}
            </Button>
          )}
          {done && stepSuccessLabels}
        </CommonTransactionStepItem>
      </>
    );
  },
});

const WaitIcons = {
  disabled: <TokenIcon token={emptyTokenWithAddress('CLOCK')} size={6} />,
  pending: <CircularProgress size={24} />,
  success: <TokenIcon token={emptyTokenWithAddress('CHECK')} size={6} />,
  failed: <TokenIcon token={emptyTokenWithAddress('FAILED')} size={6} />,
};

const buildWaitForSimulationItem = ({
  checkForPending,
  isLast,
  isCurrentStep,
  done,
  extraData,
  failed,
  explanation,
}: TransactionActionWaitForSimulationProps) => ({
  content: () => {
    const isLoadingSimulations = !extraData.simulation && isCurrentStep;

    const [icon, setIcon] = React.useState<keyof typeof WaitIcons>(
      // eslint-disable-next-line no-nested-ternary
      checkForPending ? 'disabled' : failed ? 'failed' : 'success'
    );

    React.useEffect(() => {
      if (extraData.simulation && isCurrentStep) {
        setIcon('success');
      }
      if (failed && isCurrentStep) {
        setIcon('failed');
      }
    }, [extraData]);

    const stepTitle = (
      <>
        {failed && (
          <FormattedMessage
            description="transationStepWaitSimulateFailed"
            defaultMessage="Transaction simulation failed"
          />
        )}
        {checkForPending && !extraData.simulation && isCurrentStep && !failed && (
          <FormattedMessage
            description="transationStepWaitSimulatePending"
            defaultMessage="The transaction is being simulated"
          />
        )}
        {checkForPending && !extraData.simulation && !isCurrentStep && !failed && (
          <FormattedMessage
            description="transationStepWaitSimulatePending"
            defaultMessage="The transaction will be simulated"
          />
        )}
        {(checkForPending || done) && extraData.simulation && !failed && (
          <>
            <FormattedMessage description="transationStepWaitSimulateSuccess" defaultMessage="Transaction simulated" />
            <TransactionSimulation items={extraData.simulation} />
          </>
        )}
      </>
    );

    return (
      <CommonTransactionStepItem
        isLast={isLast}
        isCurrentStep={isCurrentStep}
        done={done}
        icon={WaitIcons[icon]}
        title={stepTitle}
        isLoading={isLoadingSimulations}
        explanation={explanation}
        hideWalletLabel
      ></CommonTransactionStepItem>
    );
  },
});

const buildWaitForApprovalItem = ({
  hash,
  onAction,
  checkForPending,
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
                defaultMessage="Token authorization is being confirmed"
              />
            )}
            {((!hash && checkForPending && !isPendingTransaction) || done) && (
              <FormattedMessage
                description="transationStepWaitApproveSubmitted"
                defaultMessage="Token authorization is submitted"
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

const buildSwapItem = ({ onAction, isLast, isCurrentStep, transactions, done }: TransactionActionSwapProps) => ({
  content: () => (
    <CommonTransactionStepItem
      isLast={isLast}
      isCurrentStep={isCurrentStep}
      done={done}
      icon={<DollarSquareIcon />}
      title={<FormattedMessage description="transationStepSwapTokens" defaultMessage="Swap tokens" />}
    >
      {isCurrentStep && (
        <StyledTransactionStepButtonContainer>
          <Button variant="contained" fullWidth size="large" onClick={() => onAction(transactions)}>
            <FormattedMessage description="swapWallet" defaultMessage="Swap" />
          </Button>
        </StyledTransactionStepButtonContainer>
      )}
    </CommonTransactionStepItem>
  ),
});

const buildCreatePositionItem = ({
  onAction,
  extraData,
  isLast,
  isCurrentStep,
  transactions,
}: TransactionActionCreatePositionProps) => ({
  content: () => (
    <>
      <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
        <StyledTransactionStepIconContent isCurrentStep={isCurrentStep}>
          <TokenIcon token={extraData.to} size={10} />
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent isLast={isLast}>
        <Typography variant="body">
          <FormattedMessage description="transationStepSwapTokens" defaultMessage="Create position" />
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

const ITEMS_MAP: Record<TransactionActionType, (props: TransactionActionProps) => { content: () => JSX.Element }> = {
  [TRANSACTION_ACTION_APPROVE_TOKEN]: buildApproveTokenItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP]: buildApproveTokenSignItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA]: buildApproveTokenSignItem,
  [TRANSACTION_ACTION_WAIT_FOR_APPROVAL]: buildWaitForApprovalItem,
  [TRANSACTION_ACTION_WAIT_FOR_SIMULATION]: buildWaitForSimulationItem,
  [TRANSACTION_ACTION_SWAP]: buildSwapItem,
  [TRANSACTION_ACTION_CREATE_POSITION]: buildCreatePositionItem,
};

const TransactionSteps = ({
  shouldShow,
  handleClose,
  transactions,
  onAction,
  onActionConfirmed,
  recapData,
  setShouldShowFirstStep,
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
    <Slide
      direction="up"
      in={shouldShow}
      mountOnEnter
      unmountOnExit
      onExited={() => setShouldShowFirstStep(true)}
      onEnter={() => setShouldShowFirstStep(false)}
    >
      <StyledOverlay>
        <ContainerBox flexDirection="column" gap={10} fullWidth>
          <BackControl
            onClick={handleClose}
            label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
          />
          {recapData}
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
