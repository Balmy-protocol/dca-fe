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
import { TransactionEvent, TransactionEventTypes, ERC20TransferEvent, ERC20ApprovalEvent } from 'common-types';
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
  transaction?: TransactionEvent;
  open: boolean;
}

const ERC20ApprovalTransactionReceipt = ({ transaction }: { transaction: ERC20ApprovalEvent }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount approved" />
        </Typography>
        <Typography
          variant="body"
          sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
          fontWeight="bold"
          color={colors[mode].typography.typo2}
        >
          {transaction.network.mainCurrency.icon}
          {transaction.amount.amountInUnits} {transaction.amount.amountInUSD && `($${transaction.amount.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.owner}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Spender" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.spender}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const ERC20TransferTransactionReceipt = ({ transaction }: { transaction: ERC20TransferEvent }) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <Typography
          variant="body"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
          color={colors[mode].typography.typo2}
        >
          {transaction.token.icon}
          {transaction.amount.amountInUnits} {transaction.amount.amountInUSD && `($${transaction.amount.amountInUSD})`}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.from}
        </Typography>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
          {transaction.to}
        </Typography>
      </StyledSectionContent>
    </>
  );
};

const buildTransactionReceiptForEvent = (transaction: TransactionEvent) => {
  switch (transaction.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return <ERC20ApprovalTransactionReceipt transaction={transaction} />;
      break;
    case TransactionEventTypes.ERC20_TRANSFER:
      return <ERC20TransferTransactionReceipt transaction={transaction} />;
      break;
  }
  return null;
};

const TransactionReceipt = ({ transaction, open }: TransactionReceiptProps) => {
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
    <StyledDialog open={open} scroll="paper" maxWidth="xs" fullWidth PaperProps={{ id: 'paper-id' }}>
      <StyledDialogTitle>
        {icon}
        <Typography variant="h4" fontWeight="bold" color={baseColors.violet.violet100}>
          <FormattedMessage description="receipt" defaultMessage="Receipt" />
        </Typography>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StyledSectionContent>
          <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
            <FormattedMessage description="TransactionReceipt-transactionType" defaultMessage="Transaction Type" />
          </Typography>
          <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
            {intl.formatMessage(TRANSACTION_TYPE_TITLE_MAP[transaction.type])}
          </Typography>
        </StyledSectionContent>
        <StyledSectionContent>
          <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
            <FormattedMessage description="TransactionReceipt-transactionDateTime" defaultMessage="Date & Time" />
          </Typography>
          <Typography variant="body" fontWeight="bold" color={colors[mode].typography.typo2}>
            {DateTime.fromSeconds(Number(transaction.timestamp)).toLocaleString(DateTime.DATETIME_FULL)}
          </Typography>
        </StyledSectionContent>
        {buildTransactionReceiptForEvent(transaction)}
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
              <FormattedMessage description="TransactionReceipt-transactionNetwork" defaultMessage="Network" />
            </Typography>
            <Typography
              variant="body"
              sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
              fontWeight="bold"
              color={colors[mode].typography.typo2}
            >
              {transaction.network.mainCurrency.icon}
              {transaction.network.name}
            </Typography>
          </StyledSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
              <FormattedMessage description="TransactionReceipt-transactionFee" defaultMessage="Network Fee" />
            </Typography>
            <Typography
              variant="body"
              sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}
              fontWeight="bold"
              color={colors[mode].typography.typo2}
            >
              {transaction.network.nativeCurrency.icon}
              {transaction.spentInGas.amountInUnits} {transaction.network.nativeCurrency.symbol}{' '}
              {transaction.spentInGas.amountInUSD && `($${transaction.spentInGas.amountInUSD})`}
            </Typography>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
        <Divider />
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
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

export { TransactionReceipt, TransactionReceiptProps };
