import React from 'react';
import { AmountsOfToken, EarnPosition, SetStateCallback, Strategy } from 'common-types';
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
  DividerBorder1,
  Typography,
  Hidden,
  SortIcon,
} from 'ui-library';
import styled from 'styled-components';
import { useAppDispatch } from '@state/hooks';
import { flatten } from 'lodash';
import { StrategyColumnConfig, StrategyColumnKeys } from './components/columns';
import { setOrderBy } from '@state/strategies-filters/actions';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';
import { FormattedMessage } from 'react-intl';
import { usdFormatter } from '@common/utils/parsing';
import { getStrategyFromTableObject, parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';

export type StrategyWithWalletBalance = Strategy & {
  walletBalance?: AmountsOfToken;
};

export type TableStrategy<T extends StrategiesTableVariants> = T extends StrategiesTableVariants.ALL_STRATEGIES
  ? StrategyWithWalletBalance
  : T extends StrategiesTableVariants.USER_STRATEGIES
    ? EarnPosition[]
    : never;

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: 0px ${spacing(4)} ${spacing(4)} ${spacing(4)};
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

const StyledBodyTableCell = styled(TableCell)`
  ${({ theme: { spacing } }) => `
  height: ${spacing(14.5)};
  padding-top: ${spacing(0.5)};
  padding-bottom: ${spacing(0.5)};
`}
`;

const StyledHeaderTableRow = styled(TableRow)`
  background-color: transparent !important;
  &:hover {
    background-color: transparent !important;
  }
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
      <StyledHeaderTableRow>
        {columns.map((column) => (
          <Hidden {...column.hiddenProps} key={column.key}>
            <TableCell key={column.key} sortDirection={orderBy.column === column.key ? orderBy.order : false}>
              {column.getOrderValue ? (
                <TableSortLabel
                  active={orderBy.column === column.key}
                  direction={orderBy.column === column.key ? orderBy.order : 'asc'}
                  onClick={() => onRequestSort(column.key)}
                  IconComponent={() => (
                    <SortIcon direction={orderBy.column === column.key ? orderBy.order : undefined} />
                  )}
                >
                  <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
                </TableSortLabel>
              ) : (
                <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
              )}
            </TableCell>
          </Hidden>
        ))}
        <StyledTableEnd size="small"></StyledTableEnd>
      </StyledHeaderTableRow>
    </TableHead>
  );
};

const AllStrategiesTableBodySkeleton = <T extends StrategiesTableVariants>({
  columns,
  rowsPerPage,
}: {
  columns: StrategyColumnConfig<T>[];
  rowsPerPage: number;
}) => (
  <>
    {Array.from(Array(rowsPerPage).keys()).map((i) => (
      <TableRow key={i}>
        {columns.map((col) => (
          <StyledBodyTableCell key={col.key}>
            {col.customSkeleton || (
              <StyledBodySmallRegularTypo2>
                <Skeleton variant="text" animation="wave" />
              </StyledBodySmallRegularTypo2>
            )}
          </StyledBodyTableCell>
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
        <Hidden {...column.hiddenProps} key={`${strategy.id}-${column.key}`}>
          <StyledBodyTableCell key={`${strategy.id}-${column.key}`}>
            {renderBodyCell(column.renderCell(rowData))}
          </StyledBodyTableCell>
        </Hidden>
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
      <StyledBodyTableCell colSpan={7}>&nbsp;</StyledBodyTableCell>
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
      <TableCell>
        <Typography variant="bodyBold">
          <FormattedMessage id="strategies-table.total" defaultMessage="Total" />
        </Typography>
      </TableCell>
      {columns.slice(1).map((column) => (
        <Hidden {...column.hiddenProps} key={column.key}>
          <TableCell key={column.key}>
            {column.key === StrategyColumnKeys.TOTAL_INVESTED ? (
              <Typography variant="bodyBold">{`$${usdFormatter(totalInvested.totalInvestedUsd)}`}</Typography>
            ) : null}
            {column.key === StrategyColumnKeys.CURRENT_PROFIT ? (
              <Typography variant="bodyBold" color="success.dark">
                +{usdFormatter(totalInvested.currentProfitUsd)}
              </Typography>
            ) : null}
          </TableCell>
        </Hidden>
      ))}
      <StyledDividerContainer flexDirection="column" fullWidth>
        <DividerBorder1 />
      </StyledDividerContainer>
    </StyledTotalRow>
  );
};

interface StrategiesTableProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  visibleRows: TableStrategy<T>[];
  variant: T;
  isLoading: boolean;
  showTotal?: boolean;
  page: number;
  setPage: SetStateCallback<number>;
  onGoToStrategy: (strategy: Strategy) => void;
  strategies: TableStrategy<T>[];
  rowsPerPage: number;
}

const StrategiesTable = <T extends StrategiesTableVariants>({
  columns,
  visibleRows,
  variant,
  isLoading,
  showTotal = false,
  page,
  setPage,
  onGoToStrategy,
  strategies,
  rowsPerPage,
}: StrategiesTableProps<T>) => {
  // Keeps the table height consistent
  const emptyRows = createEmptyRows(rowsPerPage - visibleRows.length);

  return (
    <TableContainer component={StyledBackgroundPaper}>
      <Table sx={{ tableLayout: 'auto' }}>
        <StrategiesTableHeader columns={columns} variant={variant} />
        <TableBody>
          {isLoading ? (
            <AllStrategiesTableBodySkeleton columns={columns} rowsPerPage={rowsPerPage} />
          ) : (
            <>
              {visibleRows.map((row, index) => (
                <Row key={index} columns={columns} rowData={row} onRowClick={onGoToStrategy} variant={variant} />
              ))}
              {emptyRows}
              {showTotal && <TotalRow columns={columns} variant={variant} strategies={strategies} />}
            </>
          )}
        </TableBody>
      </Table>
      <TablePagination
        count={strategies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
      />
    </TableContainer>
  );
};

export default StrategiesTable;
