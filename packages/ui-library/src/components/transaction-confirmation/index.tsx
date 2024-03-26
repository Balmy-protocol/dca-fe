import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { AmountsOfToken, Token, TokenWithIcon, TransactionEventIncomingTypes } from 'common-types';
import {
  Button,
  ButtonProps,
  CircularProgress,
  ContainerBox,
  Slide,
  Typography,
  circularProgressClasses,
  Divider,
  TransactionReceipt,
  TransactionReceiptProp,
  TRANSACTION_TYPE_TITLE_MAP,
} from '..';
import { colors } from '../../theme';
import { Address } from 'viem';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { SuccessCircleIcon } from '../../icons';
import { Chains } from '@mean-finance/sdk';
import { SPACING } from '../../theme/constants';
import CustomerSatisfaction, { FeedbackOption } from '../customer-satisfaction';
import capitalize from 'lodash/capitalize';
import {
  AngryFaceEmoji,
  GrinningFaceWithBigEyesEmoji,
  NeutralFaceEmoji,
  SlightlyFrowningFaceEmoji,
  SmilingFaceWithHeartEyesEmoji,
} from '../../emojis';

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
    padding: ${spacing(6)};
    display: flex;
    flex-direction: column;
    gap: ${spacing(6)};
    background-color: ${colors[mode].background.quarteryNoAlpha};
    border-radius: inherit;
  `}
`;

const StyledTitleContainer = styled(ContainerBox).attrs({ flexDirection: 'column' })`
  text-align: center;
`;

const StyledConfirmationContainer = styled(ContainerBox).attrs({
  alignSelf: 'stretch',
  flex: '1',
  justifyContent: 'center',
  alignItems: 'center',
})``;

const StyledProgressContent = styled.div`
  position: absolute;
`;

const StyledButonContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  alignSelf: 'stretch',
  flex: '1',
  justifyContent: 'center',
  alignItems: 'center',
  gap: SPACING(4),
})``;

const StyledTypography = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBalanceChangesContainer = styled(ContainerBox).attrs({ flexDirection: 'column' })`
  ${({ theme: { spacing } }) => `
    gap: ${spacing(4)};
    border-radius: ${spacing(1)};
    padding: ${spacing(4)};
  `}
`;
const StyledBalanceChange = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'space-between' })``;

const StyledBalanceChangeToken = styled(ContainerBox).attrs({ alignItems: 'center' })`
  ${({ theme: { spacing } }) => `
  gap: ${spacing(1)};
`}
`;

const StyledAmountContainer = styled(ContainerBox).attrs({ alignItems: 'flex-end', flexDirection: 'column' })``;

export const satisfactionOptions: FeedbackOption[] = [
  AngryFaceEmoji,
  SlightlyFrowningFaceEmoji,
  NeutralFaceEmoji,
  GrinningFaceWithBigEyesEmoji,
  SmilingFaceWithHeartEyesEmoji,
].map((Emoji, i) => ({ label: <Emoji key={i} size={SPACING(7)} />, value: i + 1 }));

const TIMES_PER_NETWORK = {
  [Chains.ARBITRUM.chainId]: 10,
  [Chains.POLYGON.chainId]: 20,
  [Chains.OPTIMISM.chainId]: 10,
  [Chains.ETHEREUM.chainId]: 40,
};

export const DEFAULT_TIME_PER_NETWORK = 30;

interface GasBalanceChangeProps {
  protocolToken: Token;
  gasUsed: AmountsOfToken;
  mode: 'light' | 'dark';
}

const GasBalanceChange = ({ protocolToken, gasUsed, mode }: GasBalanceChangeProps) => (
  <StyledBalanceChange>
    <StyledBalanceChangeToken>
      <Typography variant="body">
        <FormattedMessage
          description="transactionConfirmationBalanceChangesGasUsed"
          defaultMessage="Transaction cost:"
        />
      </Typography>
    </StyledBalanceChangeToken>
    <StyledAmountContainer>
      <Typography variant="body" color={colors[mode].typography.typo2}>
        -{gasUsed.amountInUnits} {protocolToken.symbol}
      </Typography>
      {!!gasUsed.amountInUSD && (
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          ${gasUsed.amountInUSD}
        </Typography>
      )}
    </StyledAmountContainer>
  </StyledBalanceChange>
);

interface AmountBalanceChangeProps {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  inflow: TransactionEventIncomingTypes;
  transferedTo?: Address;
  mode: 'light' | 'dark';
}

const AmountBalanceChange = ({ token, amount, inflow, transferedTo, mode }: AmountBalanceChangeProps) => (
  <>
    <StyledBalanceChange>
      <StyledBalanceChangeToken>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: SPACING(2) }} variant="body" fontWeight={700}>
          {token.icon} {token.symbol}
        </Typography>
      </StyledBalanceChangeToken>
      <StyledAmountContainer>
        <Typography
          variant="body"
          fontWeight={700}
          color={
            inflow === TransactionEventIncomingTypes.INCOMING
              ? colors[mode].semantic.success.darker
              : colors[mode].semantic.error.darker
          }
        >
          {inflow === TransactionEventIncomingTypes.INCOMING ? '+' : '-'}
          {amount.amountInUnits} {token.symbol}
        </Typography>
        {!!amount.amountInUSD && (
          <Typography color={colors[mode].typography.typo3} variant="bodySmall">
            ${amount.amountInUSD}
          </Typography>
        )}
        {transferedTo && (
          <Typography color={colors[mode].typography.typo3} variant="bodySmall">
            <FormattedMessage
              description="transactionConfirmationTransferTo"
              defaultMessage="Transfered to: {account}"
              values={{ account: `${transferedTo.slice(0, 6)}...${transferedTo.slice(-6)}` }}
            />
          </Typography>
        )}
      </StyledAmountContainer>
    </StyledBalanceChange>
    <Divider />
  </>
);

interface SuccessTransactionConfirmationProps {
  balanceChanges?: Omit<AmountBalanceChangeProps, 'mode'>[];
  gasUsed?: Omit<GasBalanceChangeProps, 'mode'>;
  successTitle?: React.ReactNode;
  successSubtitle?: React.ReactNode;
  receipt?: TransactionReceiptProp;
  additionalActions: {
    variant: ButtonProps['variant'];
    color: ButtonProps['color'];
    label: string;
    onAction: () => void;
  }[];
  mode: 'light' | 'dark';
  onClickSatisfactionOption: (value: number) => void;
}

const SuccessTransactionConfirmation = ({
  balanceChanges,
  gasUsed,
  successTitle,
  additionalActions,
  mode,
  successSubtitle,
  receipt,
  onClickSatisfactionOption,
}: SuccessTransactionConfirmationProps) => {
  const [shouldShowReceipt, setShouldShowReceipt] = useState(false);
  const intl = useIntl();
  const onViewReceipt = () => setShouldShowReceipt(true);

  return (
    <>
      <TransactionReceipt transaction={receipt} open={shouldShowReceipt} onClose={() => setShouldShowReceipt(false)} />
      <StyledConfirmationContainer>
        <SuccessCircleIcon size="100px" fontSize="inherit" />
      </StyledConfirmationContainer>
      <StyledTitleContainer>
        <Typography variant="h5" fontWeight={700} color={colors[mode].typography.typo1}>
          {successTitle}
        </Typography>
        {successSubtitle && (
          <Typography variant="body" color={colors[mode].typography.typo2}>
            {successSubtitle}
          </Typography>
        )}
      </StyledTitleContainer>
      <StyledBalanceChangesContainer>
        {balanceChanges?.map((balanceChange) => (
          <AmountBalanceChange mode={mode} key={balanceChange.token.address} {...balanceChange} />
        ))}
        {gasUsed && <GasBalanceChange mode={mode} {...gasUsed} />}
      </StyledBalanceChangesContainer>
      <StyledButonContainer>
        {additionalActions.map((action) => (
          <Button
            variant={action.variant}
            key={action.label}
            color={action.color}
            onClick={action.onAction}
            fullWidth
            size="large"
          >
            {action.label}
          </Button>
        ))}
        <Button variant="outlined" fullWidth onClick={onViewReceipt} size="large" disabled={!receipt}>
          <FormattedMessage description="transactionConfirmationViewReceipt" defaultMessage="View receipt" />
        </Button>
      </StyledButonContainer>
      <Divider />
      <CustomerSatisfaction
        mainQuestion={intl.formatMessage(
          defineMessage({
            description: 'txConfirmationSatisfactionQuestion',
            defaultMessage: 'How satisfied are you with the {operation} process you just completed?',
          }),
          { operation: receipt ? capitalize(intl.formatMessage(TRANSACTION_TYPE_TITLE_MAP[receipt.type])) : '' }
        )}
        ratingDescriptors={[
          intl.formatMessage(defineMessage({ defaultMessage: 'Very Frustrated', description: 'veryFrustrated' })),
          intl.formatMessage(defineMessage({ defaultMessage: 'Very Pleased', description: 'veryPleased' })),
        ]}
        onClickOption={onClickSatisfactionOption}
        options={satisfactionOptions}
      />
    </>
  );
};

interface PendingTransactionConfirmationProps {
  onGoToEtherscan: () => void;
  mode: 'light' | 'dark';
  chainId?: number;
}

const PendingTransactionConfirmation = ({ onGoToEtherscan, mode, chainId }: PendingTransactionConfirmationProps) => {
  const [timer, setTimer] = useState(TIMES_PER_NETWORK[chainId || 1] || DEFAULT_TIME_PER_NETWORK);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
  }, [timer]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer - minutes * 60;

  return (
    <>
      <StyledConfirmationContainer>
        <svg width={0} height={0}>
          <linearGradient id="progressGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={colors[mode].semantic.success.light} />
            <stop offset="123.4%" stopColor={colors[mode].semantic.success.darker} />
          </linearGradient>
        </svg>
        <CircularProgress
          size={270}
          variant="determinate"
          value={100}
          thickness={4}
          sx={{
            position: 'absolute',
            [`& .${circularProgressClasses.circle}`]: {
              strokeLinecap: 'round',
              stroke: colors[mode].background.tertiary,
            },
          }}
        />
        <CircularProgress
          size={270}
          variant="determinate"
          value={(1 - timer / (TIMES_PER_NETWORK[chainId || 1] || DEFAULT_TIME_PER_NETWORK)) * 100}
          thickness={4}
          sx={{
            [`& .${circularProgressClasses.circle}`]: {
              strokeLinecap: 'round',
              stroke: "url('#progressGradient')",
            },
          }}
        />
        <StyledProgressContent>
          <StyledTypography variant="h4">
            {timer > 0 && `${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`}
            {timer === 0 && (
              <FormattedMessage description="transactionConfirmationProcessing" defaultMessage="Processing" />
            )}
          </StyledTypography>
        </StyledProgressContent>
      </StyledConfirmationContainer>
      <StyledTitleContainer>
        <Typography variant="h6">
          <FormattedMessage description="transactionConfirmationInProgress" defaultMessage="Transaction in progress" />
        </Typography>
      </StyledTitleContainer>
      <StyledButonContainer>
        <Button variant="outlined" fullWidth onClick={onGoToEtherscan} size="large">
          <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
        </Button>
      </StyledButonContainer>
    </>
  );
};

interface TransactionConfirmationProps {
  balanceChanges?: Omit<AmountBalanceChangeProps, 'mode'>[];
  gasUsed?: Omit<GasBalanceChangeProps, 'mode'>;
  successTitle?: React.ReactNode;
  receipt?: TransactionReceiptProp;
  onGoToEtherscan: () => void;
  additionalActions: {
    variant: ButtonProps['variant'];
    color: ButtonProps['color'];
    label: string;
    onAction: () => void;
  }[];
  mode: 'light' | 'dark';
  chainId?: number;
  shouldShow: boolean;
  success: boolean;
  successSubtitle?: React.ReactNode;
  onClickSatisfactionOption: (value: number) => void;
}

const TransactionConfirmation = ({
  shouldShow,
  success,
  chainId,
  onGoToEtherscan,
  balanceChanges,
  gasUsed,
  successTitle,
  additionalActions,
  successSubtitle,
  receipt,
  onClickSatisfactionOption,
}: TransactionConfirmationProps) => {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        {success ? (
          <SuccessTransactionConfirmation
            mode={mode}
            balanceChanges={balanceChanges}
            gasUsed={gasUsed}
            successTitle={successTitle}
            additionalActions={additionalActions}
            successSubtitle={successSubtitle}
            receipt={receipt}
            onClickSatisfactionOption={onClickSatisfactionOption}
          />
        ) : (
          <PendingTransactionConfirmation chainId={chainId} onGoToEtherscan={onGoToEtherscan} mode={mode} />
        )}
      </StyledOverlay>
    </Slide>
  );
};

export { TransactionConfirmation, TransactionConfirmationProps };
