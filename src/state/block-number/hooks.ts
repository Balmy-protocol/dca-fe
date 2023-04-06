import React from 'react';
import { useStore } from 'react-redux';
import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useBlockNumber(chainId: number): number | undefined {
  return useAppSelector(
    (state: RootState) => (state.blockNumber[chainId] && state.blockNumber[chainId].blockNumber) || -1
  );
}

export function useGetBlockNumber(): (chainId: number) => number | undefined {
  const store = useStore<RootState>();
  return React.useCallback(
    (chainId: number) => {
      const state = store.getState();
      return (state.blockNumber[chainId] && state.blockNumber[chainId].blockNumber) || -1;
    },
    [store]
  );
}
