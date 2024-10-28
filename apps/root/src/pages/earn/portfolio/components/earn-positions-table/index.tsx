import React from 'react';
import StrategiesDisplayWrapper from '@pages/earn/components/strategies-display-wrapper';
import { portfolioColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { EarnPosition, StrategyId } from 'common-types';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';

const variant = StrategiesTableVariants.USER_STRATEGIES;

const EarnPositionsTable = ({ userStrategies, isLoading }: { userStrategies: EarnPosition[]; isLoading: boolean }) => {
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
    <StrategiesDisplayWrapper
      columns={portfolioColumnConfigs}
      variant={variant}
      strategies={filteredStrategies}
      isLoading={isLoading}
    />
  );
};

export default EarnPositionsTable;
