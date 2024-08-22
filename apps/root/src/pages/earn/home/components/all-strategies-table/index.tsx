import React from 'react';
import StrategiesTable from '@pages/earn/components/strategies-table';
import { strategyColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import useHasFetchedAllStrategies from '@hooks/earn/useHasFetchedAllStrategies';
import useAllStrategiesForTable from '@hooks/earn/useAllStrategiesForTable';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';

const variant = StrategiesTableVariants.ALL_STRATEGIES;

const AllStrategiesTable = () => {
  const hasFetchedAllStrategies = useHasFetchedAllStrategies();
  const strategies = useAllStrategiesForTable();

  const filteredStrategies = useFilteredStrategies({ variant, strategies, columns: strategyColumnConfigs });

  return (
    <StrategiesTable
      columns={strategyColumnConfigs}
      variant={variant}
      strategies={filteredStrategies}
      isLoading={!hasFetchedAllStrategies}
    />
  );
};

export default AllStrategiesTable;
