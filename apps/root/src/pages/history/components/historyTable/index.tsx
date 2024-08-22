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
  YawningFaceEmoji,
  Grid,
  CircularProgressWithBrackground,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { DateTime } from 'luxon';
import {
  Address as AddressType,
  ChainId,
  IndexerUnits,
  SetStateCallback,
  TransactionEvent,
  TransactionEventTypes,
  TransactionStatus,
} from '@types';
import { useThemeMode } from '@state/config/hooks';
import Address from '@common/components/address';
import { findHubAddressVersion, totalSupplyThreshold } from '@common/utils/parsing';
import useWallets from '@hooks/useWallets';
import { formatUsdAmount, toSignificantFromBigDecimal, toToken } from '@common/utils/currency';
import isUndefined from 'lodash/isUndefined';
import parseTransactionEventToTransactionReceipt from '@common/utils/transaction-history/transaction-receipt-parser';
import {
  filterEventsByUnitIndexed,
  getTransactionPriceColor,
  getTransactionTitle,
  getTransactionValue,
  IncludedIndexerUnits,
} from '@common/utils/transaction-history';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { filterEvents } from '@common/utils/transaction-history/search';
import useStoredLabels from '@hooks/useStoredLabels';
import useIsSomeWalletIndexed from '@hooks/useIsSomeWalletIndexed';
import useTrackEvent from '@hooks/useTrackEvent';
import usePushToHistory from '@hooks/usePushToHistory';
import { SPACING } from 'ui-library/src/theme/constants';
import { getGhTokenListLogoUrl } from '@constants';
import uniq from 'lodash/uniq';

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

const StyledBackgroundNonIndexedPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)};
  `}
  display: flex;
  flex-direction: column;
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
          <ComposedTokenIcon tokens={[txEvent.data.fromToken, txEvent.data.toToken]} size={8} />
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
          <ComposedTokenIcon tokens={[txEvent.data.tokenIn, txEvent.data.tokenOut]} size={8} />
          <StyledCellContainer direction="column">
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'13ch'} display="flex" alignItems="center">
              {txEvent.data.tokenIn.symbol} <ArrowRightIcon /> {txEvent.data.tokenOut.symbol}
            </StyledBodySmallRegularTypo2>
          </StyledCellContainer>
        </>
      );
  }
};

const formatAmountUsdElement = (txEvent: TransactionEvent, intl: ReturnType<typeof useIntl>): React.ReactElement => {
  let amountInUsd: string | undefined;

  switch (txEvent.type) {
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
      return <>-</>;
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.amount.amountInUSD, intl });
      break;
    case TransactionEventTypes.DCA_MODIFIED:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.difference.amountInUSD, intl });
      break;
    case TransactionEventTypes.DCA_WITHDRAW:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.withdrawn.amountInUSD, intl });
      break;
    case TransactionEventTypes.DCA_TERMINATED:
      amountInUsd = formatUsdAmount({
        amount: Number(txEvent.data.withdrawnRemaining.amountInUSD) + Number(txEvent.data.withdrawnSwapped.amountInUSD),
        intl,
      });
      break;
    case TransactionEventTypes.DCA_CREATED:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.funds.amountInUSD, intl });
      break;
    case TransactionEventTypes.SWAP:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.amountIn.amountInUSD, intl });
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
      <TableCell>
        <StyledCellContainer direction="column">
          <StyledBodySmallRegularTypo2>{dateTime.date}</StyledBodySmallRegularTypo2>
          <StyledBodySmallLabelTypography>{dateTime.time}</StyledBodySmallLabelTypography>
        </StyledCellContainer>
      </TableCell>
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
        <StyledCellContainer direction="column">
          <StyledBodySmallRegularTypo2>{transaction.tx.network.name}</StyledBodySmallRegularTypo2>
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <StyledCellContainer direction="column">
          {formatAmountElement(transaction, wallets, intl)}
          {formatAmountUsdElement(transaction, intl)}
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <StyledCellContainer direction="column">
          <StyledBodySmallRegularTypo2 noWrap maxWidth={'12ch'}>
            <Address address={sourceWallet} showDetailsOnHover trimAddress trimSize={4} />
          </StyledBodySmallRegularTypo2>
        </StyledCellContainer>
      </TableCell>
      <TableCell>
        <StyledViewReceiptButton onClick={() => setShowReceipt(transaction)}>
          <StyledCellContainer direction="column" align="center">
            <ReceiptIcon />
            <Typography variant="bodyExtraSmall" noWrap>
              <FormattedMessage description="viewMore" defaultMessage="View more" />
            </Typography>
          </StyledCellContainer>
        </StyledViewReceiptButton>
      </TableCell>
    </>
  );
};

const HistoryTableHeader = () => (
  <TableRow>
    <TableCell sx={{ width: '15%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="date" defaultMessage="Date" />
      </StyledBodySmallLabelTypography>
    </TableCell>
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
    <TableCell sx={{ width: '10%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="details" defaultMessage="Details" />
      </StyledBodySmallLabelTypography>
    </TableCell>
  </TableRow>
);

const UNIT_TYPE_STRING_MAP: Record<IncludedIndexerUnits, React.ReactNode> = {
  [IndexerUnits.ERC20_APPROVALS]: (
    <FormattedMessage description="history-table.not-indexed.unit.erc20Approvals" defaultMessage="Approvals" />
  ),
  [IndexerUnits.AGG_SWAPS]: (
    <FormattedMessage description="history-table.not-indexed.unit.aggSwaps" defaultMessage="Swaps" />
  ),
  [IndexerUnits.ERC20_TRANSFERS]: (
    <FormattedMessage description="history-table.not-indexed.unit.erc20Transfers" defaultMessage="Transfers" />
  ),
  [IndexerUnits.DCA]: (
    <FormattedMessage description="history-table.not-indexed.unit.dca" defaultMessage="Recurring investments" />
  ),
  [IndexerUnits.NATIVE_TRANSFERS]: (
    <FormattedMessage description="history-table.not-indexed.unit.nativeTransfers" defaultMessage="Native transfers" />
  ),
};

const HistoryTable = ({ search }: { search: string }) => {
  const { events, isLoading, fetchMore } = useTransactionsHistory();
  const wallets = useWallets().map((wallet) => wallet.address);
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();
  const themeMode = useThemeMode();
  const intl = useIntl();
  const labels = useStoredLabels();
  const trackEvent = useTrackEvent();
  const { isSomeWalletIndexed, hasLoadedEvents, unitsByChainPercentages } = useIsSomeWalletIndexed();
  const pushToHistory = usePushToHistory();

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

  const parsedReceipt = React.useMemo(() => parseTransactionEventToTransactionReceipt(showReceipt), [showReceipt]);

  const isLoadingWithoutEvents = isLoading && events.length === 0;

  const preFilteredEvents = React.useMemo(
    () => filterEventsByUnitIndexed(events, unitsByChainPercentages),
    [unitsByChainPercentages, events]
  );

  const filteredEvents = React.useMemo(
    () => filterEvents(preFilteredEvents, labels, search, intl),
    [search, preFilteredEvents, labels, intl, unitsByChainPercentages]
  );

  const onOpenReceipt = (tx: TransactionEvent) => {
    setShowReceipt(tx);
    trackEvent('History - View tx receipt', { type: tx.type });
  };

  const onGoToPosition = React.useCallback(
    ({ chainId, positionId, hub }: { chainId: number; hub: string; positionId: number }) => {
      const version = findHubAddressVersion(hub);
      pushToHistory(`/${chainId}/positions/${version}/${positionId}`);
    },
    [pushToHistory]
  );

  const nonIndexedUnitsGroups: { unit: IncludedIndexerUnits; chains: ChainId[]; percentage: number }[] =
    React.useMemo(() => {
      const unitsWithoutWallets = Object.entries(unitsByChainPercentages).reduce<
        {
          unit: IncludedIndexerUnits;
          chainId: number;
          address: AddressType;
          percentage: number;
        }[]
      >((acc, [address, unitsData]) => {
        const units: { unit: IncludedIndexerUnits; chainId: number; address: AddressType; percentage: number }[] = [];
        Object.entries(unitsData).forEach(([unit, chainsData]) => {
          Object.entries(chainsData).forEach(([chainId, chainData]) => {
            if (!chainData.isIndexed) {
              units.push({
                unit: unit as IncludedIndexerUnits,
                chainId: Number(chainId),
                address: address as AddressType,
                percentage: chainData.percentage,
              });
            }
          });
        });

        return [...acc, ...units];
      }, []);

      const unitsWithWallets = unitsWithoutWallets.reduce<
        Record<IncludedIndexerUnits, { percentage: number; wallets: number; chains: ChainId[] }>
      >(
        (acc, unitData) => {
          if (!acc[unitData.unit]) {
            // eslint-disable-next-line no-param-reassign
            acc[unitData.unit] = { percentage: unitData.percentage, wallets: 1, chains: [unitData.chainId] };
          } else {
            // eslint-disable-next-line no-param-reassign
            acc[unitData.unit].wallets += 1;
            // eslint-disable-next-line no-param-reassign
            acc[unitData.unit].percentage += unitData.percentage;
            acc[unitData.unit].chains.push(unitData.chainId);
          }

          return acc;
        },
        {
          [IndexerUnits.ERC20_APPROVALS]: { percentage: 0, wallets: 0, chains: [] },
          [IndexerUnits.AGG_SWAPS]: { percentage: 0, wallets: 0, chains: [] },
          [IndexerUnits.ERC20_TRANSFERS]: { percentage: 0, wallets: 0, chains: [] },
          [IndexerUnits.DCA]: { percentage: 0, wallets: 0, chains: [] },
          [IndexerUnits.NATIVE_TRANSFERS]: { percentage: 0, wallets: 0, chains: [] },
        }
      );

      return Object.entries(unitsWithWallets).reduce<
        { unit: IncludedIndexerUnits; chains: ChainId[]; percentage: number }[]
      >((acc, [unit, { percentage, wallets: walletsToDivide, chains }]) => {
        acc.push({
          unit: unit as IncludedIndexerUnits,
          chains: uniq(chains),
          percentage: percentage / walletsToDivide,
        });

        return acc;
      }, []);
    }, [unitsByChainPercentages]);

  return (
    <ContainerBox flexDirection="column" flex={1} gap={6}>
      {!isSomeWalletIndexed && !!wallets.length && hasLoadedEvents && (
        <StyledBackgroundNonIndexedPaper variant="outlined">
          <Typography variant="h6Bold" color={({ palette }) => colors[palette.mode].typography.typo2}>
            <FormattedMessage
              defaultMessage="Indexing Your Transaction History"
              description="history.not-indexed.title"
            />
          </Typography>
          <Grid container columnSpacing={8}>
            <Grid item xs={4}>
              <Typography variant="bodySmallRegular" display="inline-block">
                <FormattedMessage
                  defaultMessage="We are currently retrieving and organizing your transaction history. This process may take some time. Transactions are indexed from the oldest to the most recent. You can start viewing the completed segments of your history as they become available."
                  description="history.not-indexed.subtitle"
                />
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Grid container rowSpacing={5} columnSpacing={8}>
                {nonIndexedUnitsGroups.map(({ unit, chains, percentage }) => (
                  <Grid item xs={12} sm={6} md={4} key={unit}>
                    <ContainerBox gap={2} alignItems="center">
                      <ComposedTokenIcon
                        tokens={chains.map((chainId) => toToken({ logoURI: getGhTokenListLogoUrl(chainId, 'logo') }))}
                        size={6}
                      />
                      <Typography variant="bodySmallRegular">{UNIT_TYPE_STRING_MAP[unit]}</Typography>
                      <ContainerBox gap={2} justifyContent="flex-end" flex={1}>
                        <CircularProgressWithBrackground
                          sx={{ display: 'flex' }}
                          size={SPACING(6)}
                          value={percentage * 100}
                          thickness={6}
                        />
                        <Typography variant="bodySmallLabel">{(percentage * 100).toFixed(0)}%</Typography>
                      </ContainerBox>
                    </ContainerBox>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </StyledBackgroundNonIndexedPaper>
      )}
      <StyledBackgroundPaper variant="outlined">
        {!isLoading && !wallets.length ? (
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
          onClickPositionId={onGoToPosition}
        />
      </StyledBackgroundPaper>
    </ContainerBox>
  );
};

export default HistoryTable;
