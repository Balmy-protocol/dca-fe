import React from 'react';
import StrategiesDisplayWrapper from '@pages/earn/components/strategies-display-wrapper';
import { strategyColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import useHasFetchedAllStrategies from '@hooks/earn/useHasFetchedAllStrategies';
import useAllStrategiesForTable from '@hooks/earn/useAllStrategiesForTable';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';
import { FarmsWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';

const variant = StrategiesTableVariants.ALL_STRATEGIES;

const AllStrategiesTable = ({
  farmsWithDepositableTokens,
  handleMigrationModalOpen,
}: {
  farmsWithDepositableTokens: FarmsWithAvailableDepositTokens;
  handleMigrationModalOpen: () => void;
}) => {
  const hasFetchedAllStrategies = useHasFetchedAllStrategies();
  const strategies = useAllStrategiesForTable();

  const filteredStrategies = useFilteredStrategies({
    variant,
    strategies,
    columns: strategyColumnConfigs,
    filterTierLevel: true,
  });

  return (
    <StrategiesDisplayWrapper
      columns={strategyColumnConfigs}
      variant={variant}
      strategies={filteredStrategies}
      isLoading={!hasFetchedAllStrategies}
      withPagination
      farmsWithDepositableTokens={farmsWithDepositableTokens}
      handleMigrationModalOpen={handleMigrationModalOpen}
    />
  );
};

export default AllStrategiesTable;
