import React from 'react';
import {
  AmountsOfToken,
  EarnPosition,
  SetStateCallback,
  Strategy,
  StrategyConditionType,
  StrategyId,
} from 'common-types';
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
  Hidden,
  SortIcon,
  colors,
  ActiveTiersIcons,
} from 'ui-library';
import styled from 'styled-components';
import { useAppDispatch } from '@state/hooks';
import { StrategyColumnConfig, StrategyColumnKeys } from './components/columns';
import { setOrderBy } from '@state/strategies-filters/actions';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';
import {
  getNeedsTierFromTableObject,
  getStrategyFromTableObject,
  RowClickParamValue,
} from '@common/utils/earn/parsing';
import EmptyPortfolio from './components/empty-portfolio';
import TotalFooter from './components/total-footer';
import { FarmWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import { PROMOTED_STRATEGIES_IDS } from '@constants/earn';
import PromotedFlag from './components/promoted-flag';
import { isNil } from 'lodash';
import useTierLevel from '@hooks/tiers/useTierLevel';

export type StrategyWithWalletBalanceAndTierLevel = Strategy & {
  walletBalance?: AmountsOfToken;
  tierLevel?: number;
};

export type TableStrategy<T extends StrategiesTableVariants> = T extends StrategiesTableVariants.ALL_STRATEGIES
  ? StrategyWithWalletBalanceAndTierLevel
  : T extends StrategiesTableVariants.USER_STRATEGIES
    ? EarnPosition[]
    : T extends StrategiesTableVariants.MIGRATION_OPTIONS
      ? FarmWithAvailableDepositTokens
      : never;

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })<{
  $isPortfolio?: number;
  $isMigration?: boolean;
}>`
  ${({ theme: { spacing }, $isPortfolio, $isMigration }) => `
    padding: ${$isMigration ? '0px' : `0px ${spacing(4)} ${spacing($isPortfolio ? 0 : 4)}`};
  `}
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const StyledTableRow = styled(TableRow)<{ $condition?: StrategyConditionType }>`
  ${({ theme: { spacing }, $condition }) =>
    !isNil($condition) &&
    `
    border-radius: ${spacing(2)};
  `}
`;

interface StyledTierBadgeProps {
  CurrentTierBadge: React.ElementType;
  isPromoted?: boolean;
}
const StyledTierBadge = styled(({ CurrentTierBadge, ...props }: StyledTierBadgeProps) => (
  <CurrentTierBadge {...props} size="1.5rem" />
))`
  position: absolute;
  z-index: 1;
  top: ${({ isPromoted }) => (isPromoted ? '65%' : '50%')};
  left: 0;
  transform: translate(-50%, -50%);
`;

const StyledTableEnd = styled(TableCell)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(1)} 0px !important;
  `}
  height: 1px;
  background-color: inherit;
`;

const StyledNavContainer = styled(ContainerBox)`
  height: 100%;
  width: 50px;
  margin: 0 auto;
`;

const StyledBodyTableCell = styled(TableCell)<{ $hasCondition?: boolean; $hovered?: boolean }>`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
    $hasCondition,
    $hovered,
  }) => `
  height: ${spacing(14.5)};
  padding-top: ${spacing(0.5)};
  padding-bottom: ${spacing(0.5)};
  ${$hasCondition && `position: relative;`}
  background: linear-gradient(${$hovered ? colors[mode].background.tertiary : colors[mode].background.secondary}, ${$hovered ? colors[mode].background.tertiary : colors[mode].background.secondary}) padding-box,
              linear-gradient(to right, ${colors[mode].promoted.start}, ${colors[mode].promoted.stop}) border-box;
  border: 1px solid transparent;
  border-right: 0px;
`}
`;

const StyledHeaderTableRow = styled(TableRow)<{ $isPortfolio?: boolean }>`
  ${({ theme: { palette }, $isPortfolio }) => `
    background-color: ${$isPortfolio ? colors[palette.mode].background.quarteryNoAlpha : 'transparent'} !important;
    &:hover {
      background-color: ${$isPortfolio ? colors[palette.mode].background.quarteryNoAlpha : 'transparent'} !important;
  `}
`;

const StyledHeaderTableCell = styled(TableCell)`
  background-color: inherit;
`;

const StrategiesTableHeader = <T extends StrategiesTableVariants>({
  columns,
  variant,
  disabled,
  showEndChevron = true,
}: {
  columns: StrategyColumnConfig<T>[];
  variant: T;
  disabled?: boolean;
  showEndChevron?: boolean;
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
      <StyledHeaderTableRow $isPortfolio={variant === StrategiesTableVariants.USER_STRATEGIES}>
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
        {showEndChevron && <StyledTableEnd size="small"></StyledTableEnd>}
      </StyledHeaderTableRow>
    </TableHead>
  );
};

const AllStrategiesTableBodySkeleton = <T extends StrategiesTableVariants>({
  columns,
  rowsPerPage,
  showEndChevron = true,
}: {
  columns: StrategyColumnConfig<T>[];
  rowsPerPage: number;
  showEndChevron?: boolean;
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
        {showEndChevron && <StyledTableEnd size="small"></StyledTableEnd>}
      </TableRow>
    ))}
  </>
);

interface RowProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  rowData: TableStrategy<T>;
  onRowClick: (strategy: RowClickParamValue<T>) => void;
  variant: T;
  showBalances?: boolean;
  showEndChevron?: boolean;
}

const renderBodyCell = (cell: React.ReactNode | string) =>
  typeof cell === 'string' ? <StyledBodySmallRegularTypo2>{cell}</StyledBodySmallRegularTypo2> : cell;

const Row = <T extends StrategiesTableVariants>({
  columns,
  rowData,
  onRowClick,
  variant,
  showBalances = true,
  showEndChevron = true,
}: RowProps<T>) => {
  const [hovered, setHovered] = React.useState(false);
  const { tierLevel } = useTierLevel();

  const strategy = getStrategyFromTableObject(rowData, variant);
  const needsTier = getNeedsTierFromTableObject(rowData, variant);
  const isPromoted = PROMOTED_STRATEGIES_IDS.includes(strategy.id as StrategyId);
  const isLocked = !isNil(needsTier);

  const condition = isLocked ? StrategyConditionType.LOCKED : isPromoted ? StrategyConditionType.PROMOTED : undefined;
  // If TierIcon is rendered, needsTier is defined
  const TierIcon = ActiveTiersIcons[needsTier || 0];

  const isSameTierLevel = !isNil(needsTier) && !isNil(tierLevel) && needsTier === tierLevel;
  return (
    <StyledTableRow
      $condition={condition}
      key={strategy.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ cursor: 'pointer' }}
      hover
      onClick={() => onRowClick(strategy)}
    >
      {columns.map((column, i) => (
        <Hidden {...column.hiddenProps} key={`${strategy.id}-${column.key}`}>
          <StyledBodyTableCell
            key={`${strategy.id}-${column.key}`}
            $hasCondition={!!condition && i === 0}
            $hovered={hovered}
          >
            {isLocked && !isSameTierLevel && i === 0 && <PromotedFlag tier={needsTier} />}
            {isLocked && !isSameTierLevel && i === 0 && <StyledTierBadge isPromoted CurrentTierBadge={TierIcon} />}
            {renderBodyCell(column.renderCell(rowData, showBalances))}
          </StyledBodyTableCell>
        </Hidden>
      ))}
      {showEndChevron && (
        <StyledTableEnd size="small">
          <StyledNavContainer alignItems="center">
            <DividerBorder2 orientation="vertical" />
            <AnimatedChevronRightIcon
              $hovered={hovered}
              sx={({ palette }) => ({ color: colors[palette.mode].accentPrimary })}
            />
          </StyledNavContainer>
        </StyledTableEnd>
      )}
    </StyledTableRow>
  );
};

const createEmptyRows = (rowCount: number) => {
  return Array.from({ length: rowCount }, (_, i) => (
    <TableRow key={i} sx={{ visibility: 'hidden' }}>
      <StyledBodyTableCell colSpan={7}>&nbsp;</StyledBodyTableCell>
    </TableRow>
  ));
};

interface StrategiesTableProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  visibleRows: TableStrategy<T>[];
  variant: T;
  isLoading: boolean;
  showTotal?: boolean;
  page: number;
  setPage: SetStateCallback<number>;
  onGoToStrategy: (strategy: RowClickParamValue<T>) => void;
  strategies: TableStrategy<T>[];
  rowsPerPage: number;
  showBalances?: boolean;
  showPagination?: boolean;
  showEndChevron?: boolean;
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
  showBalances = true,
  showPagination = true,
  showEndChevron = true,
}: StrategiesTableProps<T>) => {
  // Keeps the table height consistent
  const emptyRows = createEmptyRows(rowsPerPage - visibleRows.length);

  const isPortfolio = variant === StrategiesTableVariants.USER_STRATEGIES;
  const isMigration = variant === StrategiesTableVariants.MIGRATION_OPTIONS;

  const isEmptyPortfolio = React.useMemo(
    () => strategies.length === 0 && isPortfolio && !isLoading,
    [strategies.length, isPortfolio, isLoading]
  );

  return (
    <TableContainer
      component={(props) => <StyledBackgroundPaper {...props} $isPortfolio={isPortfolio} $isMigration={isMigration} />}
    >
      {isEmptyPortfolio && <EmptyPortfolio contained />}
      <Table sx={{ tableLayout: 'auto' }} stickyHeader={isPortfolio}>
        <StrategiesTableHeader
          columns={columns}
          variant={variant}
          disabled={isEmptyPortfolio}
          showEndChevron={showEndChevron}
        />
        <TableBody>
          {isLoading ? (
            <AllStrategiesTableBodySkeleton
              columns={columns}
              rowsPerPage={rowsPerPage}
              showEndChevron={showEndChevron}
            />
          ) : (
            <>
              {visibleRows.map((row, index) => (
                <Row
                  key={index}
                  columns={columns}
                  rowData={row}
                  onRowClick={onGoToStrategy}
                  variant={variant}
                  showBalances={showBalances}
                  showEndChevron={showEndChevron}
                />
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
      {!isPortfolio && showPagination && (
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
