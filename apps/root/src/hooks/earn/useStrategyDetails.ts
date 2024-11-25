import React from 'react';
import useAllStrategies from '@hooks/earn/useAllStrategies';
import useEarnPositions from './useEarnPositions';
import { DisplayStrategy } from 'common-types';

interface UseStrategyDetailsProps {
  chainId?: number;
  strategyGuardianId?: string;
}

export default function useStrategyDetails({
  chainId,
  strategyGuardianId,
}: UseStrategyDetailsProps): DisplayStrategy | undefined {
  const strategies = useAllStrategies();

  const { userStrategies } = useEarnPositions();

  const strategy = React.useMemo(
    () => strategies.find((strat) => strat.id === strategyGuardianId && strat.network.chainId === chainId),
    [strategies, chainId, strategyGuardianId]
  );

  const includedEarnPositions = React.useMemo(
    () => userStrategies.filter((userStrategy) => strategy?.userPositions?.includes(userStrategy.id)),
    [userStrategies, strategy]
  );

  return React.useMemo(
    () => strategy && { ...strategy, userPositions: includedEarnPositions },
    [strategy, includedEarnPositions]
  );
}
