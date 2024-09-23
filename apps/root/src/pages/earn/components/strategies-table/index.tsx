import React from 'react';
import { AmountsOfToken, EarnPosition, Strategy } from 'common-types';
import {
  BackgroundPaper,
  ContainerBox,
  DividerBorder2,
  Skeleton,
  StyledBodySmallLabelTypography,
  StyledBodySmallRegularTypo2,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  AnimatedChevronRightIcon,
  colors,
  DividerBorder1,
  Typography,
  useMediaQuery,
  useTheme,
} from 'ui-library';
import styled from 'styled-components';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { debounce, flatten } from 'lodash';
import { StrategyColumnConfig, StrategyColumnKeys } from './components/columns';
import usePushToHistory from '@hooks/usePushToHistory';
import { setOrderBy, setSearch } from '@state/strategies-filters/actions';
import AllStrategiesTableToolbar from './components/toolbar';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';
import { FormattedMessage } from 'react-intl';
import { usdFormatter } from '@common/utils/parsing';
import { getStrategyFromTableObject, parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';
import StrategiesList from '../strategies-list';

export type StrategyWithWalletBalance = Strategy & {
  walletBalance?: AmountsOfToken;
};

export type TableStrategy<T extends StrategiesTableVariants> = T extends StrategiesTableVariants.ALL_STRATEGIES
  ? StrategyWithWalletBalance
  : T extends StrategiesTableVariants.USER_STRATEGIES
    ? EarnPosition[]
    : never;

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({ variant: 'outlined', elevation: 0 })`
  ${({ theme: { palette, spacing } }) => `
    padding: 0px ${spacing(4)} ${spacing(4)} ${spacing(4)};
    background-color: ${colors[palette.mode].background.quarteryNoAlpha};
  `}
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledTableEnd = styled(TableCell)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(1)} 0px !important;
  `}
  height: 1px;
`;

const StyledNavContainer = styled(ContainerBox)`
  height: 100%;
  width: 50px;
  margin: 0 auto;
`;

const StyledTableCell = styled(TableCell)`
  ${({ theme: { spacing } }) => `
  height: ${spacing(14.5)};
  padding-top: ${spacing(0.5)};
  padding-bottom: ${spacing(0.5)};
`}
`;

const StrategiesTableHeader = <T extends StrategiesTableVariants>({
  columns,
  variant,
}: {
  columns: StrategyColumnConfig<T>[];
  variant: T;
}) => {
  const dispatch = useAppDispatch();
  const { orderBy } = useStrategiesFilters(variant);

  const onRequestSort = (column: StrategyColumnKeys) => {
    const isAsc = orderBy.column === column && orderBy.order === 'asc';
    const order = isAsc ? 'desc' : 'asc';
    dispatch(setOrderBy({ variant, column, order }));
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <StyledTableCell key={column.key} sortDirection={orderBy.column === column.key ? orderBy.order : false}>
            {column.getOrderValue ? (
              <TableSortLabel
                active={orderBy.column === column.key}
                direction={orderBy.column === column.key ? orderBy.order : 'asc'}
                onClick={() => onRequestSort(column.key)}
                hideSortIcon
              >
                <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
              </TableSortLabel>
            ) : (
              <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
            )}
          </StyledTableCell>
        ))}
        <StyledTableEnd size="small"></StyledTableEnd>
      </TableRow>
    </TableHead>
  );
};

const ROWS_PER_PAGE = 7;

const skeletonRows = Array.from(Array(ROWS_PER_PAGE).keys());

const AllStrategiesTableBodySkeleton = <T extends StrategiesTableVariants>({
  columns,
}: {
  columns: StrategyColumnConfig<T>[];
}) => (
  <>
    {skeletonRows.map((i) => (
      <TableRow key={i}>
        {columns.map((col) => (
          <StyledTableCell key={col.key}>
            {col.customSkeleton || (
              <StyledBodySmallRegularTypo2>
                <Skeleton variant="text" animation="wave" />
              </StyledBodySmallRegularTypo2>
            )}
          </StyledTableCell>
        ))}
        <StyledTableEnd size="small"></StyledTableEnd>
      </TableRow>
    ))}
  </>
);
interface RowProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  rowData: TableStrategy<T>;
  onRowClick: (strategy: Strategy) => void;
  variant: T;
}

const renderBodyCell = (cell: React.ReactNode | string) =>
  typeof cell === 'string' ? <StyledBodySmallRegularTypo2>{cell}</StyledBodySmallRegularTypo2> : cell;

const Row = <T extends StrategiesTableVariants>({ columns, rowData, onRowClick, variant }: RowProps<T>) => {
  const [hovered, setHovered] = React.useState(false);

  const strategy = getStrategyFromTableObject(rowData, variant);

  return (
    <TableRow
      key={strategy.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ cursor: 'pointer' }}
      hover
      onClick={() => onRowClick(strategy)}
    >
      {columns.map((column) => (
        <StyledTableCell key={`${strategy.id}-${column.key}`}>
          {renderBodyCell(column.renderCell(rowData))}
        </StyledTableCell>
      ))}
      <StyledTableEnd size="small">
        <StyledNavContainer alignItems="center">
          <DividerBorder2 orientation="vertical" />
          <AnimatedChevronRightIcon $hovered={hovered} color="primary" />
        </StyledNavContainer>
      </StyledTableEnd>
    </TableRow>
  );
};

const createEmptyRows = (rowCount: number) => {
  return Array.from({ length: rowCount }, (_, i) => (
    <TableRow key={i} sx={{ visibility: 'hidden' }}>
      <StyledTableCell colSpan={7}>&nbsp;</StyledTableCell>
    </TableRow>
  ));
};

interface TotalRowProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  strategies: TableStrategy<T>[];
  variant: T;
}

const StyledTotalRow = styled(TableRow)`
  background-color: transparent !important;
  position: relative;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledDividerContainer = styled(ContainerBox)`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
`;
const TotalRow = <T extends StrategiesTableVariants>({ columns, strategies, variant }: TotalRowProps<T>) => {
  const totalInvested = React.useMemo(() => {
    if (variant === StrategiesTableVariants.ALL_STRATEGIES) {
      return { totalInvestedUsd: 0, currentProfitUsd: 0, currentProfitRate: 0, earnings: {} };
    }
    const userStrategies = strategies as EarnPosition[][];

    return parseUserStrategiesFinancialData(flatten(userStrategies));
  }, [strategies]);

  return (
    <StyledTotalRow>
      <StyledTableCell>
        <Typography variant="bodyBold">
          <FormattedMessage id="strategies-table.total" defaultMessage="Total" />
        </Typography>
      </StyledTableCell>
      {columns.slice(1).map((column) => (
        <StyledTableCell key={column.key}>
          {column.key === StrategyColumnKeys.TOTAL_INVESTED ? (
            <Typography variant="bodyBold">{`$${usdFormatter(totalInvested.totalInvestedUsd)}`}</Typography>
          ) : null}
          {column.key === StrategyColumnKeys.CURRENT_PROFIT ? (
            <Typography variant="bodyBold" color="success.dark">
              +{usdFormatter(totalInvested.currentProfitUsd)}
            </Typography>
          ) : null}
        </StyledTableCell>
      ))}
      <StyledDividerContainer flexDirection="column" fullWidth>
        <DividerBorder1 />
      </StyledDividerContainer>
    </StyledTotalRow>
  );
};

interface StrategiesTableProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  strategies: TableStrategy<T>[];
  variant: T;
  isLoading: boolean;
  showTotal?: boolean;
}

const StrategiesTable = <T extends StrategiesTableVariants>({
  columns,
  strategies,
  isLoading,
  variant,
  showTotal = false,
}: StrategiesTableProps<T>) => {
  const [page, setPage] = React.useState(0);
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();
  const { breakpoints } = useTheme();

  const shouldShowMobileList = useMediaQuery(breakpoints.down('lg'));

  const onRowClick = React.useCallback(
    (strategy: Strategy) => {
      pushToHistory(`/earn/vaults/${strategy.network.chainId}/${strategy.id}`);
      trackEvent('Earn Vault List - Go to vault details', {
        chainId: strategy.network.chainId,
      });
    },
    [pushToHistory, trackEvent]
  );

  const handleSearchChange = debounce((newValue: string) => {
    setPage(0);
    dispatch(setSearch({ variant, value: newValue }));
  }, 500);

  const visibleRows = React.useMemo(
    () => strategies.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [page, strategies]
  );

  const displayColumns = columns.filter((col) => !col.hidden);

  // Keeps the table height consistent
  const emptyRows = createEmptyRows(ROWS_PER_PAGE - visibleRows.length);

  return (
    <ContainerBox flexDirection="column" gap={5} flex={1}>
      <AllStrategiesTableToolbar
        strategiesCount={strategies.length}
        isLoading={isLoading}
        handleSearchChange={handleSearchChange}
        variant={variant}
      />
      {shouldShowMobileList ? (
        <StrategiesList
          totalCount={strategies.length}
          rowsPerPage={ROWS_PER_PAGE}
          page={page}
          setPage={setPage}
          variant={variant}
          visibleStrategies={visibleRows}
          isLoading={isLoading}
        />
      ) : (
        <TableContainer component={StyledBackgroundPaper}>
          <Table sx={{ tableLayout: 'auto' }}>
            <StrategiesTableHeader columns={displayColumns} variant={variant} />
            <TableBody>
              {isLoading ? (
                <AllStrategiesTableBodySkeleton columns={displayColumns} />
              ) : (
                <>
                  {visibleRows.map((row, index) => (
                    <Row key={index} columns={displayColumns} rowData={row} onRowClick={onRowClick} variant={variant} />
                  ))}
                  {emptyRows}
                  {showTotal && <TotalRow columns={displayColumns} variant={variant} strategies={strategies} />}
                </>
              )}
            </TableBody>
          </Table>
          <TablePagination
            count={strategies.length}
            rowsPerPage={ROWS_PER_PAGE}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
          />
        </TableContainer>
      )}
    </ContainerBox>
  );
};

export default StrategiesTable;
