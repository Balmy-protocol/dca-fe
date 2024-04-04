import React from 'react';
import {
  ReceiptIcon,
  Skeleton,
  TableCell,
  TableRow,
  TransactionReceipt,
  Typography,
  VirtualizedTable,
  buildVirtuosoTableComponents,
  ItemContent,
  colors,
  Button,
  StyledBodyTypography,
  StyledBodySmallTypography,
  ContainerBox,
  CircleIcon,
  ArrowRightIcon,
  BackgroundPaper,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { DateTime } from 'luxon';
import {
  Address as AddressType,
  SetStateCallback,
  TransactionEvent,
  TransactionEventTypes,
  TransactionStatus,
} from '@types';
import { useThemeMode } from '@state/config/hooks';
import Address from '@common/components/address';
import { totalSupplyThreshold } from '@common/utils/parsing';
import useWallets from '@hooks/useWallets';
import { toSignificantFromBigDecimal } from '@common/utils/currency';
import { isUndefined } from 'lodash';
import parseTransactionEventToTransactionReceipt from '@common/utils/transaction-history/transaction-receipt-parser';
import { getTransactionPriceColor, getTransactionTitle, getTransactionValue } from '@common/utils/transaction-history';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { filterEvents } from '@common/utils/transaction-history/search';
import useStoredLabels from '@hooks/useStoredLabels';

const StyledCellContainer = styled.div<{ gap?: number; direction?: 'column' | 'row'; align?: 'center' | 'stretch' }>`
  ${({ theme: { spacing }, gap, direction, align }) => `
    display: flex;
    flex-direction: ${direction || 'row'};
    ${gap && `gap: ${spacing(gap)};`};
    ${align && `align-items: ${align};`};
    flex-grow: 1;
  `}
`;

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    padding: 0px ${spacing(4)} ${spacing(4)} ${spacing(4)};
  `}
  flex: 1;
  display: flex;
  align-items: center;
`;

const StyledFirstTableCell = styled(TableCell)`
  ${({ theme: { spacing } }) => `
  padding-left: ${spacing(10)};
`}
`;

const StyledLastTableCell = styled(TableCell)`
  ${({ theme: { spacing } }) => `
  padding-right: ${spacing(10)};
`}
`;

const StyledViewReceiptButton = styled(Button).attrs({ variant: 'text' })`
  padding: 0;
  min-width: 0;
  :hover {
    background: inherit;
  }
`;

type TxEventRowData = TransactionEvent & {
  dateTime: {
    date: React.ReactElement;
    time: string;
  };
  operation: string;
  sourceWallet: AddressType;
};

const skeletonRows = Array.from(Array(8).keys());

const HistoryTableBodySkeleton = () => (
  <>
    {skeletonRows.map((i) => (
      <TableRow key={i}>
        <TableCell>
          <StyledCellContainer direction="column" gap={1}>
            <StyledBodyTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledBodyTypography>
            <StyledBodySmallTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallTypography>
          </StyledCellContainer>
        </TableCell>
        <TableCell>
          <StyledBodyTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledBodyTypography>
        </TableCell>
        <TableCell>
          <StyledCellContainer align="center" gap={3}>
            <Skeleton variant="circular" width={32} height={32} animation="wave" />
            <StyledCellContainer align="stretch" direction="column" gap={1}>
              <StyledBodyTypography>
                <Skeleton variant="text" animation="wave" />
              </StyledBodyTypography>
              <StyledBodySmallTypography>
                <Skeleton variant="text" animation="wave" />
              </StyledBodySmallTypography>
            </StyledCellContainer>
          </StyledCellContainer>
        </TableCell>
        <TableCell>
          <StyledBodyTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledBodyTypography>
        </TableCell>
        <TableCell>
          <StyledBodyTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledBodyTypography>
        </TableCell>
        <TableCell>
          <StyledBodyTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledBodyTypography>
        </TableCell>
        <TableCell>
          <StyledCellContainer align="center" direction="column" gap={1}>
            <Skeleton variant="rounded" width={20} height={20} animation="wave" />
            <StyledBodySmallTypography alignSelf="stretch">
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallTypography>
          </StyledCellContainer>
        </TableCell>
      </TableRow>
    ))}
  </>
);

const formatAmountElement = (
  txEvent: TransactionEvent,
  wallets: AddressType[],
  intl: ReturnType<typeof useIntl>
): React.ReactElement => {
  const amount = getTransactionValue(txEvent, wallets, intl);
  if (
    txEvent.type === TransactionEventTypes.ERC20_APPROVAL &&
    BigInt(txEvent.data.amount.amount) > totalSupplyThreshold(txEvent.data.token.decimals)
  ) {
    return <StyledBodyTypography>{amount}</StyledBodyTypography>;
  }

  const color = getTransactionPriceColor(txEvent);

  return (
    <StyledBodyTypography noWrap color={color} maxWidth={'16ch'}>
      {amount}
    </StyledBodyTypography>
  );
};

const formatTokenElement = (txEvent: TransactionEvent): React.ReactElement => {
  switch (txEvent.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return (
        <>
          {txEvent.data.token.icon}
          <StyledCellContainer direction="column">
            <StyledBodyTypography noWrap maxWidth={'6ch'}>
              {txEvent.data.token.symbol || '-'}
            </StyledBodyTypography>
            <StyledBodySmallTypography noWrap maxWidth={'12ch'}>
              {txEvent.data.token.name || '-'}
            </StyledBodySmallTypography>
          </StyledCellContainer>
        </>
      );
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_TERMINATED:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
      return (
        <>
          <ComposedTokenIcon tokenBottom={txEvent.data.fromToken} tokenTop={txEvent.data.toToken} />
          <StyledCellContainer direction="column">
            <StyledBodyTypography noWrap maxWidth={'13ch'} display="flex" alignItems="center">
              {txEvent.data.fromToken.symbol} <ArrowRightIcon /> {txEvent.data.toToken.symbol}
            </StyledBodyTypography>
          </StyledCellContainer>
        </>
      );
    case TransactionEventTypes.SWAP:
      return (
        <>
          <ComposedTokenIcon tokenBottom={txEvent.data.tokenOut} tokenTop={txEvent.data.tokenIn} />
          <StyledCellContainer direction="column">
            <StyledBodyTypography noWrap maxWidth={'13ch'} display="flex" alignItems="center">
              {txEvent.data.tokenOut.symbol} <ArrowRightIcon /> {txEvent.data.tokenIn.symbol}
            </StyledBodyTypography>
          </StyledCellContainer>
        </>
      );
  }
};

const formatAmountUsdElement = (txEvent: TransactionEvent): React.ReactElement => {
  let amountInUsd: string | undefined;

  switch (txEvent.type) {
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
      return <>-</>;
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      amountInUsd = txEvent.data.amount.amountInUSD;
      break;
    case TransactionEventTypes.DCA_MODIFIED:
      amountInUsd = txEvent.data.difference.amountInUSD;
      break;
    case TransactionEventTypes.DCA_WITHDRAW:
      amountInUsd = txEvent.data.withdrawn.amountInUSD;
      break;
    case TransactionEventTypes.DCA_TERMINATED:
      amountInUsd = (
        Number(txEvent.data.withdrawnRemaining.amountInUSD) + Number(txEvent.data.withdrawnSwapped.amountInUSD)
      ).toString();
      break;
    case TransactionEventTypes.DCA_CREATED:
      amountInUsd = txEvent.data.funds.amountInUSD;
      break;
    case TransactionEventTypes.SWAP:
      amountInUsd = txEvent.data.amountIn.amountInUSD;
      break;
  }

  return (
    <>
      {amountInUsd && (
        <StyledBodySmallTypography>${toSignificantFromBigDecimal(amountInUsd.toString(), 2)}</StyledBodySmallTypography>
      )}
    </>
  );
};

const getTxEventRowData = (txEvent: TransactionEvent, intl: ReturnType<typeof useIntl>): TxEventRowData => {
  let dateTime;

  if (txEvent.data.status === TransactionStatus.DONE) {
    const txDate = DateTime.fromSeconds(txEvent.tx.timestamp);
    const formattedDate = txDate.startOf('day').equals(DateTime.now().startOf('day')) ? (
      <FormattedMessage defaultMessage="Today" description="today" />
    ) : txDate.startOf('day').equals(DateTime.now().minus({ days: 1 }).startOf('day')) ? (
      <FormattedMessage defaultMessage="Yesterday" description="yesterday" />
    ) : (
      <>{txDate.toLocaleString({ ...DateTime.DATE_SHORT, day: '2-digit', month: '2-digit' })}</>
    );
    dateTime = {
      date: formattedDate,
      time: txDate.toLocaleString({
        ...DateTime.TIME_24_SIMPLE,
      }),
    };
  } else {
    dateTime = {
      date: <FormattedMessage defaultMessage="Just now" description="just-now" />,
      time: DateTime.fromSeconds(Date.now()).toLocaleString({
        ...DateTime.TIME_24_SIMPLE,
      }),
    };
  }

  const operation = intl.formatMessage(getTransactionTitle(txEvent));
  let sourceWallet: AddressType;

  switch (txEvent.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      sourceWallet = txEvent.data.owner;
      break;
    case TransactionEventTypes.ERC20_TRANSFER:
      sourceWallet = txEvent.data.from;
      break;
    case TransactionEventTypes.NATIVE_TRANSFER:
      sourceWallet = txEvent.data.from;
      break;
    default:
      sourceWallet = txEvent.tx.initiatedBy;
  }

  return {
    ...txEvent,
    dateTime,
    operation,
    sourceWallet,
  };
};

interface TableContext {
  setShowReceipt: SetStateCallback<TransactionEvent>;
  wallets: AddressType[];
  themeMode: 'light' | 'dark';
  intl: ReturnType<typeof useIntl>;
}

const VirtuosoTableComponents = buildVirtuosoTableComponents<TransactionEvent, TableContext>();

const HistoryTableRow: ItemContent<TransactionEvent, TableContext> = (
  index: number,
  txEvent: TransactionEvent,
  { setShowReceipt, wallets, intl }
) => {
  const { dateTime, operation, sourceWallet, ...transaction } = getTxEventRowData(txEvent, intl);
  return (
    <>
      <StyledFirstTableCell>
        <StyledCellContainer direction="column">
          <StyledBodyTypography>{dateTime.date}</StyledBodyTypography>
          <StyledBodySmallTypography>{dateTime.time}</StyledBodySmallTypography>
        </StyledCellContainer>
      </StyledFirstTableCell>
      <TableCell>
        <StyledCellContainer direction="column">
          <StyledBodyTypography>{operation}</StyledBodyTypography>
          {transaction.data.status === TransactionStatus.PENDING && (
            <StyledCellContainer direction="column" align="center" gap={1}>
              <CircleIcon sx={{ fontSize: '8px' }} color="warning" />
              <StyledBodySmallTypography>
                <FormattedMessage description="inProgress" defaultMessage="In progress" />
              </StyledBodySmallTypography>
            </StyledCellContainer>
          )}
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <ContainerBox alignItems="center" gap={3}>
          {formatTokenElement(txEvent)}
        </ContainerBox>
      </TableCell>
      <TableCell>
        <StyledBodyTypography>{transaction.tx.network.name}</StyledBodyTypography>
      </TableCell>
      <TableCell>
        <StyledCellContainer direction="column">
          {formatAmountElement(transaction, wallets, intl)}
          {formatAmountUsdElement(transaction)}
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <StyledBodyTypography noWrap maxWidth={'12ch'}>
          <Address address={sourceWallet} showDetailsOnHover trimAddress trimSize={4} />
        </StyledBodyTypography>
      </TableCell>
      <StyledLastTableCell>
        <StyledViewReceiptButton onClick={() => setShowReceipt(transaction)}>
          <StyledCellContainer direction="column" align="center">
            <ReceiptIcon />
            <Typography variant="bodyExtraSmall" noWrap>
              <FormattedMessage description="viewMore" defaultMessage="View more" />
            </Typography>
          </StyledCellContainer>
        </StyledViewReceiptButton>
      </StyledLastTableCell>
    </>
  );
};

const HistoryTableHeader = () => (
  <TableRow>
    <StyledFirstTableCell sx={{ width: '15%' }}>
      <StyledBodySmallTypography>
        <FormattedMessage description="date" defaultMessage="Date" />
      </StyledBodySmallTypography>
    </StyledFirstTableCell>
    <TableCell sx={{ width: '15%' }}>
      <StyledBodySmallTypography>
        <FormattedMessage description="operation" defaultMessage="Operation" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell sx={{ width: '20%' }}>
      <StyledBodySmallTypography>
        <FormattedMessage description="asset" defaultMessage="Asset" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell sx={{ width: '10%' }}>
      <StyledBodySmallTypography>
        <FormattedMessage description="chain" defaultMessage="Chain" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell sx={{ width: '15%' }}>
      <StyledBodySmallTypography>
        <FormattedMessage description="amount" defaultMessage="Amount" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell sx={{ width: '15%' }}>
      <StyledBodySmallTypography>
        <FormattedMessage description="sourceWallet" defaultMessage="Source Wallet" />
      </StyledBodySmallTypography>
    </TableCell>
    <StyledLastTableCell sx={{ width: '10%' }}>
      <StyledBodySmallTypography>
        <FormattedMessage description="details" defaultMessage="Details" />
      </StyledBodySmallTypography>
    </StyledLastTableCell>
  </TableRow>
);

const HistoryTable = ({ search }: { search: string }) => {
  const { events, isLoading, fetchMore } = useTransactionsHistory();
  const wallets = useWallets().map((wallet) => wallet.address);
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();
  const themeMode = useThemeMode();
  const intl = useIntl();
  const labels = useStoredLabels();

  const noActivityYet = React.useMemo(
    () => (
      <StyledCellContainer direction="column" align="center" gap={2}>
        <Typography variant="h5">🥱</Typography>
        <Typography variant="h5" fontWeight="bold" color={colors[themeMode].typography.typo3}>
          <FormattedMessage description="noActivityTitle" defaultMessage="No Activity Yet" />
        </Typography>
        <Typography variant="body" textAlign="center" color={colors[themeMode].typography.typo3}>
          <FormattedMessage
            description="noActivityParagraph"
            defaultMessage="Once you start making transactions, you'll see all your activity here"
          />
        </Typography>
      </StyledCellContainer>
    ),
    [themeMode]
  );

  const parsedReceipt = React.useMemo(() => parseTransactionEventToTransactionReceipt(showReceipt), [showReceipt]);

  const isLoadingWithoutEvents = isLoading && events.length === 0;

  const filteredEvents = React.useMemo(
    () => filterEvents(events, labels, search, intl),
    [search, events, labels, intl]
  );

  return (
    <StyledBackgroundPaper variant="outlined">
      {!isLoading && filteredEvents.length === 0 ? (
        noActivityYet
      ) : (
        <VirtualizedTable
          data={filteredEvents}
          VirtuosoTableComponents={VirtuosoTableComponents}
          header={HistoryTableHeader}
          itemContent={isLoadingWithoutEvents ? HistoryTableBodySkeleton : HistoryTableRow}
          fetchMore={fetchMore}
          context={{
            setShowReceipt,
            wallets,
            themeMode,
            intl,
          }}
        />
      )}
      <TransactionReceipt
        transaction={parsedReceipt}
        open={!isUndefined(showReceipt)}
        onClose={() => setShowReceipt(undefined)}
      />
    </StyledBackgroundPaper>
  );
};

export default HistoryTable;
