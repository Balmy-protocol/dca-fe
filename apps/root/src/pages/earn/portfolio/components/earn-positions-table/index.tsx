import React from 'react';
import StrategiesDisplayWrapper from '@pages/earn/components/strategies-display-wrapper';
import { portfolioColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { EarnPosition } from 'common-types';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';
import { useShowBalances } from '@state/config/hooks';
import { groupPositionsByStrategy } from '@common/utils/earn/parsing';

const variant = StrategiesTableVariants.USER_STRATEGIES;

const EarnPositionsTable = ({ userStrategies, isLoading }: { userStrategies: EarnPosition[]; isLoading: boolean }) => {
  const groupedPositionsByStrategy = React.useMemo(() => groupPositionsByStrategy(userStrategies), [userStrategies]);

  const filteredStrategies = useFilteredStrategies({
    variant,
    strategies: groupedPositionsByStrategy,
    columns: portfolioColumnConfigs,
  });

  const showBalances = useShowBalances();

  return (
    <StrategiesDisplayWrapper
      columns={portfolioColumnConfigs}
      variant={variant}
      strategies={filteredStrategies}
      isLoading={isLoading}
      showBalances={showBalances}
    />
  );
};

export default EarnPositionsTable;
