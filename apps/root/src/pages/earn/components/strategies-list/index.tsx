import React from 'react';
import { Grid, TablePagination } from 'ui-library';
import { TableStrategy } from '../strategies-table';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { SetStateCallback, Strategy } from 'common-types';
import StrategyCardItem from '../strategy-card-item';
import { getStrategyFromTableObject } from '@common/utils/earn/parsing';
import EmptyPortfolio from '../strategies-table/components/empty-portfolio';

interface StrategiesListProps<
  T extends StrategiesTableVariants.ALL_STRATEGIES | StrategiesTableVariants.USER_STRATEGIES,
> {
  visibleStrategies: TableStrategy<T>[];
  totalCount: number;
  rowsPerPage: number;
  page: number;
  setPage: SetStateCallback<number>;
  variant: StrategiesTableVariants;
  isLoading: boolean;
}

const skeletonRows = Array.from(Array(4).keys());

const StrategiesList = <T extends StrategiesTableVariants.ALL_STRATEGIES | StrategiesTableVariants.USER_STRATEGIES>({
  visibleStrategies,
  totalCount,
  page,
  rowsPerPage,
  setPage,
  variant,
  isLoading,
}: StrategiesListProps<T>) => {
  const isPortfolio = variant === StrategiesTableVariants.USER_STRATEGIES;

  const showEmptyPortfolioMessage = React.useMemo(
    () => visibleStrategies.length === 0 && isPortfolio && !isLoading,
    [visibleStrategies.length, isPortfolio, isLoading]
  );

  if (showEmptyPortfolioMessage) {
    return <EmptyPortfolio />;
  }

  return (
    <Grid container spacing={6}>
      {isLoading
        ? skeletonRows.map((index) => (
            <Grid item xs={12} md={6} key={index}>
              <StrategyCardItem.Skeleton />
            </Grid>
          ))
        : visibleStrategies.map((tableStrategy, index) => (
            <Grid item xs={12} md={6} key={index}>
              <StrategyCardItem strategy={getStrategyFromTableObject<T>(tableStrategy, variant as T) as Strategy} />
            </Grid>
          ))}
      {!isPortfolio && (
        <Grid item xs={12}>
          <TablePagination
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default StrategiesList;
