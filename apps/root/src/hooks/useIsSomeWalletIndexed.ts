import React from 'react';
import useStoredTransactionHistory from './useStoredTransactionHistory';
import { Address } from 'viem';
import { ChainId, IndexerUnits } from 'common-types';

const INDEXER_ACCEPTANCE = 0.95; // 95%

const EMPTY_INDEXER_UNITS = {
  [IndexerUnits.DCA]: {},
  [IndexerUnits.AGG_SWAPS]: {},
  [IndexerUnits.EARN]: {},
};

type IncludedIndexerUnits = Exclude<
  IndexerUnits,
  | IndexerUnits.CHAINLINK_REGISTRY
  | IndexerUnits.NATIVE_TRANSFERS
  | IndexerUnits.ERC20_APPROVALS
  | IndexerUnits.ERC20_TRANSFERS
>;

export type UnitsIndexedByChainPercentage = Record<
  Address,
  Record<IncludedIndexerUnits, Record<ChainId, { percentage: number; isIndexed: boolean }>>
>; // <IndexerUnits, Record<ChainId, boolean>>

export const IncludedIndexerUnitsArrayTypes: IncludedIndexerUnits[] = [
  IndexerUnits.DCA,
  IndexerUnits.AGG_SWAPS,
  IndexerUnits.EARN,
] as const;

export default function useIsSomeWalletIndexed(wallet?: Address) {
  const { history } = useStoredTransactionHistory();

  const unitsByChainPercentages: UnitsIndexedByChainPercentage = React.useMemo(() => {
    const reduced = Object.entries(history?.indexing || {}).reduce<UnitsIndexedByChainPercentage>(
      (acc, [address, unitsData]) => {
        if (!wallet || wallet === address) {
          Object.entries(unitsData).forEach(([unitName, chainsData]) => {
            if (!((unitName as IndexerUnits) in IncludedIndexerUnitsArrayTypes)) {
              return acc;
            }
            Object.entries(chainsData).forEach(([chainId, chainData]) => {
              if (!acc[address as Address]) {
                // eslint-disable-next-line no-param-reassign
                acc[address as Address] = { ...EMPTY_INDEXER_UNITS };
              }

              if (chainData.processedUpTo) {
                const percentage = Number(chainData.processedUpTo) / Number(chainData.target);
                const isIndexed = percentage >= INDEXER_ACCEPTANCE;
                // eslint-disable-next-line no-param-reassign
                acc[address as Address][unitName as IncludedIndexerUnits][Number(chainId)] = {
                  percentage,
                  isIndexed,
                };
              }
            });
          });
        }

        return acc;
      },
      {}
    );

    return reduced;
  }, [history, wallet]);

  const isSomeUnitNotIndexed = React.useMemo(() => {
    return Object.entries(unitsByChainPercentages).some(([address, unitsData]) => {
      if (!wallet || wallet === address) {
        return Object.values(unitsData).some((chainsData) => {
          return Object.values(chainsData).some((chainData) => {
            return !chainData.isIndexed;
          });
        });
      } else {
        return false;
      }
    });
  }, [unitsByChainPercentages, wallet]);

  return {
    isSomeWalletIndexed: !isSomeUnitNotIndexed,
    hasLoadedEvents: history !== undefined,
    unitsByChainPercentages,
  };
}
