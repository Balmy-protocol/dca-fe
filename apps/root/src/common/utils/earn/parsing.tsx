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
import { isSameToken, parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '../currency';
import { SafetyIcon } from 'ui-library';
import { StrategyColumnConfig, StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';
import { TableStrategy } from '@pages/earn/components/strategies-table';
import { ColumnOrder, StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { Address, formatUnits } from 'viem';

export const sdkStrategyTokenToToken = (
  sdkToken: SdkStrategyToken,
  tokenKey: TokenListId,
  tokenList: TokenList,
  chainId?: number
): Token => {
  const token = tokenList[tokenKey] || toToken({ ...sdkToken, chainId });
  return { ...token, price: sdkToken.price };
};

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
      asset: sdkStrategyTokenToToken(
        farm.asset,
        `${farm.chainId}-${farm.asset.address}` as TokenListId,
        tokenList,
        farm.chainId
      ),
      rewards: {
        tokens: Object.values(farm.rewards?.tokens || []).map((reward) =>
          sdkStrategyTokenToToken(reward, `${farm.chainId}-${reward.address}` as TokenListId, tokenList, farm.chainId)
        ),
        apy: farm.apy,
      },
      network,
      guardian: guardian,
      farm: {
        ...farm,
        asset: sdkStrategyTokenToToken(
          farm.asset,
          `${farm.chainId}-${farm.asset.address}` as TokenListId,
          tokenList,
          farm.chainId
        ),
      },
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
                    tokenList,
                    strategy.farm.chainId
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
            tokenList,
            strategy.farm.chainId
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
              tokenList,
              strategy.farm.chainId
            ),
          })),
        })),
      };
    })
  );
};

export function getComparator<Key extends StrategyColumnKeys, Variant extends StrategiesTableVariants>({
  columns,
  primaryOrder,
  secondaryOrder,
}: {
  columns: StrategyColumnConfig<Variant>[];
  primaryOrder: { order: ColumnOrder; column: Key };
  secondaryOrder?: { order: ColumnOrder; column: Key };
}): (a: TableStrategy<Variant>, b: TableStrategy<Variant>) => number {
  return (a, b) => {
    const column = columns.find((config) => config.key === primaryOrder.column);
    if (column && column.getOrderValue) {
      const aValue = column.getOrderValue(a);
      const bValue = column.getOrderValue(b);
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return primaryOrder.order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return primaryOrder.order === 'asc' ? aValue - bValue : bValue - aValue;
      }
    }

    if (!secondaryOrder) {
      return 0;
    }

    // Secondary sorting criteria
    const secondaryColumn = columns.find((config) => config.key === secondaryOrder.column);
    if (secondaryColumn && secondaryColumn.getOrderValue) {
      const aSecondaryValue = secondaryColumn.getOrderValue(a);
      const bSecondaryValue = secondaryColumn.getOrderValue(b);
      if (typeof aSecondaryValue === 'string' && typeof bSecondaryValue === 'string') {
        return secondaryOrder.order === 'asc'
          ? aSecondaryValue.localeCompare(bSecondaryValue)
          : bSecondaryValue.localeCompare(aSecondaryValue);
      } else if (typeof aSecondaryValue === 'number' && typeof bSecondaryValue === 'number') {
        return secondaryOrder.order === 'asc' ? aSecondaryValue - bSecondaryValue : bSecondaryValue - aSecondaryValue;
      }
    }

    return 0;
  };
}

export enum StrategyReturnPeriods {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export type PeriodItem = {
  period: StrategyReturnPeriods;
  annualRatio: number;
  title: ReturnType<typeof defineMessage>;
};

export const STRATEGY_RETURN_PERIODS: PeriodItem[] = [
  {
    period: StrategyReturnPeriods.DAY,
    annualRatio: 1 / 365,
    title: defineMessage({
      defaultMessage: 'Daily',
      description: 'strategy-detail.vault-investment-data.daily',
    }),
  },
  {
    period: StrategyReturnPeriods.WEEK,
    annualRatio: 1 / 52,
    title: defineMessage({
      defaultMessage: 'Weekly',
      description: 'strategy-detail.vault-investment-data.weekly',
    }),
  },
  {
    period: StrategyReturnPeriods.MONTH,
    annualRatio: 1 / 12,
    title: defineMessage({
      defaultMessage: 'Monthly',
      description: 'strategy-detail.vault-investment-data.monthly',
    }),
  },
  {
    period: StrategyReturnPeriods.YEAR,
    annualRatio: 1,
    title: defineMessage({
      defaultMessage: 'Annual',
      description: 'strategy-detail.vault-investment-data.yearly',
    }),
  },
];

export function parseUserStrategiesFinancialData(userPositions: EarnPosition[] = []) {
  const totalInvestedUsd = userPositions.reduce((acc, position) => {
    const assetBalance = position.balances.find((balance) => isSameToken(balance.token, position.strategy.asset));
    // eslint-disable-next-line no-param-reassign
    return acc + Number(assetBalance?.amount.amountInUSD) || 0;
  }, 0);

  const currentProfitUsd = userPositions.reduce((acc, position) => {
    const allProfits = position.balances.reduce((profitAcc, balance) => {
      // eslint-disable-next-line no-param-reassign
      return profitAcc + Number(balance.profit.amountInUSD) || 0;
    }, 0);

    return acc + allProfits;
  }, 0);

  const earnings = STRATEGY_RETURN_PERIODS.reduce<Record<StrategyReturnPeriods, number>>(
    (acc, period) => {
      // eslint-disable-next-line no-param-reassign
      acc[period.period] = userPositions.reduce((periodAcc, position) => {
        const assetBalance = position.balances.find((balance) => isSameToken(balance.token, position.strategy.asset));
        // eslint-disable-next-line no-param-reassign
        return (
          periodAcc + (Number(assetBalance?.amount.amountInUSD) || 0) * period.annualRatio * position.strategy.farm.apy
        );
      }, 0);

      return acc;
    },
    {
      [StrategyReturnPeriods.DAY]: 0,
      [StrategyReturnPeriods.WEEK]: 0,
      [StrategyReturnPeriods.MONTH]: 0,
      [StrategyReturnPeriods.YEAR]: 0,
    }
  );

  const currentProfitRate = (currentProfitUsd / totalInvestedUsd) * 100;

  return { totalInvestedUsd, currentProfitUsd, currentProfitRate, earnings };
}

export function calculateUserStrategiesBalances(userPositions: EarnPosition[] = []): EarnPosition['balances'] {
  const accumBalances = userPositions.reduce<Record<Address, { token: Token; amount: bigint; profit: bigint }>>(
    (acc, position) => {
      position.balances.forEach((balance) => {
        // eslint-disable-next-line no-param-reassign
        acc[balance.token.address] = {
          token: balance.token,
          amount: (acc[balance.token.address]?.amount || BigInt(0)) + balance.amount.amount,
          profit: (acc[balance.token.address]?.profit || BigInt(0)) + balance.profit.amount,
        };
      });
      return acc;
    },
    {}
  );

  return Object.values(accumBalances).map((totalBalance) => ({
    token: totalBalance.token,
    amount: {
      amount: totalBalance.amount,
      amountInUnits: formatUnits(totalBalance.amount, totalBalance.token.decimals),
      amountInUSD: parseUsdPrice(
        totalBalance.token,
        totalBalance.amount,
        parseNumberUsdPriceToBigInt(totalBalance.token.price)
      ).toFixed(2),
    },
    profit: {
      amount: totalBalance.profit,
      amountInUnits: formatUnits(totalBalance.profit, totalBalance.token.decimals),
      amountInUSD: parseUsdPrice(
        totalBalance.token,
        totalBalance.profit,
        parseNumberUsdPriceToBigInt(totalBalance.token.price)
      ).toFixed(2),
    },
  }));
}
