import { Dialog } from '../dialog';
import { DialogTitle } from '../dialogtitle';
import { DialogContent } from '../dialogcontent';
import { DividerBorder2 } from '../divider';
import { Link } from '../link';
import { ArrowRightIcon, CloseIcon } from '../../icons';
import React from 'react';
import { createStyles } from '../../common';
import { IconButton } from '../iconbutton';
import { withStyles } from 'tss-react/mui';
import {
  TransactionEventTypes,
  ERC20ApprovalDataDoneEvent,
  NativeTransferDataDoneEvent,
  ERC20TransferDataDoneEvent,
  DCAWithdrawDataDoneEvent,
  ERC20ApprovalEvent,
  ERC20TransferEvent,
  NativeTransferEvent,
  DCAWithdrawnEvent,
  DCAModifiedDataDoneEvent,
  DCAModifiedEvent,
  DCACreatedEvent,
  DCACreatedDataDoneEvent,
  DCAPermissionsModifiedDataDoneEvent,
  DCAPermissionsModifiedEvent,
  Address,
  DCATransferDataDoneEvent,
  DCATransferEvent,
  DCATerminatedEvent,
  DCATerminatedDataDoneEvent,
  SwapEvent,
  SwapDataDoneEvent,
  EarnDepositDataDoneEvent,
  EarnDepositEvent,
  EarnIncreaseEvent,
  EarnIncreaseDataDoneEvent,
  EarnWithdrawDataDoneEvent,
  EarnWithdrawEvent,
} from 'common-types';
import { Typography } from '../typography';
import { useTheme } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import BalmyLogoSmallLight from '../../assets/balmy-logo-small-light';
import { baseColors, colors } from '../../theme';
import styled from 'styled-components';
import { TRANSACTION_TYPE_TITLE_MAP } from './transaction-types-map';
import { DateTime } from 'luxon';
import { maxUint256 } from 'viem';
import { ContainerBox } from '../container-box';
import { formatCurrencyAmount, formatUsdAmount } from '../../common/utils/currency';
import isUndefined from 'lodash/isUndefined';

interface ERC20ApprovaDataReceipt extends DistributiveOmit<ERC20ApprovalDataDoneEvent, 'owner' | 'spender'> {
  owner: React.ReactNode;
  spender: React.ReactNode;
}
interface ERC20ApprovalReceipt extends DistributiveOmit<ERC20ApprovalEvent, 'data'> {
  data: ERC20ApprovaDataReceipt;
}

interface ERC20TransferDataReceipt extends DistributiveOmit<ERC20TransferDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface ERC20TransferReceipt extends DistributiveOmit<ERC20TransferEvent, 'data'> {
  data: ERC20TransferDataReceipt;
}

interface SwapDataReceipt extends DistributiveOmit<SwapDataDoneEvent, 'recipient' | 'from'> {
  recipient?: React.ReactNode;
  from: React.ReactNode;
}
interface SwapReceipt extends DistributiveOmit<SwapEvent, 'data'> {
  data: SwapDataReceipt;
}

interface EarnDepositDataReceipt extends DistributiveOmit<EarnDepositDataDoneEvent, 'user'> {
  user?: React.ReactNode;
}
interface EarnDepositReceipt extends DistributiveOmit<EarnDepositEvent, 'data'> {
  data: EarnDepositDataReceipt;
}

interface EarnIncreaseDataReceipt extends DistributiveOmit<EarnIncreaseDataDoneEvent, 'user'> {
  user?: React.ReactNode;
}
interface EarnIncreaseReceipt extends DistributiveOmit<EarnIncreaseEvent, 'data'> {
  data: EarnIncreaseDataReceipt;
}

interface EarnWithdrawDataReceipt extends DistributiveOmit<EarnWithdrawDataDoneEvent, 'user'> {
  user?: React.ReactNode;
}
interface EarnWithdrawReceipt extends DistributiveOmit<EarnWithdrawEvent, 'data'> {
  data: EarnWithdrawDataReceipt;
}

interface NativeTransferDataReceipt extends DistributiveOmit<NativeTransferDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface NativeTransferReceipt extends DistributiveOmit<NativeTransferEvent, 'data'> {
  data: NativeTransferDataReceipt;
}

interface DCAWithdrawDataReceipt extends DistributiveOmit<DCAWithdrawDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface DCAWithdrawReceipt extends DistributiveOmit<DCAWithdrawnEvent, 'data'> {
  data: DCAWithdrawDataReceipt;
}

interface DCATerminatedDataReceipt extends DistributiveOmit<DCATerminatedDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
}
interface DCATerminatedReceipt extends DistributiveOmit<DCATerminatedEvent, 'data'> {
  data: DCATerminatedDataReceipt;
}

interface DCAModifyDataReceipt extends DistributiveOmit<DCAModifiedDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface DCAModifyReceipt extends DistributiveOmit<DCAModifiedEvent, 'data'> {
  data: DCAModifyDataReceipt;
}

interface DCACreatedDataReceipt extends DistributiveOmit<DCACreatedDataDoneEvent, 'from' | 'to' | 'owner'> {
  from: React.ReactNode;
  owner: React.ReactNode;
}
interface DCACreatedReceipt extends DistributiveOmit<DCACreatedEvent, 'data'> {
  data: DCACreatedDataReceipt;
}

interface DCATransferDataReceipt extends DistributiveOmit<DCATransferDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface DCATransferReceipt extends DistributiveOmit<DCATransferEvent, 'data'> {
  data: DCATransferDataReceipt;
}

interface DCAPermissionsModifiedDataReceipt
  extends DistributiveOmit<DCAPermissionsModifiedDataDoneEvent, 'permissions'> {
  permissions: {
    permissions: DCAPermissionsModifiedDataDoneEvent['permissions'][Address]['permissions'];
    label: React.ReactNode;
  }[];
  to: React.ReactNode;
}
interface DCAPermissionsModifiedReceipt extends DistributiveOmit<DCAPermissionsModifiedEvent, 'data'> {
  data: DCAPermissionsModifiedDataReceipt;
}

type DcaTransactionReceiptProp =
  | DCAWithdrawReceipt
  | DCAModifyReceipt
  | DCACreatedReceipt
  | DCAPermissionsModifiedReceipt
  | DCATransferReceipt
  | DCATerminatedReceipt;

type TransactionReceiptProp =
  | ERC20ApprovalReceipt
  | ERC20TransferReceipt
  | SwapReceipt
  | EarnDepositReceipt
  | EarnIncreaseReceipt
  | EarnWithdrawReceipt
  | NativeTransferReceipt
  | DcaTransactionReceiptProp;

const StyledDialog = withStyles(Dialog, ({ palette: { mode } }) =>
  createStyles({
    paper: {
      border: `2px solid ${colors[mode].violet.violet500}`,
      borderBottom: '0',
      borderBottomLeftRadius: '0 !important',
      borderBottomRightRadius: '0 !important',
      overflow: 'visible !important',
      '&:after': {
        borderLeft: `2px solid ${colors[mode].violet.violet500}`,
        borderRight: `2px solid ${colors[mode].violet.violet500}`,
        borderBottom: 0,
        backgroundImage: `url(\'data:image/svg+xml;utf8, <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg"><path d="M -15 110 L100 10 L215 110" fill="${colors[
          mode
        ].background.tertiary.replace('#', '%23')}" stroke="${colors[mode].violet.violet500.replace(
          '#',
          '%23'
        )}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>\')`,
        backgroundSize: '5% 13px',
        height: '10px',
        transform: 'rotate(180deg)',
        backgroundPosition: 'center',
        content: '" "',
        display: 'block',
        position: 'absolute',
        bottom: '-10px',
        left: '-2px',
        width: 'calc(100% + 4px)',
      },
    },
  })
);

const StyledDialogTitle = withStyles(DialogTitle, ({ palette: { mode }, spacing }) =>
  createStyles({
    root: {
      padding: `${spacing(8)}`,
      gap: spacing(2),
      display: 'flex',
      alignItems: 'flex-end',
      backgroundColor: colors[mode].violet.violet500,
      borderTopLeftRadius: spacing(3),
      borderTopRightRadius: spacing(3),
      position: 'relative',
      overflow: 'hidden',
      '&:after': {
        content: '" "',
        position: 'absolute',
        width: '70%',
        paddingBottom: '70%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: '50%',
        filter: 'blur(46px)',
        background: colors[mode].violet.violet400,
        bottom: '-275%',
      },
    },
  })
);

const StyledDialogContent = withStyles(DialogContent, ({ space }) =>
  createStyles({
    root: {
      padding: `${space.s05} ${space.s05} ${space.s07} !important`,
      gap: space.s05,
      display: 'flex',
      flexDirection: 'column',
    },
  })
);

const StyledBodySmallBold = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallBold',
    color: colors[mode].typography.typo2,
    ...rest,
  })
)``;

const StyledSectionContent = styled.div`
  ${({ theme: { spacing } }) => `
    gap: ${spacing(1)};
  `}
  display: flex;
  flex-direction: column;
`;

const StyledDoubleSectionContent = styled.div`
  display: flex;
  flex-direction: row;
  ${StyledSectionContent} {
    flex: 1;
  }
`;

const StyledPositionId = styled(ContainerBox).attrs({
  gap: 2.25,
  alignSelf: 'start',
  alignItems: 'center',
})<{ $allowClick: boolean }>`
  ${({ theme: { palette, spacing }, $allowClick }) => `
  padding: ${spacing(1)} ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border2};
  border-radius: ${spacing(2)};
  transition: box-shadow 0.3s;
  ${
    $allowClick &&
    `cursor: pointer;
    &:hover {
      box-shadow: ${colors[palette.mode].dropShadow.dropShadow100};
    }`
  }
`}
`;

interface TransactionReceiptProps {
  transaction?: TransactionReceiptProp;
  open: boolean;
  onClose: () => void;
  onClickPositionId?: ({ chainId, positionId, hub }: { chainId: number; hub: string; positionId: number }) => void;
}

const ERC20ApprovalTransactionReceipt = ({ transaction }: { transaction: ERC20ApprovalReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount approved" />
        </Typography>
        <Typography variant="bodySmallBold" sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.token.icon}
          {transaction.data.amount.amount === maxUint256 &&
          transaction.type === TransactionEventTypes.ERC20_APPROVAL ? (
            <FormattedMessage description="unlimited" defaultMessage="Unlimited" />
          ) : (
            formatCurrencyAmount({ amount: transaction.data.amount.amount, token: transaction.data.token, intl })
          )}{' '}
          {transaction.data.amount.amountInUSD &&
            `($${formatUsdAmount({ amount: transaction.data.amount.amountInUSD, intl })})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.owner}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Spender" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.spender}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const ERC20TransferTransactionReceipt = ({ transaction }: { transaction: ERC20TransferReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.token.icon}
          {formatCurrencyAmount({ amount: transaction.data.amount.amount, token: transaction.data.token, intl })}{' '}
          {transaction.data.amount.amountInUSD &&
            `($${formatUsdAmount({ amount: transaction.data.amount.amountInUSD, intl })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.to}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const NativeTransferTransactionReceipt = ({ transaction }: { transaction: NativeTransferReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.tx.network.nativeCurrency.icon}
          {formatCurrencyAmount({
            amount: transaction.data.amount.amount,
            token: transaction.tx.network.nativeCurrency,
            intl,
          })}{' '}
          {transaction.data.amount.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.amount.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.to}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const DCAWithdrawTransactionReceipt = ({ transaction }: { transaction: DCAWithdrawReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawn" defaultMessage="Withdrawn" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.toToken.icon}
          {formatCurrencyAmount({
            amount: transaction.data.withdrawn.amount,
            token: transaction.data.toToken,
            intl,
          })}{' '}
          {transaction.data.withdrawn.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.withdrawn.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawnBy" defaultMessage="Withdrawn by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const SwapTransactionReceipt = ({ transaction }: { transaction: SwapReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionSwapSoldToken" defaultMessage="Sold token" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.tokenIn.icon}
          {formatCurrencyAmount({
            amount: transaction.data.amountIn.amount,
            token: transaction.data.tokenIn,
            intl,
          })}{' '}
          {transaction.data.amountIn.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.amountIn.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionSwapBoughtToken" defaultMessage="Bought token" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.tokenOut.icon}
          {formatCurrencyAmount({
            amount: transaction.data.amountOut.amount,
            token: transaction.data.tokenOut,
            intl,
          })}{' '}
          {transaction.data.amountOut.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.amountOut.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionSwapSwappedBy" defaultMessage="Swapped by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      {transaction.data.recipient && (
        <StyledSectionContent>
          <Typography variant="bodySmallLabel">
            <FormattedMessage
              description="TransactionReceipt-transactionSwapTransferedTo"
              defaultMessage="Transfered to"
            />
          </Typography>
          <StyledBodySmallBold>{transaction.data.recipient}</StyledBodySmallBold>
        </StyledSectionContent>
      )}
    </>
  );
};

const DCATerminatedTransactionReceipt = ({ transaction }: { transaction: DCATerminatedReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage
            description="TransactionReceipt-transactionDCAWithdrawn"
            defaultMessage="Withdrawn swapped"
          />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.toToken.icon}
          {formatCurrencyAmount({
            amount: transaction.data.withdrawnSwapped.amount,
            token: transaction.data.toToken,
            intl,
          })}{' '}
          {transaction.data.withdrawnSwapped.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.withdrawnSwapped.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawn" defaultMessage="Withdrawn funds" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.fromToken.icon}
          {formatCurrencyAmount({
            amount: transaction.data.withdrawnRemaining.amount,
            token: transaction.data.fromToken,
            intl,
          })}{' '}
          {transaction.data.withdrawnRemaining.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.withdrawnRemaining.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawnBy" defaultMessage="Withdrawn by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const DCAModifyTransactionReceipt = ({ transaction }: { transaction: DCAModifyReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();

  const {
    from,
    fromToken,
    fromIsYield,
    rate,
    oldRate,
    remainingSwaps,
    oldRemainingSwaps,
    remainingLiquidity,
    oldRemainingLiquidity,
  } = transaction.data;

  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="totalInvested" defaultMessage="Total Invested" />
        </Typography>
        <ContainerBox gap={0.5} alignItems="center">
          <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            {fromToken.icon}
            {formatCurrencyAmount({ amount: oldRemainingLiquidity.amount, token: fromToken, sigFigs: 2, intl })}
            {!isUndefined(oldRemainingLiquidity.amountInUSD) && ` ($${oldRemainingLiquidity.amountInUSD})`}
          </StyledBodySmallBold>
          <ArrowRightIcon />
          {oldRemainingLiquidity.amount === remainingLiquidity.amount ? (
            <StyledBodySmallBold>=</StyledBodySmallBold>
          ) : (
            <StyledBodySmallBold color="success.dark">
              {formatCurrencyAmount({ amount: remainingLiquidity.amount, token: fromToken, sigFigs: 2, intl })}
              {!isUndefined(remainingLiquidity.amountInUSD) && ` ($${remainingLiquidity.amountInUSD})`}
            </StyledBodySmallBold>
          )}
        </ContainerBox>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="rate" defaultMessage="Rate" />
        </Typography>
        <ContainerBox gap={0.5} alignItems="center">
          <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            {fromToken.icon}
            {formatCurrencyAmount({ amount: oldRate.amount, token: fromToken, sigFigs: 2, intl })}
            {!isUndefined(oldRate.amountInUSD) && ` ($${oldRate.amountInUSD})`}
          </StyledBodySmallBold>
          {fromIsYield && Number(oldRate.amount) > 0 && (
            <StyledBodySmallBold>
              <FormattedMessage description="plusYield" defaultMessage="+ yield" />
            </StyledBodySmallBold>
          )}
          <ArrowRightIcon />
          {oldRate.amount === rate.amount ? (
            <StyledBodySmallBold>=</StyledBodySmallBold>
          ) : (
            <>
              <StyledBodySmallBold color="success.dark">
                {formatCurrencyAmount({ amount: rate.amount, token: fromToken, sigFigs: 2, intl })}
                {!isUndefined(rate.amountInUSD) && ` ($${rate.amountInUSD})`}
              </StyledBodySmallBold>
              {fromIsYield && Number(rate.amount) > 0 && (
                <StyledBodySmallBold color="success.dark">
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </StyledBodySmallBold>
              )}
            </>
          )}
        </ContainerBox>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="swapsLeft" defaultMessage="Swaps left" />
        </Typography>
        <ContainerBox gap={0.5} alignItems="center">
          <StyledBodySmallBold>
            {oldRemainingSwaps === 1 ? (
              <FormattedMessage
                description="TransactionReceipt-transactionDCAModifiedSwapsLeft-singular"
                defaultMessage="1 swap"
              />
            ) : (
              <FormattedMessage
                description="TransactionReceipt-transactionDCAModifiedSwapsLeft-plural"
                defaultMessage="{swaps} swaps"
                values={{
                  swaps: Number(oldRemainingSwaps),
                }}
              />
            )}
          </StyledBodySmallBold>
          <ArrowRightIcon />
          {remainingSwaps === oldRemainingSwaps ? (
            <StyledBodySmallBold>=</StyledBodySmallBold>
          ) : (
            <StyledBodySmallBold color="success.dark">
              {oldRemainingSwaps === 1 ? (
                <FormattedMessage
                  description="TransactionReceipt-transactionDCAModifiedSwapsLeft-singular"
                  defaultMessage="1 swap"
                />
              ) : (
                <FormattedMessage
                  description="TransactionReceipt-transactionDCAModifiedSwapsLeft-plural"
                  defaultMessage="{swaps} swap"
                  values={{
                    swaps: Number(remainingSwaps),
                  }}
                />
              )}
            </StyledBodySmallBold>
          )}
        </ContainerBox>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Modified by" />
        </Typography>
        <StyledBodySmallBold>{from}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const DCACreateTransactionReceipt = ({ transaction }: { transaction: DCACreatedReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();

  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCACreate" defaultMessage="Rate" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.fromToken.icon}
          {formatCurrencyAmount({ amount: transaction.data.rate.amount, token: transaction.data.fromToken, intl })}{' '}
          {transaction.data.rate.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.rate.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Created by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Owned by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.owner}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const EarnDepositTransactionReceipt = ({ transaction }: { transaction: EarnDepositReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();

  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionEarnDeposit-Asset" defaultMessage="Deposited" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.asset.icon}
          {formatCurrencyAmount({
            amount: transaction.data.assetAmount.amount,
            token: transaction.data.asset,
            intl,
          })}{' '}
          {transaction.data.assetAmount.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.assetAmount.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const EarnIncreaseTransactionReceipt = ({ transaction }: { transaction: EarnIncreaseReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();

  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionEarnIncrease-Asset" defaultMessage="Deposited" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.asset.icon}
          {formatCurrencyAmount({
            amount: transaction.data.assetAmount.amount,
            token: transaction.data.asset,
            intl,
          })}{' '}
          {transaction.data.assetAmount.amountInUSD &&
            `($${formatUsdAmount({ intl, amount: transaction.data.assetAmount.amountInUSD })})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const EarnWithdrawTransactionReceipt = ({ transaction }: { transaction: EarnWithdrawReceipt }) => {
  const { spacing } = useTheme();
  const intl = useIntl();

  return (
    <StyledSectionContent>
      <Typography variant="bodySmallLabel">
        <FormattedMessage description="TransactionReceipt-transactionEarnWithdraw" defaultMessage="Withdrew" />
      </Typography>
      {transaction.data.withdrawn.map((withdrawn) => (
        <StyledBodySmallBold
          sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
          key={withdrawn.token.address}
        >
          {withdrawn.token.icon}
          {formatCurrencyAmount({
            amount: withdrawn.amount.amount,
            token: withdrawn.token,
            intl,
          })}{' '}
          {withdrawn.token.symbol}
          {withdrawn.amount.amountInUSD ? ` ($${formatUsdAmount({ intl, amount: withdrawn.amount.amountInUSD })})` : ''}
        </StyledBodySmallBold>
      ))}
    </StyledSectionContent>
  );
};

const DCAPermissionsModifiedTransactionReceipt = ({ transaction }: { transaction: DCAPermissionsModifiedReceipt }) => {
  const { spacing } = useTheme();
  return (
    <StyledSectionContent>
      <Typography variant="bodySmallLabel">
        <FormattedMessage
          description="TransactionReceipt-transactionDCAPermissionsModified-rate"
          defaultMessage="New permissions set:"
        />
      </Typography>
      {transaction.data.permissions.map(({ permissions, label }, index) => (
        <StyledBodySmallBold key={index} sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {label}:{permissions.map((permission) => ` ${permission}`)}
        </StyledBodySmallBold>
      ))}
    </StyledSectionContent>
  );
};

const DcaTransferTransactionReceipt = ({ transaction }: { transaction: DCATransferReceipt }) => (
  <>
    <StyledSectionContent>
      <Typography variant="bodySmallLabel">
        <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
      </Typography>
      <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
    </StyledSectionContent>
    <StyledSectionContent>
      <Typography variant="bodySmallLabel">
        <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
      </Typography>
      <StyledBodySmallBold>{transaction.data.to}</StyledBodySmallBold>
    </StyledSectionContent>
  </>
);

const buildDcaTransactionReceiptForEvent = (
  dcaTransaction: DcaTransactionReceiptProp,
  onClickPositionId?: TransactionReceiptProps['onClickPositionId']
) => {
  let dcaReceipt: React.ReactElement;
  switch (dcaTransaction.type) {
    case TransactionEventTypes.DCA_WITHDRAW:
      dcaReceipt = <DCAWithdrawTransactionReceipt transaction={dcaTransaction} />;
      break;
    case TransactionEventTypes.DCA_MODIFIED:
      dcaReceipt = <DCAModifyTransactionReceipt transaction={dcaTransaction} />;
      break;
    case TransactionEventTypes.DCA_CREATED:
      dcaReceipt = <DCACreateTransactionReceipt transaction={dcaTransaction} />;
      break;
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      dcaReceipt = <DCAPermissionsModifiedTransactionReceipt transaction={dcaTransaction} />;
      break;
    case TransactionEventTypes.DCA_TRANSFER:
      dcaReceipt = <DcaTransferTransactionReceipt transaction={dcaTransaction} />;
      break;
    case TransactionEventTypes.DCA_TERMINATED:
      dcaReceipt = <DCATerminatedTransactionReceipt transaction={dcaTransaction} />;
      break;
  }
  return (
    <>
      {dcaReceipt}
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage
            description="TransactionReceipt-transactionDCAWithdrawnPosition"
            defaultMessage="Position"
          />
        </Typography>
        <StyledPositionId
          onClick={() =>
            onClickPositionId &&
            onClickPositionId({
              positionId: dcaTransaction.data.positionId,
              chainId: dcaTransaction.tx.chainId,
              hub: dcaTransaction.data.hub,
            })
          }
          $allowClick={!!onClickPositionId}
        >
          <ContainerBox gap={0.5} alignItems="center">
            {dcaTransaction.data.fromToken.icon}
            <ArrowRightIcon />
            {dcaTransaction.data.toToken.icon}
          </ContainerBox>
          <StyledBodySmallBold>#{dcaTransaction.data.positionId}</StyledBodySmallBold>
        </StyledPositionId>
      </StyledSectionContent>
    </>
  );
};

const buildTransactionReceiptForEvent = (
  transaction: TransactionReceiptProp,
  onClickPositionId?: TransactionReceiptProps['onClickPositionId']
) => {
  switch (transaction.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return <ERC20ApprovalTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.ERC20_TRANSFER:
      return <ERC20TransferTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.SWAP:
      return <SwapTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.EARN_CREATED:
      return <EarnDepositTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.EARN_INCREASE:
      return <EarnIncreaseTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.NATIVE_TRANSFER:
      return <NativeTransferTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.EARN_WITHDRAW:
      return <EarnWithdrawTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
    case TransactionEventTypes.DCA_TERMINATED:
      return buildDcaTransactionReceiptForEvent(transaction, onClickPositionId);
  }
  return null;
};

const TransactionReceipt = ({ transaction, open, onClose, onClickPositionId }: TransactionReceiptProps) => {
  const { spacing } = useTheme();

  const intl = useIntl();

  if (!transaction) {
    return null;
  }

  return (
    <StyledDialog open={open} scroll="paper" maxWidth="xs" fullWidth PaperProps={{ id: 'paper-id' }} onClose={onClose}>
      <StyledDialogTitle>
        <BalmyLogoSmallLight size={spacing(8)} />
        <Typography variant="h4Bold" color={baseColors.violet.violet100}>
          <FormattedMessage description="receipt" defaultMessage="Receipt" />
        </Typography>
        <IconButton
          aria-label="close"
          size="small"
          onClick={onClose}
          style={{ position: 'absolute', top: 0, right: 0, padding: spacing(4) }}
        >
          <CloseIcon fontSize="inherit" sx={{ color: baseColors.violet.violet100 }} />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StyledSectionContent>
          <Typography variant="bodySmallLabel">
            <FormattedMessage description="TransactionReceipt-transactionType" defaultMessage="Transaction Type" />
          </Typography>
          <StyledBodySmallBold>{intl.formatMessage(TRANSACTION_TYPE_TITLE_MAP[transaction.type])}</StyledBodySmallBold>
        </StyledSectionContent>
        <StyledSectionContent>
          <Typography variant="bodySmallLabel">
            <FormattedMessage description="TransactionReceipt-transactionDateTime" defaultMessage="Date & Time" />
          </Typography>
          <StyledBodySmallBold>
            {DateTime.fromSeconds(Number(transaction.tx.timestamp)).toLocaleString({
              ...DateTime.DATETIME_FULL,
              timeZoneName: undefined,
            })}
          </StyledBodySmallBold>
        </StyledSectionContent>
        {buildTransactionReceiptForEvent(transaction, onClickPositionId)}
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmallLabel">
              <FormattedMessage description="TransactionReceipt-transactionNetwork" defaultMessage="Network" />
            </Typography>
            <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              {transaction.tx.network.mainCurrency.icon}
              {transaction.tx.network.name}
            </StyledBodySmallBold>
          </StyledSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmallLabel">
              <FormattedMessage description="TransactionReceipt-transactionFee" defaultMessage="Network Fee" />
            </Typography>
            <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              {transaction.tx.network.nativeCurrency.icon}
              {formatCurrencyAmount({
                amount: transaction.tx.spentInGas.amount,
                token: transaction.tx.network.nativeCurrency,
                intl,
              })}{' '}
              {transaction.tx.network.nativeCurrency.symbol}
            </StyledBodySmallBold>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
        <DividerBorder2 />
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmallLabel">
              <FormattedMessage description="TransactionReceipt-transactionId" defaultMessage="Transaction ID" />
            </Typography>
            <Link variant="bodySmallBold" href={transaction.tx.explorerLink} target="_blank">
              <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
            </Link>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export { TransactionReceipt, TransactionReceiptProps, TransactionReceiptProp, TRANSACTION_TYPE_TITLE_MAP };
