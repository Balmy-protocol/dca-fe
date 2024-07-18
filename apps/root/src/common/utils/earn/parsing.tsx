import React from 'react';
import {
  NetworkStruct,
  Strategy,
  StrategyYieldType,
  TokenList,
  SdkStrategyToken,
  StrategyRiskLevel,
  Token,
  TokenListId,
  SavedSdkStrategy,
  SavedSdkEarnPosition,
  EarnPosition,
  EarnPositionActionType,
} from 'common-types';
import { compact, find } from 'lodash';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';
import { toToken } from '../currency';
import { SafetyIcon } from 'ui-library';
import { strategyColumnConfigs, StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';
import { TableStrategy } from '@pages/earn/components/strategies-table';
import { ColumnOrder } from '@state/strategies-filters/reducer';

export const sdkStrategyTokenToToken = (
  sdkToken: SdkStrategyToken,
  tokenKey: TokenListId,
  tokenList: TokenList
): Token => tokenList[tokenKey] || toToken(sdkToken);

export const yieldTypeFormatter = (yieldType: StrategyYieldType) => {
  switch (yieldType) {
    case StrategyYieldType.LENDING:
      return defineMessage({
        defaultMessage: 'Lending',
        description: 'strategyYieldTypeLending',
      });
    case StrategyYieldType.STAKING:
      return defineMessage({
        defaultMessage: 'Staking',
        description: 'strategyYieldTypeStaking',
      });
    default:
      return defineMessage({
        defaultMessage: 'Unknown',
        description: 'strategyYieldTypeUnknown',
      });
  }
};

export const getStrategySafetyIcon = (riskLevel: StrategyRiskLevel) => {
  switch (riskLevel) {
    case StrategyRiskLevel.LOW:
      return <SafetyIcon safety="high" />;
    case StrategyRiskLevel.MEDIUM:
      return <SafetyIcon safety="medium" />;
    case StrategyRiskLevel.HIGH:
      return <SafetyIcon safety="low" />;
    default:
      return <></>;
  }
};

export const parseAllStrategies = ({
  strategies,
  tokenList,
  intl,
}: {
  strategies: SavedSdkStrategy[];
  tokenList: TokenList;
  intl: ReturnType<typeof useIntl>;
}): Strategy[] =>
  strategies.map((strategy) => {
    const { farm, id, guardian, riskLevel, lastUpdatedAt, ...rest } = strategy;
    const network = find(NETWORKS, { chainId: farm.chainId }) as NetworkStruct;

    return {
      id: id,
      asset: sdkStrategyTokenToToken(farm.asset, `${farm.chainId}-${farm.asset.address}` as TokenListId, tokenList),
      rewards: {
        tokens: Object.values(farm.rewards?.tokens || []).map((reward) =>
          sdkStrategyTokenToToken(reward, `${farm.chainId}-${reward.address}` as TokenListId, tokenList)
        ),
        apy: farm.apy,
      },
      network,
      guardian: guardian,
      farm: farm,
      formattedYieldType: intl.formatMessage(yieldTypeFormatter(farm.type)),
      riskLevel: riskLevel,
      lastUpdatedAt: lastUpdatedAt,
      ...rest,
    };
  });

export const parseUserStrategies = ({
  userStrategies,
  strategies,
  tokenList,
}: {
  userStrategies: SavedSdkEarnPosition[];
  strategies: Strategy[];
  tokenList: TokenList;
}): EarnPosition[] => {
  return compact(
    userStrategies.map<EarnPosition | null>((userStrategy) => {
      const strategy = strategies.find((s) => s.id === userStrategy.strategy);

      if (!strategy) {
        console.error('Strategy not found', userStrategy, strategies);
        return null;
      }

      let mappedHistory;

      if ('history' in userStrategy) {
        mappedHistory = userStrategy.history.map((action) => ({
          ...action,
          ...(action.action === EarnPositionActionType.WITHDREW
            ? {
                withdrawn: action.withdrawn.map((withdrawn) => ({
                  ...withdrawn,
                  token: sdkStrategyTokenToToken(
                    withdrawn.token,
                    `${strategy.farm.chainId}-${withdrawn.token.address}` as TokenListId,
                    tokenList
                  ),
                })),
              }
            : {}),
        }));
      }

      return {
        ...userStrategy,
        strategy,
        balances: userStrategy.balances.map((balance) => ({
          ...balance,
          token: sdkStrategyTokenToToken(
            balance.token,
            `${strategy.farm.chainId}-${balance.token.address}` as TokenListId,
            tokenList
          ),
        })),
        history: mappedHistory,
        historicalBalances: userStrategy.historicalBalances.map((historicalBalance) => ({
          ...historicalBalance,
          balances: historicalBalance.balances.map((balance) => ({
            ...balance,
            token: sdkStrategyTokenToToken(
              balance.token,
              `${strategy.farm.chainId}-${balance.token.address}` as TokenListId,
              tokenList
            ),
          })),
        })),
      };
    })
  );
};

export function getComparator<Key extends StrategyColumnKeys>(
  order: ColumnOrder,
  orderBy: Key
): (a: TableStrategy, b: TableStrategy) => number {
  return (a, b) => {
    const column = strategyColumnConfigs.find((config) => config.key === orderBy);
    if (column && column.getOrderValue) {
      const aValue = column.getOrderValue(a);
      const bValue = column.getOrderValue(b);
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (order === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    }
    return 0;
  };
}
