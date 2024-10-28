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
  colors,
  TableFooter,
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
import EmptyPortfolio from './components/empty-portfolio';

export type StrategyWithWalletBalance = Strategy & {
  walletBalance?: AmountsOfToken;
};

export type TableStrategy<T extends StrategiesTableVariants> = T extends StrategiesTableVariants.ALL_STRATEGIES
  ? StrategyWithWalletBalance
  : T extends StrategiesTableVariants.USER_STRATEGIES
    ? EarnPosition[]
    : never;

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })<{ $isPortfolio?: number }>`
  ${({ theme: { palette, spacing }, $isPortfolio }) => `
    padding: 0px ${spacing(4)} ${spacing($isPortfolio ? 0 : 4)};
    background: ${colors[palette.mode].background.quarteryNoAlpha};
    max-height: ${spacing(147.25)};
  `}
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const StyledTableEnd = styled(TableCell)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(1)} 0px !important;
  `}
  height: 1px;
  background-color: inherit;
`;

const StyledTotalsTableCell = styled(TableCell)`
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
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

const StyledHeaderTableRow = styled(TableRow)<{ $isPortfolio?: boolean }>`
  ${({ theme: { palette }, $isPortfolio }) => `
    background: ${$isPortfolio ? colors[palette.mode].background.quarteryNoAlpha : 'transparent'};
    &:hover {
      background: ${$isPortfolio ? colors[palette.mode].background.quarteryNoAlpha : 'transparent'};
  `}
`;

const StyledHeaderTableCell = styled(TableCell)`
  background-color: inherit;
`;

const StrategiesTableHeader = <T extends StrategiesTableVariants>({
  columns,
  variant,
  disabled,
}: {
  columns: StrategyColumnConfig<T>[];
  variant: T;
  disabled?: boolean;
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
            <StyledHeaderTableCell
              key={column.key}
              sortDirection={orderBy.column === column.key ? orderBy.order : false}
            >
              {column.getOrderValue ? (
                <TableSortLabel
                  active={orderBy.column === column.key}
                  direction={orderBy.column === column.key ? orderBy.order : 'asc'}
                  onClick={() => onRequestSort(column.key)}
                  IconComponent={() => (
                    <SortIcon direction={orderBy.column === column.key ? orderBy.order : undefined} />
                  )}
                  disabled={disabled}
                >
                  <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
                </TableSortLabel>
              ) : (
                <StyledBodySmallLabelTypography>{column.label}</StyledBodySmallLabelTypography>
              )}
            </StyledHeaderTableCell>
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

interface TotalFooterProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  strategies: TableStrategy<T>[];
  variant: T;
  isEmptyPortfolio: boolean;
}

const StyledTableFooter = styled(TableFooter)<{ $isPortfolio?: boolean }>`
  position: relative;
  margin-top: ${({ theme }) => theme.spacing(4)};
  left: 0;
  bottom: 0;
  z-index: 2;
  position: sticky;
`;

const StyledTotalRow = styled(TableRow)`
  background: ${({ theme: { palette } }) => colors[palette.mode].background.quarteryNoAlpha} !important;
  &:hover {
    background: ${({ theme: { palette } }) => colors[palette.mode].background.quarteryNoAlpha} !important;
  }
`;

const StyledDividerContainer = styled(ContainerBox)`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
`;

const TotalFooter = <T extends StrategiesTableVariants>({
  columns,
  strategies,
  variant,
  isEmptyPortfolio,
}: TotalFooterProps<T>) => {
  const totalInvested = React.useMemo(() => {
    if (variant === StrategiesTableVariants.ALL_STRATEGIES) {
      return { totalInvestedUsd: 0, currentProfitUsd: 0, currentProfitRate: 0, earnings: {} };
    }
    const userStrategies = strategies as EarnPosition[][];

    return parseUserStrategiesFinancialData(flatten(userStrategies));
  }, [strategies]);

  return (
    <StyledTableFooter>
      <StyledTotalRow>
        <StyledTotalsTableCell>
          <Typography variant="bodyBold">
            <FormattedMessage id="strategies-table.total" defaultMessage="Total" />
          </Typography>
        </StyledTotalsTableCell>
        {columns.slice(1).map((column) => (
          <Hidden {...column.hiddenProps} key={column.key}>
            <StyledTotalsTableCell key={column.key}>
              {column.key === StrategyColumnKeys.TOTAL_INVESTED ? (
                <Typography variant="bodyBold" color={isEmptyPortfolio ? 'text.disabled' : undefined}>
                  {`$${usdFormatter(totalInvested.totalInvestedUsd)}`}
                </Typography>
              ) : null}
              {column.key === StrategyColumnKeys.CURRENT_PROFIT ? (
                <Typography variant="bodyBold" color={isEmptyPortfolio ? 'text.disabled' : 'success.dark'}>
                  +{usdFormatter(totalInvested.currentProfitUsd)}
                </Typography>
              ) : null}
            </StyledTotalsTableCell>
          </Hidden>
        ))}
        <StyledDividerContainer flexDirection="column" fullWidth>
          <DividerBorder1 />
        </StyledDividerContainer>
      </StyledTotalRow>
    </StyledTableFooter>
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
  page,
  setPage,
  onGoToStrategy,
  strategies,
  rowsPerPage,
}: StrategiesTableProps<T>) => {
  // Keeps the table height consistent
  const emptyRows = createEmptyRows(rowsPerPage - visibleRows.length);

  const isPortfolio = variant === StrategiesTableVariants.USER_STRATEGIES;

  const isEmptyPortfolio = React.useMemo(
    () => strategies.length === 0 && isPortfolio && !isLoading,
    [strategies.length, isPortfolio, isLoading]
  );

  return (
    <TableContainer component={(props) => <StyledBackgroundPaper {...props} $isPortfolio={isPortfolio} />}>
      {isEmptyPortfolio && <EmptyPortfolio contained />}
      <Table sx={{ tableLayout: 'auto' }} stickyHeader={isPortfolio}>
        <StrategiesTableHeader columns={columns} variant={variant} disabled={isEmptyPortfolio} />
        <TableBody>
          {isLoading ? (
            <AllStrategiesTableBodySkeleton columns={columns} rowsPerPage={rowsPerPage} />
          ) : (
            <>
              {visibleRows.map((row, index) => (
                <Row key={index} columns={columns} rowData={row} onRowClick={onGoToStrategy} variant={variant} />
              ))}
              {emptyRows}
            </>
          )}
        </TableBody>
        {isPortfolio && (
          <TotalFooter
            columns={columns}
            variant={variant}
            strategies={strategies}
            isEmptyPortfolio={isEmptyPortfolio}
          />
        )}
      </Table>
      {!isPortfolio && (
        <TablePagination
          count={strategies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
        />
      )}
    </TableContainer>
  );
};

export default StrategiesTable;
