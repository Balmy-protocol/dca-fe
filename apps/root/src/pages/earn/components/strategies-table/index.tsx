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
} from 'ui-library';
import styled from 'styled-components';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { debounce } from 'lodash';
import { StrategyColumnConfig, StrategyColumnKeys } from './components/columns';
import usePushToHistory from '@hooks/usePushToHistory';
import { setOrderBy, setSearch } from '@state/strategies-filters/actions';
import AllStrategiesTableToolbar from './components/toolbar';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';

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

  let strategy: Strategy;
  if (variant === StrategiesTableVariants.ALL_STRATEGIES) {
    strategy = rowData as Strategy;
  } else {
    strategy = (rowData as EarnPosition[])[0].strategy;
  }

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

interface StrategiesTableProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  strategies: TableStrategy<T>[];
  variant: T;
  isLoading: boolean;
}

const StrategiesTable = <T extends StrategiesTableVariants>({
  columns,
  strategies,
  isLoading,
  variant,
}: StrategiesTableProps<T>) => {
  const [page, setPage] = React.useState(0);
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();

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
      <AllStrategiesTableToolbar isLoading={isLoading} handleSearchChange={handleSearchChange} variant={variant} />
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
    </ContainerBox>
  );
};

export default StrategiesTable;
