import React, { memo } from 'react';
import styled from 'styled-components';
import findIndex from 'lodash/findIndex';
import { useHasPendingApproval, useIsTransactionPending } from '@state/transactions/hooks';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import {
  TransactionActionApproveTokenType,
  TransactionActionApproveTokenData,
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
  TransactionApplicationIdentifier,
  TransactionEventTypes,
  TransactionActionApproveTokenSignEarnData,
  TransactionActionApproveTokenSignEarnType,
  TransactionActionEarnDepositData,
  TransactionActionEarnDepositType,
  TransactionActionApproveCompanionSignEarnType,
  TransactionActionApproveCompanionSignEarnData,
  TransactionActionEarnWithdrawType,
  TransactionActionEarnWithdrawData,
  TransactionActionEarnSignToSType,
  TransactionActionSignToSEarnData,
  EarnPermission,
} from '@types';
import {
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
  TRANSACTION_ACTION_CREATE_POSITION,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN,
  TRANSACTION_ACTION_EARN_DEPOSIT,
  TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN,
  TRANSACTION_ACTION_EARN_WITHDRAW,
  TRANSACTION_ACTION_SIGN_TOS_EARN,
} from '@constants';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import {
  Typography,
  CircularProgress,
  Slide,
  Button,
  colors,
  BackControl,
  DividerBorder1,
  ContainerBox,
  WalletMoneyIcon,
  TransactionReceipt,
  TickCircleIcon,
  WalletCheckIcon,
  useTheme,
  DollarSquareIcon,
} from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import Address from '@common/components/address';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import TransactionSimulation from '@common/components/transaction-simulation';
import useActiveWallet from '@hooks/useActiveWallet';
import useTransactionReceipt from '@hooks/useTransactionReceipt';
import QuoteStatusNotification, {
  QuoteStatus,
} from '@pages/aggregator/swap-container/components/quote-status-notification';
import { SuccessTickIcon } from 'ui-library/src/icons';
import { totalSupplyThreshold } from '@common/utils/parsing';
import RecapData, { RecapDataProps } from './recap-data';

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
  onGoToEtherscan: (hash: string) => void;
  isLast: boolean;
  isCurrentStep: boolean;
  done?: boolean;
  explanation?: string;
}

interface TransactionActionEarnSignToS extends TransactionActionBase {
  type: TransactionActionEarnSignToSType;
  extraData: TransactionActionSignToSEarnData;
  onAction: () => void;
  onActionConfirmed?: (hash: string) => void;
}

interface TransactionActionEarnSignToSProps extends TransactionActionEarnSignToS, ItemProps {}

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

interface TransactionActionApproveTokenSignEarn extends TransactionActionBase {
  type: TransactionActionApproveTokenSignEarnType;
  extraData: TransactionActionApproveTokenSignEarnData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: bigint) => void;
}

interface TransactionActionApproveTokenSignEarnProps extends TransactionActionApproveTokenSignEarn, ItemProps {}

interface TransactionActionApproveTokenSignSwap extends TransactionActionBase {
  type: TransactionActionApproveTokenSignSwapType;
  extraData: TransactionActionApproveTokenSignSwapData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (amount?: bigint) => void;
}

interface TransactionActionApproveTokenSignSwapProps extends TransactionActionApproveTokenSignSwap, ItemProps {}

interface TransactionActionWaitForSimulation extends DistributiveOmit<TransactionActionBase, 'onAction'> {
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

interface TransactionActionEarnDeposit extends TransactionActionBase {
  type: TransactionActionEarnDepositType;
  extraData: TransactionActionEarnDepositData;
}

interface TransactionActionEarnDepositProps extends TransactionActionEarnDeposit, ItemProps {}

interface TransactionActionCreatePosition extends TransactionActionBase {
  type: TransactionActionCreatePositionType;
  extraData: TransactionActionCreatePositionData;
}

interface TransactionActionCreatePositionProps extends TransactionActionCreatePosition, ItemProps {}

interface TransactionActionApproveCompanionSignEarn extends DistributiveOmit<TransactionActionBase, 'onAction'> {
  type: TransactionActionApproveCompanionSignEarnType;
  extraData: TransactionActionApproveCompanionSignEarnData;
  onAction: () => void;
}

interface TransactionActionApproveCompanionSignEarnProps extends TransactionActionApproveCompanionSignEarn, ItemProps {}

interface TransactionActionEarnWithdraw extends TransactionActionBase {
  type: TransactionActionEarnWithdrawType;
  extraData: TransactionActionEarnWithdrawData;
}

interface TransactionActionEarnWithdrawProps extends TransactionActionEarnWithdraw, ItemProps {}

type TransactionActionTypeApproveCompanionSign = TransactionActionApproveCompanionSignEarn;

type TransactionActionApproveCompanionSignProps = TransactionActionApproveCompanionSignEarnProps;

type TransactionActionApproveTokenSign =
  | TransactionActionApproveTokenSignDCA
  | TransactionActionApproveTokenSignSwap
  | TransactionActionApproveTokenSignEarn;

type TransactionActionApproveTokenSignProps =
  | TransactionActionApproveTokenSignDCAProps
  | TransactionActionApproveTokenSignEarnProps
  | TransactionActionApproveTokenSignSwapProps;

export type TransactionAction =
  | TransactionActionApproveToken
  | TransactionActionApproveTokenSign
  | TransactionActionWaitForSimulation
  | TransactionActionSwap
  | TransactionActionEarnDeposit
  | TransactionActionCreatePosition
  | TransactionActionTypeApproveCompanionSign
  | TransactionActionEarnWithdraw
  | TransactionActionEarnSignToS;

type TransactionActions = TransactionAction[];

type TransactionActionProps =
  | TransactionActionApproveTokenProps
  | TransactionActionApproveTokenSignProps
  | TransactionActionWaitForSimulationProps
  | TransactionActionSwapProps
  | TransactionActionEarnDepositProps
  | TransactionActionCreatePositionProps
  | TransactionActionApproveCompanionSignProps
  | TransactionActionEarnWithdrawProps
  | TransactionActionEarnSignToSProps;

type CommonTransactionActionProps = DistributiveOmit<ItemProps, 'onGoToEtherscan'> & {
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
  setShouldShowFirstStep: SetStateCallback<boolean>;
  swapQuoteStatus?: QuoteStatus;
  applicationIdentifier: TransactionApplicationIdentifier;
  setHeight?: (a?: number) => void;
  recapDataProps?: RecapDataProps;
}

const StyledTransactionStepIcon = styled.div<{ isLast: boolean; isCurrentStep: boolean }>`
  ${({ theme: { palette, spacing }, isLast, isCurrentStep }) => `
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

const iconContentBorderColor = (mode: 'light' | 'dark', isCurrentStep: boolean, done?: boolean) => {
  if (done) {
    return colors[mode].border.border1;
  }
  return isCurrentStep ? colors[mode].violet.violet500 : colors[mode].background.secondary;
};

const iconContentBackgroundColor = (mode: 'light' | 'dark', isCurrentStep: boolean, done?: boolean) => {
  if (done) {
    return colors[mode].background.quartery;
  }
  return colors[mode].background.tertiary;
};

const iconContentColor = (mode: 'light' | 'dark', isCurrentStep: boolean, done?: boolean) => {
  if (done) {
    return colors[mode].semantic.success.primary;
  }
  return colors[mode].violet.violet600;
};

const StyledTransactionStepIconContent = styled.div<{ isCurrentStep: boolean; done?: boolean }>`
  ${({ theme: { palette, spacing }, isCurrentStep, done }) => `
  display: flex;
  padding: ${spacing(4)};
  background-color: ${iconContentBackgroundColor(palette.mode, isCurrentStep, done)};
  border-radius: 50%;
  border: ${spacing(0.875)} solid;
  border-color: ${iconContentBorderColor(palette.mode, isCurrentStep, done)};
  ${isCurrentStep ? `box-shadow: ${colors[palette.mode].dropShadow.dropShadow100}` : ''};
  z-index: 99;
  & .MuiSvgIcon-root {
    color: ${iconContentColor(palette.mode, isCurrentStep, done)};
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
  padding-bottom: ${isLast ? '0' : spacing(12)};
`}
`;

const StyledTransactionStepButtonContainer = styled.div`
  display: flex;
  flex: 1;
  padding-top: 15px;
`;

const StyledTransactionStepTitle = styled(Typography).attrs({ variant: 'h5Bold' })<{
  $isCurrentStep: boolean;
}>`
  ${({ theme: { palette }, $isCurrentStep }) => `
  color: ${$isCurrentStep ? colors[palette.mode].typography.typo1 : colors[palette.mode].typography.typo3};
  `}
`;

const StyledTransactionStepWallet = styled(Typography).attrs({ variant: 'bodySmallSemibold' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
  `}
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
          {isLoading ? <CircularProgress size={spacing(6)} thickness={5} /> : done ? <SuccessTickIcon /> : icon}
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent isLast={isLast}>
        <ContainerBox flexDirection="column" gap={1}>
          <StyledTransactionStepTitle $isCurrentStep={isCurrentStep}>{title}</StyledTransactionStepTitle>
          {!hideWalletLabel && (
            <StyledTransactionStepWallet>
              <Address trimAddress address={account || ''} />
            </StyledTransactionStepWallet>
          )}
        </ContainerBox>
        {children}
        {explanation && isCurrentStep && (
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySmallBold">
              <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
            </Typography>
            <Typography variant="bodySmallRegular">{explanation}</Typography>
          </ContainerBox>
        )}
      </StyledTransactionStepContent>
    </>
  );
};

const TransactionStepSuccessLabel = ({ label }: { label: React.ReactElement }) => (
  <ContainerBox gap={2} alignItems="center">
    <TickCircleIcon color="success" />
    <Typography variant="bodySemibold">{label}</Typography>
  </ContainerBox>
);

const buildApproveTokenItem = ({
  onAction,
  onActionConfirmed,
  extraData,
  onGoToEtherscan,
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
    const isPendingTransaction = useIsTransactionPending(hash);
    const hasConfirmedRef = React.useRef(false);
    const hasPendingApproval = useHasPendingApproval(token, activeWallet?.address);
    const intl = useIntl();

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
        values={{ symbol: token.symbol, amount: formatCurrencyAmount({ amount, token, sigFigs: 4, intl }) }}
      />
    );

    const specificBtnText = (
      <FormattedMessage
        description="Allow us to use your coin (home exact)"
        defaultMessage="Authorize {amount} {symbol}"
        values={{ symbol: token.symbol, amount: formatCurrencyAmount({ amount, token, sigFigs: 4, intl }) }}
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

    const hasLoadReceipt = done && receipt && !isPendingTransaction;
    const approvedUnlimitedAmount =
      receipt &&
      receipt.type === TransactionEventTypes.ERC20_APPROVAL &&
      receipt.data.amount.amount >= totalSupplyThreshold(token.decimals);

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
                sx={{ flex: 1 }}
                disabled={hasPendingApproval}
              >
                {hasPendingApproval ? waitingForAppvText : isPermit2Enabled ? infiniteBtnText : specificBtnText}
              </Button>
              {isPermit2Enabled && (
                <Button onClick={() => onAction(amount)} size="large" variant="outlined" disabled={hasPendingApproval}>
                  {specificBtnTextAsSecondary}
                </Button>
              )}
            </ContainerBox>
          ) : (
            <ContainerBox gap={4} alignItems="center">
              <Button
                variant="outlined"
                size="large"
                onClick={() => (hasLoadReceipt ? setShowReceipt(true) : onGoToEtherscan(hash))}
              >
                {hasLoadReceipt ? (
                  <FormattedMessage description="viewReceipt" defaultMessage="View receipt" />
                ) : (
                  <FormattedMessage description="viewExplorer" defaultMessage="View in explorer" />
                )}
              </Button>
              {hasLoadReceipt && (
                <TransactionStepSuccessLabel
                  label={
                    approvedUnlimitedAmount ? (
                      <FormattedMessage
                        description="transactionSteps.approve-step.approved-unlimited"
                        defaultMessage="Unlimited approval for {symbol}"
                        values={{
                          symbol: token.symbol,
                        }}
                      />
                    ) : (
                      <FormattedMessage
                        description="approveAmount"
                        defaultMessage="Approve {amount} {symbol}"
                        values={{
                          symbol: token.symbol,
                          amount: formatCurrencyAmount({ amount, token, sigFigs: 4, intl }),
                        }}
                      />
                    )
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
    const intl = useIntl();

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
    } else if (type === TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN) {
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
                  amount: formatCurrencyAmount({
                    amount: extraData.fromAmount,
                    token: extraData.from,
                    sigFigs: 4,
                    intl,
                  }),
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
                  amount: formatCurrencyAmount({ amount: extraData.toAmount, token: extraData.to, sigFigs: 4, intl }),
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
            <Button variant="contained" fullWidth size="large" onClick={handleSign} disabled={failed}>
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

const buildApproveCompanionSignItem = ({
  onAction,
  extraData,
  isLast,
  isCurrentStep,
  explanation,
  done,
  failed,
}: TransactionActionApproveCompanionSignProps) => ({
  content: () => {
    const [isSigning, setIsSigning] = React.useState(false);

    React.useEffect(() => {
      if (isSigning) {
        setIsSigning(false);
      }
    }, [extraData.signStatus]);

    const stepSuccessLabels = (
      <TransactionStepSuccessLabel
        label={
          extraData.type === EarnPermission.INCREASE ? (
            <FormattedMessage
              description="tx-steps.earn.approve-companion-sign.increase.title"
              defaultMessage="Contract authorization signed"
            />
          ) : (
            <FormattedMessage
              description="tx-steps.earn.approve-companion-sign.withdraw.title"
              defaultMessage="Contract authorization signed"
            />
          )
        }
      />
    );

    const handleSign = () => {
      setIsSigning(true);
      onAction();
    };

    return (
      <>
        <CommonTransactionStepItem
          isLast={isLast}
          isCurrentStep={isCurrentStep}
          done={done}
          icon={<WalletCheckIcon />}
          title={
            extraData.type === EarnPermission.INCREASE ? (
              <FormattedMessage
                description="tx-steps.earn.approve-companion-sign.increase.title"
                defaultMessage="Authorize us to deposit your assets"
              />
            ) : (
              <FormattedMessage
                description="tx-steps.earn.approve-companion-sign.withdraw.title"
                defaultMessage="Authorize us to withdraw your assets"
              />
            )
          }
          isLoading={isSigning}
          explanation={explanation}
        >
          {isCurrentStep && (
            <Button variant="contained" fullWidth size="large" onClick={handleSign} disabled={failed}>
              {isSigning ? (
                <FormattedMessage description="signing" defaultMessage="Signing..." />
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

const buildSignEarnItem = ({
  onAction,
  extraData,
  isLast,
  isCurrentStep,
  explanation,
  done,
  failed,
}: TransactionActionEarnSignToSProps) => ({
  content: () => {
    const [isSigning, setIsSigning] = React.useState(false);

    React.useEffect(() => {
      if (isSigning) {
        setIsSigning(false);
      }
    }, [extraData.signStatus]);

    const handleSign = () => {
      setIsSigning(true);
      onAction();
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
              description="transationStep.sign-earn-tos"
              defaultMessage="Sign the vault terms of service"
            />
          }
          isLoading={isSigning}
          explanation={explanation}
        >
          {isCurrentStep && (
            <Button variant="contained" fullWidth size="large" onClick={handleSign} disabled={failed}>
              {isSigning ? (
                <FormattedMessage description="signing" defaultMessage="Signing..." />
              ) : (
                <FormattedMessage description="signWithWallet" defaultMessage="Sign with your wallet" />
              )}
            </Button>
          )}
          {done && (
            <TransactionStepSuccessLabel
              label={
                <FormattedMessage
                  description="earn.transaction-steps.sign-tos.signed"
                  defaultMessage="Strategy Terms of Service signed"
                />
              }
            />
          )}
        </CommonTransactionStepItem>
      </>
    );
  },
});

const buildEarnWithdrawItem = ({
  onAction,
  isLast,
  isCurrentStep,
  transactions,
  done,
}: TransactionActionEarnWithdrawProps) => ({
  content: () => (
    <CommonTransactionStepItem
      isLast={isLast}
      isCurrentStep={isCurrentStep}
      done={done}
      icon={<WalletMoneyIcon />}
      title={<FormattedMessage description="tx-step.title.earn.withdraw" defaultMessage="Withdraw from Vault" />}
    >
      {isCurrentStep && (
        <StyledTransactionStepButtonContainer>
          <Button variant="contained" fullWidth size="large" onClick={() => onAction(transactions)}>
            <FormattedMessage description="tx-step.button.earn.withdraw" defaultMessage="Withdraw" />
          </Button>
        </StyledTransactionStepButtonContainer>
      )}
    </CommonTransactionStepItem>
  ),
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

const buildEarnDepositItem = ({
  onAction,
  isLast,
  isCurrentStep,
  transactions,
  done,
}: TransactionActionEarnDepositProps) => ({
  content: () => (
    <CommonTransactionStepItem
      isLast={isLast}
      isCurrentStep={isCurrentStep}
      done={done}
      icon={<DollarSquareIcon />}
      title={<FormattedMessage description="transationStepEarnDeposit" defaultMessage="Invest token" />}
    >
      {isCurrentStep && (
        <StyledTransactionStepButtonContainer>
          <Button variant="contained" fullWidth size="large" onClick={() => onAction(transactions)}>
            <FormattedMessage description="transationStepEarnDeposit.deposit" defaultMessage="Deposit" />
          </Button>
        </StyledTransactionStepButtonContainer>
      )}
    </CommonTransactionStepItem>
  ),
});

const buildCreatePositionItem = ({
  onAction,
  isLast,
  isCurrentStep,
  transactions,
}: TransactionActionCreatePositionProps) => ({
  content: () => (
    <CommonTransactionStepItem
      icon={<DollarSquareIcon />}
      isLast={isLast}
      isCurrentStep={isCurrentStep}
      title={<FormattedMessage description="transationStepSwapTokens" defaultMessage="Create position" />}
    >
      {isCurrentStep && (
        <StyledTransactionStepButtonContainer>
          <Button variant="contained" fullWidth size="large" onClick={() => onAction(transactions)}>
            <FormattedMessage description="createPositionWallet" defaultMessage="Create position" />
          </Button>
        </StyledTransactionStepButtonContainer>
      )}
    </CommonTransactionStepItem>
  ),
});

const ITEMS_MAP: Record<TransactionActionType, (props: TransactionActionProps) => { content: () => JSX.Element }> = {
  [TRANSACTION_ACTION_SIGN_TOS_EARN]: buildSignEarnItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN]: buildApproveTokenItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP]: buildApproveTokenSignItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA]: buildApproveTokenSignItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN]: buildApproveTokenSignItem,
  [TRANSACTION_ACTION_WAIT_FOR_SIMULATION]: buildWaitForSimulationItem,
  [TRANSACTION_ACTION_SWAP]: buildSwapItem,
  [TRANSACTION_ACTION_EARN_DEPOSIT]: buildEarnDepositItem,
  [TRANSACTION_ACTION_CREATE_POSITION]: buildCreatePositionItem,
  [TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN]: buildApproveCompanionSignItem,
  [TRANSACTION_ACTION_EARN_WITHDRAW]: buildEarnWithdrawItem,
};

const StyledContainer = styled(ContainerBox).attrs({ fullWidth: true, alignItems: 'flex-start' })<{
  $isAbsolute: boolean;
}>`
  ${({
    $isAbsolute,
    theme: {
      palette: { mode },
      spacing,
    },
  }) =>
    $isAbsolute &&
    `position: absolute; top: 0; bottom: 0; left: 0;background-color: ${
      colors[mode].background.quarteryNoAlpha
    };border-radius: ${spacing(4)};`}
`;

const StyledPositioner = styled(ContainerBox).attrs({ gap: 5, fullWidth: true, flexDirection: 'column', flex: 1 })<{
  $isAbsolute: boolean;
}>`
  ${({ $isAbsolute, theme: { spacing } }) => $isAbsolute && `padding: ${spacing(6)};`}
`;

const TransactionSteps = ({
  shouldShow,
  handleClose: onHandleClose,
  transactions,
  onAction,
  onActionConfirmed,
  applicationIdentifier,
  setShouldShowFirstStep,
  swapQuoteStatus,
  setHeight,
  recapDataProps,
}: TransactionConfirmationProps) => {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const currentNetwork = useSelectedNetwork();
  const intl = useIntl();

  const onGoToEtherscan = (transaction: string) => {
    const url = buildEtherscanTransaction(transaction, currentNetwork.chainId);
    window.open(url, '_blank');
  };

  const currentStep = findIndex(transactions, { done: false });

  const handleClose = () => {
    if (setHeight) setHeight(undefined);
    onHandleClose();
  };

  React.useEffect(() => {
    if (setHeight && shouldShow) {
      setHeight(shouldShow ? innerRef.current?.offsetHeight : undefined);
    }
  });

  const handleResize = React.useCallback(() => {
    if (setHeight) setHeight(innerRef.current?.offsetHeight);
  }, [setHeight]);

  const handleEnter = React.useCallback(() => {
    setShouldShowFirstStep(false);
    handleResize();
  }, [setShouldShowFirstStep, handleResize]);

  const handleExit = React.useCallback(() => {
    if (setHeight) setHeight(undefined);
  }, [setHeight]);

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit onExit={handleExit} onEnter={handleEnter}>
      <StyledContainer $isAbsolute={!!setHeight} fullWidth>
        <StyledPositioner $isAbsolute={!!setHeight} ref={innerRef}>
          <ContainerBox justifyContent="space-between" gap={8}>
            <BackControl
              onClick={handleClose}
              label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
            />
            {applicationIdentifier === TransactionApplicationIdentifier.SWAP && swapQuoteStatus && (
              <QuoteStatusNotification quoteStatus={swapQuoteStatus} />
            )}
          </ContainerBox>
          <RecapData {...(recapDataProps || {})} applicationIdentifier={applicationIdentifier} />
          <DividerBorder1 />
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
                isLast,
                isCurrentStep,
                onAction,
                onActionConfirmed,
              });
              return (
                <ContainerBox gap={8} key={`${type}-${hash}-${step}`}>
                  <item.content />
                </ContainerBox>
              );
            })}
          </ContainerBox>
        </StyledPositioner>
      </StyledContainer>
    </Slide>
  );
};

// TransactionSteps.whyDidYouRender = true;

const memoed = memo(TransactionSteps);

// memoed.whyDidYouRender = true;
export default memoed;
