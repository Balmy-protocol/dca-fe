import React from 'react';
import { Strategy } from 'common-types';
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
import { StrategyColumnConfig, strategyColumnConfigs, StrategyColumnKeys } from './components/columns';
import usePushToHistory from '@hooks/usePushToHistory';
import { setOrderBy, setSearch } from '@state/strategies-filters/actions';
import AllStrategiesTableToolbar from './components/toolbar';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { useDispatch } from 'react-redux';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';

export type TableStrategy = Strategy;

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

const StrategiesTableHeader = ({
  columns,
  variant,
}: {
  columns: StrategyColumnConfig[];
  variant: StrategiesTableVariants;
}) => {
  const dispatch = useDispatch();
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
          <TableCell key={column.key} sortDirection={orderBy.column === column.key ? orderBy.order : false}>
            {column.getOrderValue ? (
              <TableSortLabel
                active={orderBy.column === column.key}
                direction={orderBy.column === column.key ? orderBy.order : 'asc'}
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

const StrategiesTable = ({
  strategies,
  isLoading,
  variant,
}: {
  strategies: TableStrategy[];
  isLoading: boolean;
  variant: StrategiesTableVariants;
}) => {
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
    dispatch(setSearch({ variant, value: newValue }));
  }, 500);

  const visibleRows = React.useMemo<TableStrategy[]>(
    () => strategies.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [page, strategies]
  );

  // Keeps the table height consistent
  const emptyRows = createEmptyRows(ROWS_PER_PAGE - visibleRows.length);

  return (
    <ContainerBox flexDirection="column" gap={5} flex={1}>
      <AllStrategiesTableToolbar isLoading={isLoading} handleSearchChange={handleSearchChange} variant={variant} />
      <TableContainer component={StyledBackgroundPaper}>
        <Table sx={{ tableLayout: 'auto' }}>
          <StrategiesTableHeader columns={strategyColumnConfigs} variant={variant} />
          <TableBody>
            {isLoading ? (
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
    </ContainerBox>
  );
};

export default StrategiesTable;
