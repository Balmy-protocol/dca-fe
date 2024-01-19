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
  ERC20TransferDoneEvent,
  NativeTransferDoneEvent,
  ERC20ApprovalDoneEvent,
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

interface ERC20ApprovalReceipt extends Omit<ERC20ApprovalDoneEvent, 'owner' | 'spender'> {
  owner: React.ReactNode;
  spender: React.ReactNode;
}

interface ERC20TransferReceipt extends Omit<ERC20TransferDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}

interface NativeTransferReceipt extends Omit<NativeTransferDoneEvent, 'from' | 'to'> {
  from: React.ReactNode;
  to: React.ReactNode;
}

type TransactionReceiptProp = ERC20ApprovalReceipt | ERC20TransferReceipt | NativeTransferReceipt;

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
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount approved" />
        </Typography>
        <Typography variant="body" sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }} fontWeight="bold">
          {transaction.token.icon}
          {transaction.amount.amount === maxUint256 && transaction.type === TransactionEventTypes.ERC20_APPROVAL ? (
            <FormattedMessage description="unlimited" defaultMessage="Unlimited" />
          ) : (
            transaction.amount.amountInUnits
          )}{' '}
          {transaction.amount.amountInUSD && `($${transaction.amount.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.owner}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Spender" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.spender}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const ERC20TransferTransactionReceipt = ({ transaction }: { transaction: ERC20TransferReceipt }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <Typography variant="body" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.token.icon}
          {transaction.amount.amountInUnits} {transaction.amount.amountInUSD && `($${transaction.amount.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.to}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const NativeTransferTransactionReceipt = ({ transaction }: { transaction: NativeTransferReceipt }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <Typography variant="body" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {transaction.network.nativeCurrency.icon}
          {transaction.amount.amountInUnits} {transaction.amount.amountInUSD && `($${transaction.amount.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <Typography variant="body" fontWeight="bold">
          {transaction.to}
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
            {DateTime.fromSeconds(Number(transaction.timestamp)).toLocaleString(DateTime.DATETIME_FULL)}
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
              {transaction.network.mainCurrency.icon}
              {transaction.network.name}
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
              {transaction.network.nativeCurrency.icon}
              {transaction.spentInGas.amountInUnits} {transaction.network.nativeCurrency.symbol}
            </Typography>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
        <Divider />
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmall">
              <FormattedMessage description="TransactionReceipt-transactionId" defaultMessage="Transaction ID" />
            </Typography>
            <Link variant="body" href={transaction.explorerLink} target="_blank">
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
