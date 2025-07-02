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
  VirtualizedTableContext,
  Grid,
  CircularProgressWithBrackground,
  SPACING,
  HiddenNumber,
  ClockIcon,
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
  TokenListId,
  TransactionEvent,
  TransactionEventTypes,
  TransactionStatus,
} from '@types';
import { useShowBalances, useThemeMode } from '@state/config/hooks';
import Address from '@common/components/address';
import { findHubAddressVersion, totalSupplyThreshold } from '@common/utils/parsing';
import useWallets from '@hooks/useWallets';
import parseTransactionEventToTransactionReceipt from '@common/utils/transaction-history/transaction-receipt-parser';
import { isUndefined } from 'lodash';
import { toToken } from '@common/utils/currency';
import {
  filterEventsByUnitIndexed,
  getTransactionPriceColor,
  getTransactionTitle,
  getTransactionUsdValue,
  getTransactionValue,
  IncludedIndexerUnits,
} from '@common/utils/transaction-history';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { filterEvents } from '@common/utils/transaction-history/search';
import useStoredLabels from '@hooks/useStoredLabels';
import useIsSomeWalletIndexed from '@hooks/useIsSomeWalletIndexed';
import useAnalytics from '@hooks/useAnalytics';
import usePushToHistory from '@hooks/usePushToHistory';
import useStoredTransactionHistory from '@hooks/useStoredTransactionHistory';
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

const StyledBackgroundPaper = styled(BackgroundPaper)<{ $solid?: boolean }>`
  ${({ theme: { space, palette }, $solid }) => `
    padding: 0px ${space.s04} ${space.s04};
    ${$solid || palette.mode === 'dark' ? `background: ${colors[palette.mode].background.quarteryNoAlpha};backdrop-filter: blur(30px);` : ''}
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
  padding: 0 !important;
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
          <StyledCellContainer align="center" direction="column" gap={0.5}>
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

const formatAmountElement = (txEvent: TransactionEvent, intl: ReturnType<typeof useIntl>): React.ReactElement => {
  const amount = getTransactionValue(txEvent, intl);
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
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
      return (
        <>
          {txEvent.data.depositToken.icon}
          <StyledCellContainer direction="column">
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'6ch'}>
              {txEvent.data.depositToken.symbol || '-'}
            </StyledBodySmallRegularTypo2>
            <StyledBodySmallLabelTypography noWrap maxWidth={'12ch'}>
              {txEvent.data.depositToken.name || '-'}
            </StyledBodySmallLabelTypography>
          </StyledCellContainer>
        </>
      );
    case TransactionEventTypes.EARN_WITHDRAW:
      const withdrawnAsset = txEvent.data.withdrawn[0];
      const isWithdrawingAsset = withdrawnAsset.amount.amount > 0n;
      const isWithdrawingRewards = txEvent.data.withdrawn.some(
        (withdraw) => withdraw.token.address !== withdrawnAsset.token.address && withdraw.amount.amount > 0n
      );

      const tokens = txEvent.data.withdrawn
        .filter((withdrawn) => withdrawn.amount.amount > 0n)
        .map((withdrawn) => withdrawn.token);

      return (
        <>
          <ComposedTokenIcon tokens={tokens} size={8} />
          <StyledCellContainer direction="column">
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'13ch'} display="flex" alignItems="center">
              {isWithdrawingAsset && withdrawnAsset.token.symbol}
              {isWithdrawingRewards && isWithdrawingAsset && ' + '}
              {isWithdrawingRewards && (
                <FormattedMessage defaultMessage="Rewards" description="history-table.token.earn.withdraw" />
              )}
            </StyledBodySmallRegularTypo2>
          </StyledCellContainer>
        </>
      );
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      const specialWithdrawToken = txEvent.data.tokens[0].token;
      return (
        <>
          {specialWithdrawToken.icon}
          <StyledCellContainer direction="column">
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'6ch'}>
              {specialWithdrawToken.symbol}
            </StyledBodySmallRegularTypo2>
            <StyledBodySmallLabelTypography noWrap maxWidth={'12ch'}>
              {specialWithdrawToken.name}
            </StyledBodySmallLabelTypography>
          </StyledCellContainer>
        </>
      );
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return (
        <>
          {txEvent.data.token.icon}
          <StyledCellContainer direction="column">
            <StyledBodySmallRegularTypo2 noWrap maxWidth={'13ch'} display="flex" alignItems="center">
              {txEvent.data.token.symbol}
            </StyledBodySmallRegularTypo2>
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
      time: DateTime.fromMillis(Date.now()).toLocaleString({
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

interface TableContext extends VirtualizedTableContext {
  setShowReceipt: SetStateCallback<TransactionEvent>;
  themeMode: 'light' | 'dark';
  intl: ReturnType<typeof useIntl>;
  showBalances: boolean;
}

const VirtuosoTableComponents = buildVirtuosoTableComponents<TransactionEvent, TableContext>();

const HistoryTableRow: ItemContent<TransactionEvent, TableContext> = (
  index: number,
  txEvent: TransactionEvent,
  { setShowReceipt, intl, showBalances }
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
          {showBalances ? (
            formatAmountElement(transaction, intl)
          ) : (
            <HiddenNumber size="medium" justifyContent="flex-start" />
          )}
          {showBalances ? (
            <StyledBodySmallLabelTypography>
              ${getTransactionUsdValue(transaction, intl)}
            </StyledBodySmallLabelTypography>
          ) : null}
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
          <StyledCellContainer direction="column" align="center" gap={0.5}>
            <ReceiptIcon sx={({ palette: { mode } }) => ({ color: colors[mode].accent.primary })} />
            <Typography variant="bodyExtraExtraSmallBold" color="inherit">
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

const StyledNoWalletIconContainer = styled(ContainerBox)`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
    border-radius: 50%;
    border: 1px solid ${colors[mode].border.border1};
    backdrop-filter: blur(15.294119834899902px);
    padding: ${spacing(5)};
    box-shadow: 0px 20px 25px rgba(150, 140, 242, 0.25);
  `}
`;

const NoHistoryYet = ({ height }: { height?: React.CSSProperties['height'] }) => {
  const themeMode = useThemeMode();
  return (
    <StyledCellContainer
      direction="column"
      align="center"
      gap={6}
      style={{ minHeight: height || '500px', justifyContent: 'center' }}
    >
      <StyledNoWalletIconContainer>
        <ClockIcon fontSize="large" />
      </StyledNoWalletIconContainer>
      <ContainerBox flexDirection="column" gap={2} justifyContent="center" alignItems="center">
        <Typography variant="h5Bold" color={colors[themeMode].typography.typo3}>
          <FormattedMessage description="noActivityTitle" defaultMessage="No Activity Yet" />
        </Typography>
        <Typography variant="bodyRegular" textAlign="center" color={colors[themeMode].typography.typo3}>
          <FormattedMessage
            description="noActivityParagraph"
            defaultMessage="Once you start making transactions, you'll see all your activity here"
          />
        </Typography>
      </ContainerBox>
    </StyledCellContainer>
  );
};

interface HistoryTableProps {
  search?: string;
  tokens?: TokenListId[];
  height?: React.CSSProperties['height'];
  solid?: boolean;
}

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
  [IndexerUnits.EARN]: <FormattedMessage description="history-table.not-indexed.unit.earn" defaultMessage="Earn" />,
  [IndexerUnits.NATIVE_TRANSFERS]: (
    <FormattedMessage description="history-table.not-indexed.unit.nativeTransfers" defaultMessage="Native transfers" />
  ),
};

const HistoryTable = ({ search, tokens, height, solid }: HistoryTableProps) => {
  const { events, isLoading, fetchMore } = useTransactionsHistory(tokens);
  const wallets = useWallets().map((wallet) => wallet.address);
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();
  const themeMode = useThemeMode();
  const intl = useIntl();
  const labels = useStoredLabels();
  const { trackEvent } = useAnalytics();
  const { isSomeWalletIndexed, hasLoadedEvents, unitsByChainPercentages } = useIsSomeWalletIndexed();
  const pushToHistory = usePushToHistory();
  const initialFetchedRef = React.useRef(false);
  const { history: globalHistory } = useStoredTransactionHistory();
  const showBalances = useShowBalances();

  const parsedReceipt = React.useMemo(() => parseTransactionEventToTransactionReceipt(showReceipt), [showReceipt]);

  const isLoadingWithoutEvents = isLoading && events.length === 0;

  const preFilteredEvents = React.useMemo(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    () => filterEventsByUnitIndexed(events, unitsByChainPercentages),
    [unitsByChainPercentages, events]
  );

  const filteredEvents = React.useMemo(
    () => filterEvents(preFilteredEvents, labels, search || '', intl),
    [search, preFilteredEvents, labels, intl, unitsByChainPercentages]
  );

  const onOpenReceipt = (tx: TransactionEvent) => {
    setShowReceipt(tx);
    trackEvent('History - View tx receipt', { type: tx.type });
  };

  const onGoToPosition = React.useCallback(
    ({ chainId, positionId, hub }: { chainId: number; hub: string; positionId: number }) => {
      const version = findHubAddressVersion(hub);
      pushToHistory(`/invest/positions/${chainId}/${version}/${positionId}`);
      trackEvent('History - Tx Receipt - View position');
    },
    [pushToHistory, trackEvent]
  );

  const onGoToEarnPosition = React.useCallback(
    ({ chainId, strategyId }: { chainId: number; strategyId: string }) => {
      pushToHistory(`/earn/vaults/${chainId}/${strategyId}`);
      trackEvent('History - Tx Receipt - View earn position');
    },
    [pushToHistory, trackEvent]
  );

  React.useEffect(() => {
    // When global events are first fetched, but with no token coincidence, we need to manually trigger a fetchMore
    if (globalHistory && globalHistory.events.length > 0 && events.length === 0 && !initialFetchedRef.current) {
      initialFetchedRef.current = true;
      void fetchMore();
    }
  }, [globalHistory, events]);

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
        Partial<Record<IncludedIndexerUnits, { percentage: number; wallets: number; chains: ChainId[] }>>
      >((acc, unitData) => {
        let savedUnit = acc[unitData.unit];
        if (!savedUnit) {
          savedUnit = { percentage: unitData.percentage, wallets: 1, chains: [unitData.chainId] };
        } else {
          savedUnit.wallets += 1;
          savedUnit.percentage += unitData.percentage;
          savedUnit.chains.push(unitData.chainId);
        }

        // eslint-disable-next-line no-param-reassign
        acc[unitData.unit] = savedUnit;

        return acc;
      }, {});

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
          <Typography variant="bodyBold">
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
                        marginRight={5}
                      />
                      <Typography variant="bodySmallRegular">{UNIT_TYPE_STRING_MAP[unit]}</Typography>
                      <ContainerBox gap={2} justifyContent="flex-end" flex={1}>
                        <CircularProgressWithBrackground
                          sx={{ display: 'flex' }}
                          size={SPACING(6)}
                          value={percentage * 100}
                          thickness={6}
                        />
                        <Typography variant="labelRegular" display="flex" alignItems="center">
                          {(percentage * 100).toFixed(0)}%
                        </Typography>
                      </ContainerBox>
                    </ContainerBox>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </StyledBackgroundNonIndexedPaper>
      )}
      <StyledBackgroundPaper variant="outlined" $solid={solid}>
        {!isLoading && !wallets.length ? (
          <NoHistoryYet height={height} />
        ) : (
          <VirtualizedTable
            data={filteredEvents}
            VirtuosoTableComponents={VirtuosoTableComponents}
            header={HistoryTableHeader}
            itemContent={isLoadingWithoutEvents ? HistoryTableBodySkeleton : HistoryTableRow}
            fetchMore={fetchMore}
            context={{
              setShowReceipt: onOpenReceipt,
              themeMode,
              intl,
              showBalances,
            }}
            height={height}
          />
        )}
        <TransactionReceipt
          transaction={parsedReceipt}
          open={!isUndefined(showReceipt)}
          onClose={() => setShowReceipt(undefined)}
          onClickPositionId={onGoToPosition}
          onClickEarnPositionId={onGoToEarnPosition}
          showBalances={showBalances}
        />
      </StyledBackgroundPaper>
    </ContainerBox>
  );
};

export default HistoryTable;
