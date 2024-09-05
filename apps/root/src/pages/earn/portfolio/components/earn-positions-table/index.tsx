import React from 'react';
import StrategiesTable from '@pages/earn/components/strategies-table';
import { portfolioColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { EarnPosition, StrategyId } from 'common-types';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';

const variant = StrategiesTableVariants.USER_STRATEGIES;

const EarnPositionsTable = () => {
  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();

  const groupedPositionsByStrategy = React.useMemo(() => {
    const strategiesRecord = userStrategies.reduce<Record<StrategyId, EarnPosition[]>>((acc, userStrat) => {
      const key = userStrat.strategy.id;
      if (acc[key]) {
        acc[key].push(userStrat);
      } else {
        // eslint-disable-next-line no-param-reassign
        acc[key] = [userStrat];
      }
      return acc;
    }, {});

    return Object.values(strategiesRecord);
  }, [userStrategies]);

  const filteredStrategies = useFilteredStrategies({
    variant,
    strategies: groupedPositionsByStrategy,
    columns: portfolioColumnConfigs,
  });

  return (
    <StrategiesTable
      columns={portfolioColumnConfigs}
      variant={variant}
      strategies={filteredStrategies}
      isLoading={!hasFetchedUserStrategies}
      showTotal
    />
  );
};

export default EarnPositionsTable;
