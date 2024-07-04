import React from 'react';
import useAllStrategies from '@hooks/earn/useAllStrategies';

interface UseStrategyDetailsProps {
  chainId?: number;
  strategyGuardianId?: string;
}

export default function useStrategyDetails({ chainId, strategyGuardianId }: UseStrategyDetailsProps) {
  const { strategies } = useAllStrategies();

  return React.useMemo(
    () => strategies.find((strategy) => strategy.id === strategyGuardianId && strategy.network.chainId === chainId),
    [strategies, chainId, strategyGuardianId]
  );
}
