import { Dialog } from '../dialog';
import { DialogTitle } from '../dialogtitle';
import { DialogContent } from '../dialogcontent';
import { Divider } from '../divider';
import { Link } from '../link';
import { Button } from '../button';
import { DocumentDownloadIcon } from '../../icons';
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
} from 'common-types';
import { Typography } from '../typography';
import { useTheme } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import BalmyLogoSmallLight from '../../assets/balmy-logo-small-light';
import BalmyLogoSmallDark from '../../assets/balmy-logo-small-dark';
import { baseColors, colors } from '../../theme';
import styled from 'styled-components';
import { TRANSACTION_TYPE_TITLE_MAP } from './transaction-types-map';
import { DateTime } from 'luxon';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

interface DCAModifyDataReceipt extends Omit<DCAModifiedDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}
interface DCAModifyReceipt extends Omit<DCAModifiedEvent, 'data'> {
  data: DCAModifyDataReceipt;
}

interface DCACreatedDataReceipt extends Omit<DCACreatedDataDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
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
  | NativeTransferReceipt
  | DCAWithdrawReceipt
  | DCAModifyReceipt
  | DCACreatedReceipt
  | DCAPermissionsModifiedReceipt
  | DCATransferReceipt;

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
      padding: `${spacing(8)} !important`,
      gap: spacing(2),
      display: 'flex',
      alignItems: 'flex-end',
      backgroundColor: colors[mode].violet.violet500,
      borderTopLeftRadius: spacing(3),
      borderTopRightRadius: spacing(3),
    },
  })
);

const StyledDialogContent = withStyles(DialogContent, ({ spacing }) =>
  createStyles({
    root: {
      padding: `${spacing(8)} ${spacing(8)} ${spacing(14)} ${spacing(8)} !important`,
      gap: spacing(5),
      display: 'flex',
      flexDirection: 'column',
    },
  })
);

const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

const StyledSectionContent = styled.div`
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
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount approved" />
        </Typography>
        <Typography variant="body" sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }} fontWeight="bold">
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
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.owner}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Spender" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.spender}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const ERC20TransferTransactionReceipt = ({ transaction }: { transaction: ERC20TransferReceipt }) => {
  const { spacing } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <Typography variant="body" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.data.token.icon}
          {transaction.data.amount.amountInUnits}{' '}
          {transaction.data.amount.amountInUSD && `($${transaction.data.amount.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.to}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const NativeTransferTransactionReceipt = ({ transaction }: { transaction: NativeTransferReceipt }) => {
  const { spacing } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <Typography variant="body" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.tx.network.nativeCurrency.icon}
          {transaction.data.amount.amountInUnits}{' '}
          {transaction.data.amount.amountInUSD && `($${transaction.data.amount.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.to}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const DCAWithdrawTransactionReceipt = ({ transaction }: { transaction: DCAWithdrawReceipt }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawn" defaultMessage="Withdrawn" />
        </Typography>
        <Typography
          variant="body"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
          color={colors[mode].typography.typo2}
        >
          {transaction.data.tokenTo.icon}
          {transaction.data.withdrawn.amountInUnits}{' '}
          {transaction.data.withdrawn.amountInUSD && `($${transaction.data.withdrawn.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawnBy" defaultMessage="Withdrawn by" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage
            description="TransactionReceipt-transactionDCAWithdrawnPosition"
            defaultMessage="Position"
          />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.tokenFrom.icon}/{transaction.data.tokenTo.icon}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const DCAModifyTransactionReceipt = ({ transaction }: { transaction: DCAModifyReceipt }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAModify" defaultMessage="Position modified" />
        </Typography>
        <Typography
          variant="body"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
          color={colors[mode].typography.typo2}
        >
          {transaction.data.tokenFrom.icon}
          {transaction.data.difference.amountInUnits}{' '}
          {transaction.data.difference.amountInUSD && `($${transaction.data.difference.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Modified by" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAModifyPosition" defaultMessage="Position" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.tokenFrom.icon}/{transaction.data.tokenTo.icon}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const DCACreateTransactionReceipt = ({ transaction }: { transaction: DCACreatedReceipt }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCACreate" defaultMessage="Rate" />
        </Typography>
        <Typography
          variant="body"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
          color={colors[mode].typography.typo2}
        >
          {transaction.data.tokenFrom.icon}
          {transaction.data.rate.amountInUnits}{' '}
          {transaction.data.rate.amountInUSD && `($${transaction.data.rate.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Created by" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Owned by" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.owner}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionDCAModifyPosition" defaultMessage="Position" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.tokenFrom.icon}/{transaction.data.tokenTo.icon}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const DCAPermissionsModifiedTransactionReceipt = ({ transaction }: { transaction: DCAPermissionsModifiedReceipt }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage
            description="TransactionReceipt-transactionDCAPermissionsModified-rate"
            defaultMessage="New permissions set:"
          />
        </Typography>
        {transaction.data.permissions.map(({ permissions, label }, index) => (
          <Typography
            variant="body"
            key={index}
            fontWeight="bold"
            sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
            color={colors[mode].typography.typo2}
          >
            {label}:{permissions.map((permission) => ` ${permission}`)}
          </Typography>
        ))}
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage
            description="TransactionReceipt-transactionDCAPermissionsModified-position"
            defaultMessage="Position"
          />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.tokenFrom.icon}/{transaction.data.tokenTo.icon}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const DcaTransferTransactionReceipt = ({ transaction }: { transaction: DCATransferReceipt }) => {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.data.to}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage
            description="TransactionReceipt-transactionDCAPermissionsModified-position"
            defaultMessage="Position"
          />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.data.tokenFrom.icon}/{transaction.data.tokenTo.icon}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const buildTransactionReceiptForEvent = (transaction: TransactionReceiptProp) => {
  switch (transaction.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return <ERC20ApprovalTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.ERC20_TRANSFER:
      return <ERC20TransferTransactionReceipt transaction={transaction} />;
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
  }
  return null;
};

const TransactionReceipt = ({ transaction, open, onClose }: TransactionReceiptProps) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();

  const icon = mode === 'light' ? <BalmyLogoSmallLight size="32px" /> : <BalmyLogoSmallDark size="32px" />;
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
        {icon}
        <Typography variant="h4" fontWeight="bold" color={baseColors.violet.violet100}>
          <FormattedMessage description="receipt" defaultMessage="Receipt" />
        </Typography>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StyledSectionContent>
          <Typography variant="bodySmall">
            <FormattedMessage description="TransactionReceipt-transactionType" defaultMessage="Transaction Type" />
          </Typography>
          <Typography variant="body" fontWeight="bold">
            {intl.formatMessage(TRANSACTION_TYPE_TITLE_MAP[transaction.type])}
          </Typography>
        </StyledSectionContent>
        <StyledSectionContent>
          <Typography variant="bodySmall">
            <FormattedMessage description="TransactionReceipt-transactionDateTime" defaultMessage="Date & Time" />
          </Typography>
          <Typography variant="body" fontWeight="bold">
            {DateTime.fromSeconds(Number(transaction.tx.timestamp)).toLocaleString(DateTime.DATETIME_FULL)}
          </Typography>
        </StyledSectionContent>
        {buildTransactionReceiptForEvent(transaction)}
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmall">
              <FormattedMessage description="TransactionReceipt-transactionNetwork" defaultMessage="Network" />
            </Typography>
            <Typography
              variant="body"
              sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
              fontWeight="bold"
            >
              {transaction.tx.network.mainCurrency.icon}
              {transaction.tx.network.name}
            </Typography>
          </StyledSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmall">
              <FormattedMessage description="TransactionReceipt-transactionFee" defaultMessage="Network Fee" />
            </Typography>
            <Typography
              variant="body"
              sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
              fontWeight="bold"
            >
              {transaction.tx.network.nativeCurrency.icon}
              {transaction.tx.spentInGas.amountInUnits} {transaction.tx.network.nativeCurrency.symbol}
            </Typography>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
        <Divider />
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmall">
              <FormattedMessage description="TransactionReceipt-transactionId" defaultMessage="Transaction ID" />
            </Typography>
            <Link variant="body" href={transaction.tx.explorerLink} target="_blank">
              <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
            </Link>
          </StyledSectionContent>
          <StyledSectionContent>
            <Button
              sx={{ height: '100%' }}
              variant="outlined"
              color="primary"
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

export { TransactionReceipt, TransactionReceiptProps, TransactionReceiptProp };
