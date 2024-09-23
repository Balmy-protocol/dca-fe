import React from 'react';
import { Grid, TablePagination } from 'ui-library';
import { TableStrategy } from '../strategies-table';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { SetStateCallback } from 'common-types';
import StrategyCardItem from '../strategy-card-item';
import { getStrategyFromTableObject } from '@common/utils/earn/parsing';

interface StrategiesListProps<T extends StrategiesTableVariants> {
  visibleStrategies: TableStrategy<T>[];
  totalCount: number;
  rowsPerPage: number;
  page: number;
  setPage: SetStateCallback<number>;
  variant: StrategiesTableVariants;
  isLoading: boolean;
}

const skeletonRows = Array.from(Array(4).keys());

const StrategiesList = <T extends StrategiesTableVariants>({
  visibleStrategies,
  totalCount,
  page,
  rowsPerPage,
  setPage,
  variant,
  isLoading,
}: StrategiesListProps<T>) => (
  <Grid container spacing={6}>
    {isLoading
      ? skeletonRows.map((index) => (
          <Grid item xs={12} md={6} key={index}>
            <StrategyCardItem.Skeleton />
          </Grid>
        ))
      : visibleStrategies.map((tableStrategy, index) => (
          <Grid item xs={12} md={6} key={index}>
            <StrategyCardItem strategy={getStrategyFromTableObject(tableStrategy, variant)} />
          </Grid>
        ))}
    <Grid item xs={12}>
      <TablePagination
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
      />
    </Grid>
  </Grid>
);

export default StrategiesList;
