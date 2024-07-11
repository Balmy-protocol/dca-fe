import React from 'react';
import { Strategy } from 'common-types';
import {
  BackgroundPaper,
  ContainerBox,
  DividerBorder2,
  Paper,
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
} from 'ui-library';
import styled from 'styled-components';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { debounce } from 'lodash';
import { StrategyColumnConfig, strategyColumnConfigs, StrategyColumnKeys } from './components/columns';
import usePushToHistory from '@hooks/usePushToHistory';
import { setSearch } from '@state/all-strategies-filters/actions';
import AllStrategiesTableToolbar from './components/toolbar';

export type TableStrategy = Strategy;

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    padding: 0px ${spacing(4)} ${spacing(4)} ${spacing(4)};
  `}
  flex: 1;
  display: flex;
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

type Order = 'asc' | 'desc';

function getComparator<Key extends StrategyColumnKeys>(
  order: Order,
  orderBy: Key
): (a: TableStrategy, b: TableStrategy) => number {
  return (a, b) => {
    const column = strategyColumnConfigs.find((config) => config.key === orderBy);
    if (column && column.getOrderValue) {
      const aValue = column.getOrderValue(a);
      const bValue = column.getOrderValue(b);
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (order === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    }
    return 0;
  };
}

const StrategiesTableHeader = ({
  columns,
  order,
  orderBy,
  onRequestSort,
}: {
  columns: StrategyColumnConfig[];
  order: Order;
  orderBy?: StrategyColumnKeys;
  onRequestSort: (property: StrategyColumnKeys) => void;
}) => {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column.key} sortDirection={orderBy === column.key ? order : false}>
            {column.getOrderValue ? (
              <TableSortLabel
                active={orderBy === column.key}
                direction={orderBy === column.key ? order : 'asc'}
                onClick={() => onRequestSort(column.key)}
              >
                <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
              </TableSortLabel>
            ) : (
              <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
            )}
          </TableCell>
        ))}
        <StyledTableEnd size="small"></StyledTableEnd>
      </TableRow>
    </TableHead>
  );
};

const ROWS_PER_PAGE = 7;

const skeletonRows = Array.from(Array(ROWS_PER_PAGE).keys());

const AllStrategiesTableBodySkeleton = () => (
  <>
    {skeletonRows.map((i) => (
      <TableRow key={i}>
        {strategyColumnConfigs.map((col) => (
          <TableCell key={col.key}>
            {col.customSkeleton || (
              <StyledBodySmallRegularTypo2>
                <Skeleton variant="text" animation="wave" />
              </StyledBodySmallRegularTypo2>
            )}
          </TableCell>
        ))}
        <StyledTableEnd size="small"></StyledTableEnd>
      </TableRow>
    ))}
  </>
);
interface RowProps {
  strategy: Strategy;
  onRowClick: (strategy: Strategy) => void;
}

const renderBodyCell = (cell: React.ReactNode | string) =>
  typeof cell === 'string' ? <StyledBodySmallRegularTypo2>{cell}</StyledBodySmallRegularTypo2> : cell;

const Row = ({ strategy, onRowClick }: RowProps) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <TableRow
      key={strategy.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ cursor: 'pointer' }}
      hover
      onClick={() => onRowClick(strategy)}
    >
      {strategyColumnConfigs.map((column) => (
        <TableCell key={`${strategy.id}-${column.key}`}>{renderBodyCell(column.renderCell(strategy))}</TableCell>
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
    <TableRow key={i} sx={{ visibility: 'hidden', height: ({ spacing }) => spacing(15.25) }}>
      <TableCell colSpan={7}>&nbsp;</TableCell>
    </TableRow>
  ));
};

const AllStrategiesTable = ({
  strategies,
  hasFetchedAllStrategies,
  defaultOrderBy,
}: {
  strategies: TableStrategy[];
  hasFetchedAllStrategies: boolean;
  defaultOrderBy: StrategyColumnKeys;
}) => {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<StrategyColumnKeys>(defaultOrderBy);
  const [page, setPage] = React.useState(0);
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();

  const onRowClick = React.useCallback(
    (strategy: TableStrategy) => {
      pushToHistory(`/earn/vaults/${strategy.network.chainId}/${strategy.id}`);
      trackEvent('Earn Vault List - Go to vault details', {
        chainId: strategy.network.chainId,
      });
    },
    [pushToHistory, trackEvent]
  );

  const handleSearchChange = debounce((newValue: string) => {
    setPage(0);
    dispatch(setSearch(newValue));
  }, 500);

  const visibleRows = React.useMemo<TableStrategy[]>(
    () =>
      strategies
        .slice()
        .sort(getComparator(order, orderBy))
        .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [page, strategies, order, orderBy]
  );

  // Keeps the table height consistent
  const emptyRows = createEmptyRows(ROWS_PER_PAGE - visibleRows.length);

  const handleRequestSort = (property: StrategyColumnKeys) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <ContainerBox flexDirection="column" gap={5} flex={1}>
      <AllStrategiesTableToolbar isLoading={!hasFetchedAllStrategies} handleSearchChange={handleSearchChange} />
      <StyledBackgroundPaper variant="outlined">
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ tableLayout: 'auto' }}>
            <StrategiesTableHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              columns={strategyColumnConfigs}
            />
            <TableBody>
              {!hasFetchedAllStrategies ? (
                <AllStrategiesTableBodySkeleton />
              ) : (
                <>
                  {visibleRows.map((row) => (
                    <Row key={row.id} strategy={row} onRowClick={onRowClick} />
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
      </StyledBackgroundPaper>
    </ContainerBox>
  );
};

export default AllStrategiesTable;
