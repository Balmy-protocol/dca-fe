import React from 'react';
import StrategiesTable from '@pages/earn/components/strategies-table';
import { strategyColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';
import useAllStrategies from '@hooks/earn/useAllStrategies';

const variant = StrategiesTableVariants.ALL_STRATEGIES;

const AllStrategiesTable = () => {
  const { strategies, hasFetchedAllStrategies } = useAllStrategies();
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
