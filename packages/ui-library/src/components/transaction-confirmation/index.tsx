import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  DividerBorder1,
  TransactionReceipt,
  TransactionReceiptProp,
  getTransactionTypeTitle,
} from '..';
import { colors } from '../../theme';
import { Address } from 'viem';
import { FormattedMessage, MessageDescriptor, defineMessage, useIntl } from 'react-intl';
import { SuccessCircleIcon } from '../../icons';
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
import { formatCurrencyAmount, formatUsdAmount } from '../../common/utils/currency';

// Max width same as button
const StyledOverlay = styled.div<{ $isAbsolute: boolean }>`
  ${({ theme: { spacing }, $isAbsolute }) => `
    display: flex;
    flex-direction: column;
    gap: ${spacing(6)};
    margin: 0 auto;
    border-radius: inherit;
    width: ${spacing(87.5)};
    ${$isAbsolute && `padding: ${spacing(6)};`}
  `}
`;

const StyledTitleContainer = styled(ContainerBox).attrs({ flexDirection: 'column' })`
  text-align: center;
`;

const StyledConfirmationContainer = styled(ContainerBox).attrs({
  alignSelf: 'stretch',
  justifyContent: 'center',
  alignItems: 'center',
})``;

const StyledProgressContent = styled.div`
  position: absolute;
`;

const StyledMinButonContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  alignSelf: 'stretch',
  justifyContent: 'center',
  alignItems: 'center',
  gap: SPACING(4),
})``;

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

interface CostBalanceChangeProps {
  cost: AmountsOfToken;
  title: MessageDescriptor;
  token: Token;
  intl: ReturnType<typeof useIntl>;
}

const CostBalanceChange = ({ cost, token, title, intl }: CostBalanceChangeProps) => (
  <StyledBalanceChange>
    <StyledBalanceChangeToken>
      <Typography variant="bodyRegular">{intl.formatMessage(title)}</Typography>
    </StyledBalanceChangeToken>
    <StyledAmountContainer>
      <Typography variant="bodyBold">
        -{formatCurrencyAmount({ amount: cost.amount, token, intl })} {token.symbol}
      </Typography>
      {!!cost.amountInUSD && (
        <Typography variant="bodySmallRegular">${formatUsdAmount({ amount: cost.amountInUSD, intl })}</Typography>
      )}
    </StyledAmountContainer>
  </StyledBalanceChange>
);

interface GasBalanceChangeProps {
  protocolToken: Token;
  gasUsed: AmountsOfToken;
  intl: ReturnType<typeof useIntl>;
}

interface AmountBalanceChangeProps {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  inflow: TransactionEventIncomingTypes;
  transferedTo?: Address;
  mode: 'light' | 'dark';
  intl: ReturnType<typeof useIntl>;
  title?: MessageDescriptor;
  isLast?: boolean;
}

const AmountBalanceChange = ({
  token,
  amount,
  inflow,
  transferedTo,
  mode,
  intl,
  title,
  isLast,
}: AmountBalanceChangeProps) => (
  <>
    <StyledBalanceChange>
      <ContainerBox flexDirection="column" gap={1}>
        {title && <Typography variant="bodySmallRegular">{intl.formatMessage(title)}</Typography>}
        <StyledBalanceChangeToken>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: SPACING(2) }} variant="bodyBold">
            {token.icon} {token.symbol}
          </Typography>
        </StyledBalanceChangeToken>
      </ContainerBox>
      <StyledAmountContainer>
        <Typography
          variant="bodyBold"
          color={
            inflow === TransactionEventIncomingTypes.INCOMING
              ? colors[mode].semantic.success.darker
              : colors[mode].semantic.error.darker
          }
        >
          {inflow === TransactionEventIncomingTypes.INCOMING ? '+' : '-'}
          {formatCurrencyAmount({ amount: amount.amount, token, intl })} {token.symbol}
        </Typography>
        {!!amount.amountInUSD && (
          <Typography color={colors[mode].typography.typo3} variant="bodySmallRegular">
            ${formatUsdAmount({ amount: amount.amountInUSD, intl })}
          </Typography>
        )}
        {transferedTo && (
          <Typography color={colors[mode].typography.typo3} variant="bodySmallRegular">
            <FormattedMessage
              description="transactionConfirmationTransferTo"
              defaultMessage="Transfered to: {account}"
              values={{ account: `${transferedTo.slice(0, 6)}...${transferedTo.slice(-6)}` }}
            />
          </Typography>
        )}
      </StyledAmountContainer>
    </StyledBalanceChange>
    {!isLast && <DividerBorder1 />}
  </>
);

interface SuccessTransactionConfirmationProps {
  balanceChanges?: DistributiveOmit<AmountBalanceChangeProps, 'mode' | 'intl'>[];
  gasUsed?: DistributiveOmit<GasBalanceChangeProps, 'intl'>;
  feeCost?: DistributiveOmit<CostBalanceChangeProps, 'intl'>;
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
  feeCost,
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
    <ContainerBox flexDirection="column" justifyContent="center" flex={1} gap={8}>
      <TransactionReceipt transaction={receipt} open={shouldShowReceipt} onClose={() => setShouldShowReceipt(false)} />
      <ContainerBox flexDirection="column" justifyContent="center" gap={6}>
        <StyledConfirmationContainer>
          <SuccessCircleIcon size="100px" fontSize="inherit" />
        </StyledConfirmationContainer>
        <ContainerBox flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
          <StyledTitleContainer>
            <Typography variant="h5Bold" color={colors[mode].typography.typo1}>
              {successTitle}
            </Typography>
          </StyledTitleContainer>
          {successSubtitle && (
            <StyledTitleContainer>
              <Typography variant="bodySmallRegular" color={colors[mode].typography.typo2}>
                {successSubtitle}
              </Typography>
            </StyledTitleContainer>
          )}
        </ContainerBox>
        {((balanceChanges && !!balanceChanges.length) || gasUsed) && (
          <StyledBalanceChangesContainer>
            {balanceChanges?.map((balanceChange, index) => (
              <AmountBalanceChange
                mode={mode}
                key={balanceChange.token.address}
                {...balanceChange}
                intl={intl}
                isLast={index === balanceChanges.length - 1}
              />
            ))}
            {feeCost && <CostBalanceChange {...feeCost} intl={intl} />}
            {gasUsed && (
              <CostBalanceChange
                cost={gasUsed.gasUsed}
                title={defineMessage({
                  description: 'transactionConfirmationBalanceChangesGasUsed',
                  defaultMessage: 'Transaction cost',
                })}
                token={gasUsed.protocolToken}
                intl={intl}
              />
            )}
          </StyledBalanceChangesContainer>
        )}
      </ContainerBox>
      <StyledMinButonContainer>
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
      </StyledMinButonContainer>
      <DividerBorder1 />
      <CustomerSatisfaction
        mainQuestion={intl.formatMessage(
          defineMessage({
            description: 'txConfirmationSatisfactionQuestion',
            defaultMessage: 'How satisfied are you with the {operation} process you just completed?',
          }),
          { operation: receipt ? capitalize(intl.formatMessage(getTransactionTypeTitle(receipt))) : '' }
        )}
        ratingDescriptors={[
          intl.formatMessage(defineMessage({ defaultMessage: 'Very Frustrated', description: 'veryFrustrated' })),
          intl.formatMessage(defineMessage({ defaultMessage: 'Very Pleased', description: 'veryPleased' })),
        ]}
        onClickOption={onClickSatisfactionOption}
        options={satisfactionOptions}
      />
    </ContainerBox>
  );
};

interface PendingTransactionConfirmationProps {
  onGoToEtherscan: () => void;
  mode: 'light' | 'dark';
  loadingSubtitle?: string;
  loadingTitle?: React.ReactNode;
  maxWaitingTime: number;
}

const PendingTransactionConfirmation = ({
  onGoToEtherscan,
  mode,
  loadingSubtitle,
  loadingTitle,
  maxWaitingTime,
}: PendingTransactionConfirmationProps) => {
  const [timer, setTimer] = useState(maxWaitingTime);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
  }, [timer]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer - minutes * 60;

  return (
    <ContainerBox flexDirection="column" justifyContent="center" flex={1} gap={6}>
      <StyledConfirmationContainer>
        <svg width={0} height={0}>
          <linearGradient id="progressGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={colors[mode].semantic.success.light} />
            <stop offset="123.4%" stopColor={colors[mode].semantic.success.darker} />
          </linearGradient>
        </svg>
        <CircularProgress
          size={232}
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
          size={232}
          variant="determinate"
          value={(1 - timer / maxWaitingTime) * 100}
          thickness={4}
          sx={{
            [`& .${circularProgressClasses.circle}`]: {
              strokeLinecap: 'round',
              stroke: "url('#progressGradient')",
            },
          }}
        />
        <StyledProgressContent>
          <Typography variant={timer === 0 ? 'h5Bold' : 'confirmationLoading'}>
            {timer > 0 && `${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`}
            {timer === 0 && (
              <FormattedMessage description="transactionConfirmationProcessing" defaultMessage="Processing" />
            )}
          </Typography>
        </StyledProgressContent>
      </StyledConfirmationContainer>
      <ContainerBox flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
        {loadingTitle && (
          <StyledTitleContainer>
            <Typography variant="h5Bold">{loadingTitle}</Typography>
          </StyledTitleContainer>
        )}
        <StyledTitleContainer>
          <Typography variant="bodySmallRegular">
            <FormattedMessage
              description="transactionConfirmationViewOnLog"
              defaultMessage="<b>{loadingSubtitle}</b>. You can view the transaction state in your activity log."
              values={{ loadingSubtitle: loadingSubtitle || '', b: (chunks) => <b>{chunks}</b> }}
            />
          </Typography>
        </StyledTitleContainer>
      </ContainerBox>
      <StyledMinButonContainer>
        <Button variant="outlined" fullWidth onClick={onGoToEtherscan} size="large">
          <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
        </Button>
      </StyledMinButonContainer>
    </ContainerBox>
  );
};

interface TransactionConfirmationProps {
  balanceChanges?: DistributiveOmit<AmountBalanceChangeProps, 'mode' | 'intl'>[];
  gasUsed?: DistributiveOmit<GasBalanceChangeProps, 'mode' | 'intl'>;
  feeCost?: DistributiveOmit<CostBalanceChangeProps, 'intl'>;
  successTitle?: React.ReactNode;
  loadingSubtitle?: string;
  loadingTitle?: React.ReactNode;
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
  setHeight?: (a?: number) => void;
  maxWaitingTime: number;
}

const StyledContainer = styled(ContainerBox).attrs({ gap: 10, fullWidth: true, flexDirection: 'column' })<{
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
    `
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      background-color: ${colors[mode].background.quarteryNoAlpha};
      border-radius: ${spacing(4)};
      right: 0;
    `}
`;

const TransactionConfirmation = ({
  shouldShow,
  success,
  onGoToEtherscan,
  balanceChanges,
  gasUsed,
  feeCost,
  successTitle,
  additionalActions,
  successSubtitle,
  receipt,
  onClickSatisfactionOption,
  loadingSubtitle,
  loadingTitle,
  setHeight,
  maxWaitingTime,
}: TransactionConfirmationProps) => {
  const {
    palette: { mode },
  } = useTheme();

  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (setHeight && shouldShow) {
      setHeight(innerRef.current?.offsetHeight);
    }
  });

  const handleResize = useCallback(() => {
    if (setHeight) setHeight(innerRef.current?.offsetHeight);
  }, [setHeight]);

  const handleExit = useCallback(() => {
    if (setHeight) setHeight(undefined);
  }, [setHeight]);

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit onExit={handleExit} onEnter={handleResize}>
      <StyledContainer $isAbsolute={!!setHeight}>
        <StyledOverlay $isAbsolute={!!setHeight} ref={innerRef}>
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
              feeCost={feeCost}
            />
          ) : (
            <PendingTransactionConfirmation
              loadingSubtitle={loadingSubtitle}
              loadingTitle={loadingTitle}
              onGoToEtherscan={onGoToEtherscan}
              mode={mode}
              maxWaitingTime={maxWaitingTime}
            />
          )}
        </StyledOverlay>
      </StyledContainer>
    </Slide>
  );
};

export { TransactionConfirmation, TransactionConfirmationProps };
