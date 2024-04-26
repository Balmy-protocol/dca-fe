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
  StyledBodySmallRegularTypo2,
  StyledBodySmallLabelTypography,
  ContainerBox,
  CircleIcon,
  ArrowRightIcon,
  BackgroundPaper,
  HourglassNotDoneEmoji,
  YawningFaceEmoji,
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
import useIsSomeWalletIndexed from '@hooks/useIsSomeWalletIndexed';
import useTrackEvent from '@hooks/useTrackEvent';

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
            <StyledBodySmallRegularTypo2>
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallRegularTypo2>
            <StyledBodySmallLabelTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallLabelTypography>
          </StyledCellContainer>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <StyledCellContainer align="center" gap={3}>
            <Skeleton variant="circular" width={32} height={32} animation="wave" />
            <StyledCellContainer align="stretch" direction="column" gap={1}>
              <StyledBodySmallRegularTypo2>
                <Skeleton variant="text" animation="wave" />
              </StyledBodySmallRegularTypo2>
              <StyledBodySmallLabelTypography>
                <Skeleton variant="text" animation="wave" />
              </StyledBodySmallLabelTypography>
            </StyledCellContainer>
          </StyledCellContainer>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <StyledCellContainer align="center" direction="column" gap={1}>
            <Skeleton variant="rounded" width={20} height={20} animation="wave" />
            <StyledBodySmallLabelTypography alignSelf="stretch">
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallLabelTypography>
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
    return <StyledBodySmallRegularTypo2>{amount}</StyledBodySmallRegularTypo2>;
  }

  const color = getTransactionPriceColor(txEvent);

  return (
    <StyledBodySmallRegularTypo2 noWrap color={color} maxWidth={'16ch'}>
      {amount}
    </StyledBodySmallRegularTypo2>
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
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'6ch'}>
              {txEvent.data.token.symbol || '-'}
            </StyledBodySmallRegularTypo2>
            <StyledBodySmallLabelTypography noWrap maxWidth={'12ch'}>
              {txEvent.data.token.name || '-'}
            </StyledBodySmallLabelTypography>
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
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'13ch'} display="flex" alignItems="center">
              {txEvent.data.fromToken.symbol} <ArrowRightIcon /> {txEvent.data.toToken.symbol}
            </StyledBodySmallRegularTypo2>
          </StyledCellContainer>
        </>
      );
    case TransactionEventTypes.SWAP:
      return (
        <>
          <ComposedTokenIcon tokenBottom={txEvent.data.tokenIn} tokenTop={txEvent.data.tokenOut} />
          <StyledCellContainer direction="column">
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'13ch'} display="flex" alignItems="center">
              {txEvent.data.tokenIn.symbol} <ArrowRightIcon /> {txEvent.data.tokenOut.symbol}
            </StyledBodySmallRegularTypo2>
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
        <StyledBodySmallLabelTypography>
          ${toSignificantFromBigDecimal(amountInUsd.toString(), 2)}
        </StyledBodySmallLabelTypography>
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
      time: DateTime.fromSeconds(Date.now() / 1000).toLocaleString({
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
          <StyledBodySmallRegularTypo2>{dateTime.date}</StyledBodySmallRegularTypo2>
          <StyledBodySmallLabelTypography>{dateTime.time}</StyledBodySmallLabelTypography>
        </StyledCellContainer>
      </StyledFirstTableCell>
      <TableCell>
        <StyledCellContainer direction="column">
          <StyledBodySmallRegularTypo2>{operation}</StyledBodySmallRegularTypo2>
          {transaction.data.status === TransactionStatus.PENDING && (
            <StyledCellContainer direction="column" align="center" gap={1}>
              <CircleIcon sx={{ fontSize: '8px' }} color="warning" />
              <StyledBodySmallLabelTypography>
                <FormattedMessage description="inProgress" defaultMessage="In progress" />
              </StyledBodySmallLabelTypography>
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
        <StyledBodySmallRegularTypo2>{transaction.tx.network.name}</StyledBodySmallRegularTypo2>
      </TableCell>
      <TableCell>
        <StyledCellContainer direction="column">
          {formatAmountElement(transaction, wallets, intl)}
          {formatAmountUsdElement(transaction)}
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <StyledBodySmallRegularTypo2 noWrap maxWidth={'12ch'}>
          <Address address={sourceWallet} showDetailsOnHover trimAddress trimSize={4} />
        </StyledBodySmallRegularTypo2>
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
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="date" defaultMessage="Date" />
      </StyledBodySmallLabelTypography>
    </StyledFirstTableCell>
    <TableCell sx={{ width: '15%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="operation" defaultMessage="Operation" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell sx={{ width: '20%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="asset" defaultMessage="Asset" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell sx={{ width: '10%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="chain" defaultMessage="Chain" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell sx={{ width: '15%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="amount" defaultMessage="Amount" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell sx={{ width: '15%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="sourceWallet" defaultMessage="Source Wallet" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <StyledLastTableCell sx={{ width: '10%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="details" defaultMessage="Details" />
      </StyledBodySmallLabelTypography>
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
  const trackEvent = useTrackEvent();
  const { isSomeWalletIndexed, hasLoadedEvents } = useIsSomeWalletIndexed();

  const noActivityYet = React.useMemo(
    () => (
      <StyledCellContainer direction="column" align="center" gap={2}>
        <YawningFaceEmoji />
        <Typography variant="h5" fontWeight="bold" color={colors[themeMode].typography.typo3}>
          <FormattedMessage description="noActivityTitle" defaultMessage="No Activity Yet" />
        </Typography>
        <Typography variant="bodyRegular" textAlign="center" color={colors[themeMode].typography.typo3}>
          <FormattedMessage
            description="noActivityParagraph"
            defaultMessage="Once you start making transactions, you'll see all your activity here"
          />
        </Typography>
      </StyledCellContainer>
    ),
    [themeMode]
  );

  const indexingHistory = React.useMemo(
    () => (
      <StyledCellContainer direction="column" align="center" gap={2}>
        <HourglassNotDoneEmoji />
        <Typography variant="h5" fontWeight="bold">
          <FormattedMessage description="indexingTitle" defaultMessage="Gathering Your History" />
        </Typography>
        <Typography variant="bodyRegular" textAlign="center">
          <FormattedMessage
            description="indexingParagraph"
            defaultMessage="Indexing your past transactions. This will take just a moment. Your crypto history is on its way!"
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

  const onOpenReceipt = (tx: TransactionEvent) => {
    setShowReceipt(tx);
    trackEvent('History - View tx receipt', { type: tx.type });
  };

  return (
    <StyledBackgroundPaper variant="outlined">
      {!isLoading && !isSomeWalletIndexed && !!wallets.length && hasLoadedEvents ? (
        indexingHistory
      ) : !isLoading && !wallets.length ? (
        noActivityYet
      ) : (
        <VirtualizedTable
          data={filteredEvents}
          VirtuosoTableComponents={VirtuosoTableComponents}
          header={HistoryTableHeader}
          itemContent={isLoadingWithoutEvents ? HistoryTableBodySkeleton : HistoryTableRow}
          fetchMore={fetchMore}
          context={{
            setShowReceipt: onOpenReceipt,
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
