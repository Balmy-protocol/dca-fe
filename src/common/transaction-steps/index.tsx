import React from 'react';
import styled from 'styled-components';
import Slide from '@mui/material/Slide';
import findIndex from 'lodash/findIndex';
import { useIsTransactionPending } from 'state/transactions/hooks';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { buildEtherscanTransaction } from 'utils/etherscan';
import {
  TransactionActionApproveTokenType,
  TransactionActionApproveTokenData,
  TransactionActionApproveTokenSignType,
  TransactionActionWaitForApprovalType,
  TransactionActionWaitForApprovalData,
  TransactionActionSwapType,
  TransactionActionSwapData,
  TransactionActionType,
} from 'types';
import {
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN,
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_ACTION_WAIT_FOR_SIGN_APPROVAL,
} from 'config';
import { FormattedMessage } from 'react-intl';
import ArrowLeft from 'assets/svg/atom/arrow-left';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TokenIcon from 'common/token-icon';
import Button from 'common/button';
import useWeb3Service from 'hooks/useWeb3Service';
import Address from 'common/address';
import { emptyTokenWithAddress } from 'utils/currency';
import CircularProgress from '@mui/material/CircularProgress';

const StyledIconButton = styled(IconButton)`
  margin-right: 5px;
  color: white;
`;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: #292929;
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

interface TransactionActionBase {
  hash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (transactions: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions?: any;
  checkForPending?: boolean;
  done?: boolean;
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
}

interface TransactionActionApproveTokenProps extends TransactionActionApproveToken, ItemProps {}

interface TransactionActionApproveTokenSign extends TransactionActionBase {
  type: TransactionActionApproveTokenSignType;
  extraData: TransactionActionApproveTokenData;
}

interface TransactionActionApproveTokenSignProps extends TransactionActionApproveTokenSign, ItemProps {}

interface TransactionActionWaitForApproval extends TransactionActionBase {
  type: TransactionActionWaitForApprovalType;
  extraData: TransactionActionWaitForApprovalData;
}

interface TransactionActionWaitForApprovalProps extends TransactionActionWaitForApproval, ItemProps {}

interface TransactionActionSwap extends TransactionActionBase {
  type: TransactionActionSwapType;
  extraData: TransactionActionSwapData;
}

interface TransactionActionSwapProps extends TransactionActionSwap, ItemProps {}

export type TransactionAction =
  | TransactionActionApproveToken
  | TransactionActionApproveTokenSign
  | TransactionActionWaitForApproval
  | TransactionActionSwap;
type TransactionActions = TransactionAction[];

interface TransactionConfirmationProps {
  shouldShow: boolean;
  handleClose: () => void;
  transactions: TransactionActions;
}

const StyledTransactionStep = styled.div<{ isLast: boolean; isCurrentStep: boolean }>`
  display: flex;
  gap: 24px;
  padding: 0px 24px 0px 24px;
  ${({ isLast }) => (!isLast ? 'border-bottom: 1px solid #1a1821;' : '')}
  ${({ isCurrentStep }) => (!isCurrentStep ? 'color: rgba(255, 255, 255, 0.5);' : '')}
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
    border-left: 1px dashed rgba(255, 255, 255, 0.5);
    z-index: -1;
    ${({ isFirst }) => (isFirst ? 'top: 24px;' : '')}
    ${({ isLast }) => (isLast ? 'bottom: calc(100% - 24px);' : '')}
  }
`;

const StyledTransactionStepIconContent = styled.div`
  display: flex;
  background-color: #292929;
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
  transactions,
}: TransactionActionApproveTokenProps) => ({
  content: () => {
    const web3Service = useWeb3Service();
    const account = web3Service.getAccount();

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>
            <TokenIcon token={extraData.token} size="40px" />
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
          <Typography variant="body1">
            <FormattedMessage
              description="transationStepApprove"
              defaultMessage="{step} - Submit the transaction approval with your wallet"
              values={{ step }}
            />
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.5);">
            <Address trimAddress address={account} />
          </Typography>
          {isCurrentStep && (
            <StyledTransactionStepButtonContainer>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={() => onAction(transactions)}
              >
                <FormattedMessage description="openWallet" defaultMessage="Open wallet" />
              </Button>
            </StyledTransactionStepButtonContainer>
          )}
          {!isCurrentStep && done && (
            <StyledTransactionStepButtonContainer>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={() => onGoToEtherscan(hash)}
              >
                <FormattedMessage description="viewReceipt" defaultMessage="View receipt" />
              </Button>
            </StyledTransactionStepButtonContainer>
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
  transactions,
}: TransactionActionApproveTokenSignProps) => ({
  content: () => {
    const web3Service = useWeb3Service();
    const account = web3Service.getAccount();

    return (
      <>
        <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionStepIconContent>
            <TokenIcon token={extraData.token} size="40px" />
          </StyledTransactionStepIconContent>
        </StyledTransactionStepIcon>
        <StyledTransactionStepContent>
          <Typography variant="body1">
            <FormattedMessage
              description="transationStepApproveSign"
              defaultMessage="{step} - Sign the token approval with your wallet"
              values={{ step }}
            />
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.5);">
            <Address trimAddress address={account} />
          </Typography>
          {isCurrentStep && (
            <StyledTransactionStepButtonContainer>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={() => onAction(transactions)}
              >
                <FormattedMessage description="openWallet" defaultMessage="Open wallet" />
              </Button>
            </StyledTransactionStepButtonContainer>
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
};

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
          <Typography variant="body1">
            {hash && checkForPending && isPendingTransaction && isCurrentStep && (
              <FormattedMessage
                description="transationStepWaitApprove"
                defaultMessage="{step} - The token approval is being confirmed"
                values={{ step }}
              />
            )}
            {hash && checkForPending && !isPendingTransaction && (
              <FormattedMessage
                description="transationStepWaitApprove"
                defaultMessage="{step} - The token approval is submitted"
                values={{ step }}
              />
            )}
          </Typography>
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
          <Typography variant="body1">
            <FormattedMessage
              description="transationStepWaitApprove"
              defaultMessage="{step} - The token approval is submitted"
              values={{ step }}
            />
          </Typography>
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
}: TransactionActionSwapProps) => ({
  content: () => (
    <>
      <StyledTransactionStepIcon isLast={isLast} isFirst={isFirst}>
        <StyledTransactionStepIconContent>
          <TokenIcon token={extraData.to} size="40px" />
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent>
        <Typography variant="body1">
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
      </StyledTransactionStepContent>
    </>
  ),
});

type TransactionActionProps =
  | TransactionActionApproveTokenProps
  | TransactionActionApproveTokenSignProps
  | TransactionActionWaitForApprovalProps
  | TransactionActionSwapProps;

const ITEMS_MAP: Record<TransactionActionType, (props: TransactionActionProps) => { content: () => JSX.Element }> = {
  [TRANSACTION_ACTION_APPROVE_TOKEN]: buildApproveTokenItem,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN]: buildApproveTokenSignItem,
  [TRANSACTION_ACTION_WAIT_FOR_APPROVAL]: buildWaitForApprovalItem,
  [TRANSACTION_ACTION_WAIT_FOR_SIGN_APPROVAL]: buildWaitForSignApprovalItem,
  [TRANSACTION_ACTION_SWAP]: buildSwapItem,
};

const TransactionSteps = ({ shouldShow, handleClose, transactions }: TransactionConfirmationProps) => {
  const getPendingTransaction = useIsTransactionPending();
  const currentNetwork = useCurrentNetwork();

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

export default TransactionSteps;
