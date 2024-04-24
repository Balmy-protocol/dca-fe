import { Dialog } from '../dialog';
import { DialogTitle } from '../dialogtitle';
import { DialogContent } from '../dialogcontent';
import { Divider } from '../divider';
import { Link } from '../link';
import { Button } from '../button';
import { ArrowRightIcon, DocumentDownloadIcon } from '../../icons';
import React from 'react';
import { createStyles } from '../../common';
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
} from 'common-types';
import { Typography } from '../typography';
import { useTheme } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import BalmyLogoSmallLight from '../../assets/balmy-logo-small-light';
import { baseColors, colors } from '../../theme';
import styled from 'styled-components';
import { TRANSACTION_TYPE_TITLE_MAP } from './transaction-types-map';
import { DateTime } from 'luxon';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { maxUint256 } from 'viem';
import { ContainerBox } from '../container-box';

interface ERC20ApprovaDataReceipt extends Omit<ERC20ApprovalDataDoneEvent, 'owner' | 'spender'> {
  owner: React.ReactNode;
  spender: React.ReactNode;
}
interface ERC20ApprovalReceipt extends Omit<ERC20ApprovalEvent, 'data'> {
  data: ERC20ApprovaDataReceipt;
}

interface ERC20TransferDataReceipt extends Omit<ERC20TransferDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface ERC20TransferReceipt extends Omit<ERC20TransferEvent, 'data'> {
  data: ERC20TransferDataReceipt;
}

interface SwapDataReceipt extends Omit<SwapDataDoneEvent, 'recipient' | 'from'> {
  recipient?: React.ReactNode;
  from: React.ReactNode;
}
interface SwapReceipt extends Omit<SwapEvent, 'data'> {
  data: SwapDataReceipt;
}

interface NativeTransferDataReceipt extends Omit<NativeTransferDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface NativeTransferReceipt extends Omit<NativeTransferEvent, 'data'> {
  data: NativeTransferDataReceipt;
}

interface DCAWithdrawDataReceipt extends Omit<DCAWithdrawDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface DCAWithdrawReceipt extends Omit<DCAWithdrawnEvent, 'data'> {
  data: DCAWithdrawDataReceipt;
}

interface DCATerminatedDataReceipt extends Omit<DCATerminatedDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
}
interface DCATerminatedReceipt extends Omit<DCATerminatedEvent, 'data'> {
  data: DCATerminatedDataReceipt;
}

interface DCAModifyDataReceipt extends Omit<DCAModifiedDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface DCAModifyReceipt extends Omit<DCAModifiedEvent, 'data'> {
  data: DCAModifyDataReceipt;
}

interface DCACreatedDataReceipt extends Omit<DCACreatedDataDoneEvent, 'from' | 'to' | 'owner'> {
  from: React.ReactNode;
  owner: React.ReactNode;
}
interface DCACreatedReceipt extends Omit<DCACreatedEvent, 'data'> {
  data: DCACreatedDataReceipt;
}

interface DCATransferDataReceipt extends Omit<DCATransferDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface DCATransferReceipt extends Omit<DCATransferEvent, 'data'> {
  data: DCATransferDataReceipt;
}

interface DCAPermissionsModifiedDataReceipt extends Omit<DCAPermissionsModifiedDataDoneEvent, 'permissions'> {
  permissions: {
    permissions: DCAPermissionsModifiedDataDoneEvent['permissions'][Address]['permissions'];
    label: React.ReactNode;
  }[];
  to: React.ReactNode;
}
interface DCAPermissionsModifiedReceipt extends Omit<DCAPermissionsModifiedEvent, 'data'> {
  data: DCAPermissionsModifiedDataReceipt;
}

type TransactionReceiptProp =
  | ERC20ApprovalReceipt
  | ERC20TransferReceipt
  | SwapReceipt
  | NativeTransferReceipt
  | DCAWithdrawReceipt
  | DCAModifyReceipt
  | DCACreatedReceipt
  | DCAPermissionsModifiedReceipt
  | DCATransferReceipt
  | DCATerminatedReceipt;

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
      padding: `${spacing(6)} ${spacing(6)} ${spacing(14)} ${spacing(6)} !important`,
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

const StyledDialogContent = withStyles(DialogContent, ({ spacing }) =>
  createStyles({
    root: {
      padding: `${spacing(6)} ${spacing(6)} ${spacing(14)} ${spacing(6)} !important`,
      gap: spacing(5),
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

const StyledPositionId = styled(ContainerBox).attrs({ gap: 2.25, alignSelf: 'start', alignItems: 'center' })`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(1)} ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border2};
  border-radius: ${spacing(2)};
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: ${colors[palette.mode].dropShadow.dropShadow100};
  }
`}
`;

interface TransactionReceiptProps {
  transaction?: TransactionReceiptProp;
  open: boolean;
  onClose: () => void;
}

const ERC20ApprovalTransactionReceipt = ({ transaction }: { transaction: ERC20ApprovalReceipt }) => {
  const { spacing } = useTheme();
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
            transaction.data.amount.amountInUnits
          )}{' '}
          {transaction.data.amount.amountInUSD && `($${transaction.data.amount.amountInUSD})`}
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
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.token.icon}
          {transaction.data.amount.amountInUnits}{' '}
          {transaction.data.amount.amountInUSD && `($${transaction.data.amount.amountInUSD})`}
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
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.tx.network.nativeCurrency.icon}
          {transaction.data.amount.amountInUnits}{' '}
          {transaction.data.amount.amountInUSD && `($${transaction.data.amount.amountInUSD})`}
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
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawn" defaultMessage="Withdrawn" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.toToken.icon}
          {transaction.data.withdrawn.amountInUnits}{' '}
          {transaction.data.withdrawn.amountInUSD && `($${transaction.data.withdrawn.amountInUSD})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawnBy" defaultMessage="Withdrawn by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage
            description="TransactionReceipt-transactionDCAWithdrawnPosition"
            defaultMessage="Position"
          />
        </Typography>
        <StyledPositionId>
          <ContainerBox gap={0.5} alignItems="center">
            {transaction.data.fromToken.icon}
            <ArrowRightIcon />
            {transaction.data.toToken.icon}
          </ContainerBox>
          <StyledBodySmallBold>#{transaction.data.positionId}</StyledBodySmallBold>
        </StyledPositionId>
      </StyledSectionContent>
    </>
  );
};

const SwapTransactionReceipt = ({ transaction }: { transaction: SwapReceipt }) => {
  const { spacing } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionSwapSoldToken" defaultMessage="Sold token" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.tokenIn.icon}
          {transaction.data.amountIn.amountInUnits}{' '}
          {transaction.data.amountIn.amountInUSD && `($${transaction.data.amountIn.amountInUSD})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionSwapBoughtToken" defaultMessage="Bought token" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.tokenOut.icon}
          {transaction.data.amountOut.amountInUnits}{' '}
          {transaction.data.amountOut.amountInUSD && `($${transaction.data.amountOut.amountInUSD})`}
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
          {transaction.data.withdrawnSwapped.amountInUnits}{' '}
          {transaction.data.withdrawnSwapped.amountInUSD && `($${transaction.data.withdrawnSwapped.amountInUSD})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawn" defaultMessage="Withdrawn funds" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.fromToken.icon}
          {transaction.data.withdrawnRemaining.amountInUnits}{' '}
          {transaction.data.withdrawnRemaining.amountInUSD && `($${transaction.data.withdrawnRemaining.amountInUSD})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawnBy" defaultMessage="Withdrawn by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage
            description="TransactionReceipt-transactionDCAWithdrawnPosition"
            defaultMessage="Position"
          />
        </Typography>
        <StyledPositionId>
          <ContainerBox gap={0.5} alignItems="center">
            {transaction.data.fromToken.icon}
            <ArrowRightIcon />
            {transaction.data.toToken.icon}
          </ContainerBox>
          <StyledBodySmallBold>#{transaction.data.positionId}</StyledBodySmallBold>
        </StyledPositionId>
      </StyledSectionContent>
    </>
  );
};

const DCAModifyTransactionReceipt = ({ transaction }: { transaction: DCAModifyReceipt }) => {
  const { spacing } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAModify" defaultMessage="Position modified" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.fromToken.icon}
          {transaction.data.difference.amountInUnits}{' '}
          {transaction.data.difference.amountInUSD && `($${transaction.data.difference.amountInUSD})`}
        </StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Modified by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifyPosition" defaultMessage="Position" />
        </Typography>
        <StyledPositionId>
          <ContainerBox gap={0.5} alignItems="center">
            {transaction.data.fromToken.icon}
            <ArrowRightIcon />
            {transaction.data.toToken.icon}
          </ContainerBox>
          <StyledBodySmallBold>#{transaction.data.positionId}</StyledBodySmallBold>
        </StyledPositionId>
      </StyledSectionContent>
    </>
  );
};

const DCACreateTransactionReceipt = ({ transaction }: { transaction: DCACreatedReceipt }) => {
  const { spacing } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCACreate" defaultMessage="Rate" />
        </Typography>
        <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.fromToken.icon}
          {transaction.data.rate.amountInUnits}{' '}
          {transaction.data.rate.amountInUSD && `($${transaction.data.rate.amountInUSD})`}
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
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifyPosition" defaultMessage="Position" />
        </Typography>
        <StyledPositionId>
          <ContainerBox gap={0.5} alignItems="center">
            {transaction.data.fromToken.icon}
            <ArrowRightIcon />
            {transaction.data.toToken.icon}
          </ContainerBox>
          <StyledBodySmallBold>#{transaction.data.positionId}</StyledBodySmallBold>
        </StyledPositionId>
      </StyledSectionContent>
    </>
  );
};

const DCAPermissionsModifiedTransactionReceipt = ({ transaction }: { transaction: DCAPermissionsModifiedReceipt }) => {
  const { spacing } = useTheme();
  return (
    <>
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
      <StyledSectionContent>
        <Typography variant="bodySmallLabel">
          <FormattedMessage
            description="TransactionReceipt-transactionDCAPermissionsModified-position"
            defaultMessage="Position"
          />
        </Typography>
        <StyledPositionId>
          <ContainerBox gap={0.5} alignItems="center">
            {transaction.data.fromToken.icon}
            <ArrowRightIcon />
            {transaction.data.toToken.icon}
          </ContainerBox>
          <StyledBodySmallBold>#{transaction.data.positionId}</StyledBodySmallBold>
        </StyledPositionId>
      </StyledSectionContent>
    </>
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
    <StyledSectionContent>
      <Typography variant="bodySmallLabel">
        <FormattedMessage
          description="TransactionReceipt-transactionDCAPermissionsModified-position"
          defaultMessage="Position"
        />
      </Typography>
      <StyledPositionId>
        <ContainerBox gap={0.5} alignItems="center">
          {transaction.data.fromToken.icon}
          <ArrowRightIcon />
          {transaction.data.toToken.icon}
        </ContainerBox>
        <StyledBodySmallBold>#{transaction.data.positionId}</StyledBodySmallBold>
      </StyledPositionId>
    </StyledSectionContent>
  </>
);

const buildTransactionReceiptForEvent = (transaction: TransactionReceiptProp) => {
  switch (transaction.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return <ERC20ApprovalTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.ERC20_TRANSFER:
      return <ERC20TransferTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.SWAP:
      return <SwapTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.NATIVE_TRANSFER:
      return <NativeTransferTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.DCA_WITHDRAW:
      return <DCAWithdrawTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.DCA_MODIFIED:
      return <DCAModifyTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.DCA_CREATED:
      return <DCACreateTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      return <DCAPermissionsModifiedTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.DCA_TRANSFER:
      return <DcaTransferTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.DCA_TERMINATED:
      return <DCATerminatedTransactionReceipt transaction={transaction} />;
  }
  return null;
};

const TransactionReceipt = ({ transaction, open, onClose }: TransactionReceiptProps) => {
  const { spacing } = useTheme();

  const intl = useIntl();

  if (!transaction) {
    return null;
  }

  const onDownloadPdf = async () => {
    const element = document.getElementById('paper-id');
    if (!element) return;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('print.pdf');
  };

  return (
    <StyledDialog open={open} scroll="paper" maxWidth="xs" fullWidth PaperProps={{ id: 'paper-id' }} onClose={onClose}>
      <StyledDialogTitle>
        <BalmyLogoSmallLight size={spacing(8)} />
        <Typography variant="h4Bold" color={baseColors.violet.violet100}>
          <FormattedMessage description="receipt" defaultMessage="Receipt" />
        </Typography>
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
        {buildTransactionReceiptForEvent(transaction)}
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
              {transaction.tx.spentInGas.amountInUnits} {transaction.tx.network.nativeCurrency.symbol}
            </StyledBodySmallBold>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
        <Divider />
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmallLabel">
              <FormattedMessage description="TransactionReceipt-transactionId" defaultMessage="Transaction ID" />
            </Typography>
            <Link variant="bodySmallBold" href={transaction.tx.explorerLink} target="_blank">
              <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
            </Link>
          </StyledSectionContent>
          <StyledSectionContent>
            <Button
              sx={{ height: '100%' }}
              variant="outlined"
              onClick={() => void onDownloadPdf()}
              startIcon={<DocumentDownloadIcon />}
            >
              <FormattedMessage description="TransactionReceipt-downloadPDF" defaultMessage="Download PDF" />
            </Button>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export { TransactionReceipt, TransactionReceiptProps, TransactionReceiptProp, TRANSACTION_TYPE_TITLE_MAP };
