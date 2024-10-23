import {
  NetworkStruct,
  Strategy,
  StrategyYieldType,
  TokenList,
  SdkStrategyToken,
  Token,
  TokenListId,
  SavedSdkStrategy,
  SavedSdkEarnPosition,
  EarnPosition,
  EarnPositionActionType,
  DisplayStrategy,
  FeeType,
  BaseEarnPosition,
  DetailedEarnPosition,
  EarnPositionAction,
  TokenWithWitdrawTypes,
  SdkStrategyTokenWithWithdrawTypes,
  DelayedWithdrawalPositions,
  TokenType,
} from 'common-types';
import { compact, find, isUndefined } from 'lodash';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';
import { isSameToken, parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '../currency';
import { StrategyColumnConfig, StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';
import { TableStrategy } from '@pages/earn/components/strategies-table';
import { ColumnOrder, StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { Address, formatUnits, parseUnits } from 'viem';

export const sdkStrategyTokenToToken = (
  sdkToken: SdkStrategyToken,
  tokenKey: TokenListId,
  tokenList: TokenList,
  chainId?: number
): Token => {
  const token = tokenList[tokenKey] || toToken({ ...sdkToken, chainId });
  return { ...token, price: sdkToken.price };
};

export const sdkStrategyTokenToTokenWithWitdrawTypes = (
  sdkToken: SdkStrategyTokenWithWithdrawTypes,
  tokenKey: TokenListId,
  tokenList: TokenList,
  chainId?: number
): TokenWithWitdrawTypes => {
  const token = sdkStrategyTokenToToken(sdkToken, tokenKey, tokenList, chainId);
  return { ...token, withdrawTypes: sdkToken.withdrawTypes };
};

export const yieldTypeFormatter = (yieldType: StrategyYieldType) => {
  switch (yieldType) {
    case StrategyYieldType.LENDING:
      return defineMessage({
        defaultMessage: 'Lending',
        description: 'earn.strategy.yield-type.lending',
      });
    case StrategyYieldType.STAKING:
      return defineMessage({
        defaultMessage: 'Staking',
        description: 'earn.strategy.yield-type.staking',
      });
    case StrategyYieldType.AGGREAGATOR:
      return defineMessage({
        defaultMessage: 'Aggregator',
        description: 'earn.strategy.yield-type.aggregator',
      });
    default:
      return defineMessage({
        defaultMessage: 'Unknown',
        description: 'earn.strategy.yield-type.unknown',
      });
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
    const { farm, id, guardian, lastUpdatedAt, ...rest } = strategy;
    const { chainId } = farm;
    const network = find(NETWORKS, { chainId }) as NetworkStruct;

    return {
      id: id,
      chainId: chainId,
      asset: sdkStrategyTokenToTokenWithWitdrawTypes(
        farm.asset,
        `${chainId}-${farm.asset.address}` as TokenListId,
        tokenList,
        chainId
      ),
      rewards: {
        tokens: Object.values(farm.rewards?.tokens || []).map((reward) =>
          sdkStrategyTokenToTokenWithWitdrawTypes(
            reward,
            `${chainId}-${reward.address}` as TokenListId,
            tokenList,
            chainId
          )
        ),
        apy: farm.apy,
      },
      network,
      guardian: guardian,
      farm: {
        ...farm,
        asset: sdkStrategyTokenToTokenWithWitdrawTypes(
          farm.asset,
          `${chainId}-${farm.asset.address}` as TokenListId,
          tokenList,
          chainId
        ),
      },
      formattedYieldType: intl.formatMessage(yieldTypeFormatter(farm.type)),
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

      const baseEarnPosition: BaseEarnPosition | DetailedEarnPosition = {
        ...userStrategy,
        strategy,
        history: [],
        delayed: userStrategy.delayed?.map((delayed) => ({
          ...delayed,
          token: sdkStrategyTokenToToken(
            delayed.token,
            `${strategy.network.chainId}-${delayed.token.address}` as TokenListId,
            tokenList,
            strategy.network.chainId
          ),
        })),
        balances: userStrategy.balances.map((balance) => ({
          ...balance,
          token: sdkStrategyTokenToToken(
            balance.token,
            `${strategy.network.chainId}-${balance.token.address}` as TokenListId,
            tokenList,
            strategy.network.chainId
          ),
        })),
        historicalBalances: userStrategy.historicalBalances.map((historicalBalance) => ({
          ...historicalBalance,
          balances: historicalBalance.balances.map((balance) => ({
            ...balance,
            token: sdkStrategyTokenToToken(
              balance.token,
              `${strategy.network.chainId}-${balance.token.address}` as TokenListId,
              tokenList,
              strategy.network.chainId
            ),
          })),
        })),
      } satisfies BaseEarnPosition;

      if ('detailed' in userStrategy) {
        mappedHistory = userStrategy.history.map<EarnPositionAction>((action) => {
          if (action.action === EarnPositionActionType.WITHDREW) {
            return {
              ...action,
              withdrawn: action.withdrawn.map((withdrawn) => ({
                ...withdrawn,
                token: sdkStrategyTokenToToken(
                  withdrawn.token,
                  `${strategy.network.chainId}-${withdrawn.token.address}` as TokenListId,
                  tokenList,
                  strategy.network.chainId
                ),
              })),
            };
          }

          return action;
        });

        return {
          ...baseEarnPosition,
          detailed: true,
          history: mappedHistory,
        } satisfies DetailedEarnPosition;
      }

      return baseEarnPosition;
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
      return primaryOrder.order === 'asc' ? 1 : -1;
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

    return secondaryOrder.order === 'asc' ? 1 : -1;
  };
}

export const getStrategyFromTableObject = <T extends StrategiesTableVariants>(
  tableStrategy: TableStrategy<T>,
  variant: T
) => {
  let strategy: Strategy;
  if (variant === StrategiesTableVariants.ALL_STRATEGIES) {
    strategy = tableStrategy as Strategy;
  } else {
    strategy = (tableStrategy as EarnPosition[])[0].strategy;
  }

  return strategy;
};

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
          periodAcc +
          (Number(assetBalance?.amount.amountInUSD) || 0) * period.annualRatio * (position.strategy.farm.apy / 100)
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

  const currentProfitRate = totalInvestedUsd !== 0 ? (currentProfitUsd / totalInvestedUsd) * 100 : 0;

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

export function calculateEarnFeeBigIntAmount({
  strategy,
  feeType,
  assetAmount,
}: {
  strategy?: DisplayStrategy;
  feeType: FeeType;
  assetAmount?: bigint;
}) {
  const feePercentage = strategy?.guardian?.fees.find((fee) => fee.type === feeType)?.percentage;

  if (!feePercentage || isUndefined(assetAmount)) return undefined;

  const feePercentageBigInt = BigInt(Math.round(feePercentage * 100));

  return (assetAmount * feePercentageBigInt) / 100000n;
}

export function calculateEarnFeeAmount({
  strategy,
  feeType,
  assetAmount,
}: {
  strategy?: DisplayStrategy;
  feeType: FeeType;
  assetAmount?: string;
}) {
  if (!assetAmount || !strategy) return undefined;

  const parsedAssetAmount = parseUnits(assetAmount, strategy.asset.decimals);

  return calculateEarnFeeBigIntAmount({ strategy, feeType, assetAmount: parsedAssetAmount });
}

export const calculatePositionTotalDelayedAmountsUsd = (position: DelayedWithdrawalPositions) => {
  return position.delayed.reduce(
    (acc, delayed) => {
      return {
        totalPendingUsd: acc.totalPendingUsd + Number(delayed.pending.amountInUSD || 0),
        totalReadyUsd: acc.totalReadyUsd + Number(delayed.ready.amountInUSD || 0),
      };
    },
    {
      totalPendingUsd: 0,
      totalReadyUsd: 0,
    }
  );
};
