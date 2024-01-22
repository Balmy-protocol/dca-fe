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
import { CircleIcon } from 'ui-library/src/icons';
import { toSignificantFromBigDecimal } from '@common/utils/currency';
import { isUndefined } from 'lodash';
import parseTransactionEventToTransactionReceipt from '../../../../common/utils/transaction-receipt-parser';
import { getTransactionPriceColor, getTransactionTitle, getTransactionValue } from '@common/utils/transaction-history';

const StyledCellContainer = styled.div<{ gap?: number; direction?: 'column' | 'row'; align?: 'center' | 'stretch' }>`
  ${({ theme: { spacing }, gap, direction, align }) => `
    display: flex;
    flex-direction: ${direction || 'row'};
    ${gap && `gap: ${spacing(gap)};`};
    ${align && `align-items: ${align};`};
    flex-grow: 1;
  `}
`;

type TxEventRowData = TransactionEvent & {
  dateTime: {
    date: React.ReactElement;
    time: string;
  };
  operation: string;
  sourceWallet: AddressType;
};

const HistoryTableBodySkeleton = () => {
  const skeletonRows = Array.from(Array(8).keys());
  return (
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
};

const formatAmountElement = (
  txEvent: TransactionEvent,
  wallets: AddressType[],
  intl: ReturnType<typeof useIntl>
): React.ReactElement => {
  const amount = getTransactionValue(txEvent, wallets, intl);
  if (
    BigInt(txEvent.data.amount.amount) > totalSupplyThreshold(txEvent.data.token.decimals) &&
    txEvent.type === TransactionEventTypes.ERC20_APPROVAL
  ) {
    return <StyledBodyTypography>{amount}</StyledBodyTypography>;
  }

  if (
    (txEvent.type === TransactionEventTypes.ERC20_TRANSFER || txEvent.type == TransactionEventTypes.NATIVE_TRANSFER) &&
    txEvent.data.to
  ) {
    const color = getTransactionPriceColor(txEvent);
    return (
      <Typography variant="body" noWrap color={color} maxWidth="16ch">
        {amount}
      </Typography>
    );
  }

  return (
    <StyledBodyTypography noWrap maxWidth={'16ch'}>
      {amount}
    </StyledBodyTypography>
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
      <>{txDate.toLocaleString(DateTime.DATE_SHORT)}</>
    );
    dateTime = {
      date: formattedDate,
      time: txDate.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET),
    };
  } else {
    dateTime = {
      date: <FormattedMessage defaultMessage="Just now" description="just-now" />,
      time: DateTime.fromSeconds(Date.now()).toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET),
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
      <TableCell>
        <StyledCellContainer direction="column">
          <StyledBodyTypography>{dateTime.date}</StyledBodyTypography>
          <StyledBodySmallTypography>{dateTime.time}</StyledBodySmallTypography>
        </StyledCellContainer>
      </TableCell>
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
      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {transaction.data.token.icon}
        <StyledCellContainer direction="column">
          <StyledBodyTypography noWrap maxWidth={'6ch'}>
            {transaction.data.token.symbol || '-'}
          </StyledBodyTypography>
          <StyledBodySmallTypography noWrap maxWidth={'12ch'}>
            {transaction.data.token.name || '-'}
          </StyledBodySmallTypography>
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <StyledBodyTypography>{transaction.tx.network.name}</StyledBodyTypography>
      </TableCell>
      <TableCell>
        <StyledCellContainer direction="column">
          {formatAmountElement(transaction, wallets, intl)}
          {transaction.data.amount.amountInUSD && (
            <StyledBodySmallTypography>
              ${toSignificantFromBigDecimal(transaction.data.amount.amountInUSD.toString(), 2)}
            </StyledBodySmallTypography>
          )}
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <StyledBodyTypography noWrap maxWidth={'12ch'}>
          <Address address={sourceWallet} showDetailsOnHover trimAddress trimSize={4} />
        </StyledBodyTypography>
      </TableCell>
      <TableCell size="small">
        <Button variant="text" color="primary" onClick={() => setShowReceipt(transaction)}>
          <StyledCellContainer direction="column" align="center">
            <ReceiptIcon />
            <Typography variant="bodyExtraSmall" noWrap>
              <FormattedMessage description="viewMore" defaultMessage="View more" />
            </Typography>
          </StyledCellContainer>
        </Button>
      </TableCell>
    </>
  );
};

const HistoryTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="date" defaultMessage="Date" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="operation" defaultMessage="Operation" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="asset" defaultMessage="Asset" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="chain" defaultMessage="Chain" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="amount" defaultMessage="Amount" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="sourceWallet" defaultMessage="Source Wallet" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell size="small">
      <StyledBodySmallTypography>
        <FormattedMessage description="details" defaultMessage="Details" />
      </StyledBodySmallTypography>
    </TableCell>
  </TableRow>
);

const HistoryTable = () => {
  const { events, isLoading, fetchMore } = useTransactionsHistory();
  const wallets = useWallets().map((wallet) => wallet.address);
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();
  const themeMode = useThemeMode();
  const intl = useIntl();

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

  return (
    <>
      {!isLoading && events.length === 0 ? (
        noActivityYet
      ) : (
        <VirtualizedTable
          data={events}
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
    </>
  );
};

export default HistoryTable;
