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
  AmountsOfToken,
  DelayedWithdrawalStatus,
  StrategyId,
} from 'common-types';
import { compact, find, isUndefined } from 'lodash';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';
import { isSameToken, parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '../currency';
import { StrategyColumnConfig, StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';
import { TableStrategy } from '@pages/earn/components/strategies-table';
import { ColumnOrder, StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { Address, formatUnits, parseUnits } from 'viem';
import { FarmWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';

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
          } else if (action.action === EarnPositionActionType.SPECIAL_WITHDREW) {
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
          } else if (action.action === EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED) {
            return {
              ...action,
              token: sdkStrategyTokenToToken(
                action.token,
                `${strategy.network.chainId}-${action.token.address}` as TokenListId,
                tokenList,
                strategy.network.chainId
              ),
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

export type RowClickParamValue<T extends StrategiesTableVariants> = T extends StrategiesTableVariants.ALL_STRATEGIES
  ? Strategy
  : T extends StrategiesTableVariants.USER_STRATEGIES
    ? Strategy
    : T extends StrategiesTableVariants.MIGRATION_OPTIONS
      ? FarmWithAvailableDepositTokens
      : never;

export const getStrategyFromTableObject = <T extends StrategiesTableVariants>(
  tableStrategy: TableStrategy<T>,
  variant: T
): RowClickParamValue<T> => {
  let strategy;
  if (variant === StrategiesTableVariants.ALL_STRATEGIES) {
    strategy = tableStrategy as RowClickParamValue<StrategiesTableVariants.ALL_STRATEGIES>;
  } else if (variant === StrategiesTableVariants.USER_STRATEGIES) {
    strategy = (tableStrategy as EarnPosition[])[0].strategy;
  } else {
    strategy = tableStrategy as RowClickParamValue<StrategiesTableVariants.MIGRATION_OPTIONS>;
  }

  return strategy as RowClickParamValue<T>;
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

export function parseUserStrategiesFinancialData(userPositions: EarnPosition[] = []): {
  totalInvestedUsd: number;
  currentProfitUsd: number;
  currentProfitRate: number;
  totalInvested: Record<Address, AmountsOfToken>;
  currentProfit: Record<Address, AmountsOfToken>;
  earnings: Record<StrategyReturnPeriods, { total: number; byToken: Record<Address, AmountsOfToken> }>;
} {
  const totalInvested = userPositions.reduce<Record<Address, AmountsOfToken>>((acc, position) => {
    const assetBalance = position.balances.find((balance) => isSameToken(balance.token, position.strategy.asset));
    if (!assetBalance) return acc;
    if (!acc[assetBalance.token.address]) {
      // eslint-disable-next-line no-param-reassign
      acc[assetBalance.token.address] = {
        amount: 0n,
        amountInUnits: '0.00',
        amountInUSD: '0.00',
      };
    }

    const newAmount = assetBalance.amount.amount + acc[assetBalance.token.address].amount;
    const newAmountInUsd =
      Number(assetBalance.amount.amountInUSD) + Number(acc[assetBalance.token.address].amountInUSD);
    // eslint-disable-next-line no-param-reassign
    acc[assetBalance.token.address] = {
      amount: newAmount,
      amountInUnits: formatUnits(newAmount, assetBalance.token.decimals),
      amountInUSD: newAmountInUsd.toFixed(18),
    };
    return acc;
  }, {});

  const totalInvestedUsd = Object.values(totalInvested).reduce((acc, amount) => {
    // eslint-disable-next-line no-param-reassign
    return acc + Number(amount.amountInUSD) || 0;
  }, 0);

  const currentProfit = userPositions.reduce<Record<Address, AmountsOfToken>>((acc, position) => {
    const assetBalance = position.balances.find((balance) => isSameToken(balance.token, position.strategy.asset));
    if (!assetBalance) return acc;
    if (!acc[assetBalance.token.address]) {
      // eslint-disable-next-line no-param-reassign
      acc[assetBalance.token.address] = {
        amount: 0n,
        amountInUnits: '0.00',
        amountInUSD: '0.00',
      };
    }

    const newAmount = assetBalance.profit.amount + acc[assetBalance.token.address].amount;
    const newAmountInUsd =
      Number(assetBalance.profit.amountInUSD) + Number(acc[assetBalance.token.address].amountInUSD);
    // eslint-disable-next-line no-param-reassign
    acc[assetBalance.token.address] = {
      amount: newAmount,
      amountInUnits: formatUnits(newAmount, assetBalance.token.decimals),
      amountInUSD: newAmountInUsd.toFixed(18),
    };
    return acc;
  }, {});

  const currentProfitUsd = Object.values(currentProfit).reduce((acc, amount) => {
    // eslint-disable-next-line no-param-reassign
    return acc + Number(amount.amountInUSD) || 0;
  }, 0);

  const earnings = STRATEGY_RETURN_PERIODS.reduce<
    Record<StrategyReturnPeriods, { total: number; byToken: Record<Address, AmountsOfToken> }>
  >(
    (acc, period) => {
      // eslint-disable-next-line no-param-reassign
      acc[period.period] = userPositions.reduce<{ total: number; byToken: Record<Address, AmountsOfToken> }>(
        (periodAcc, position) => {
          const assetBalance = position.balances.find((balance) => isSameToken(balance.token, position.strategy.asset));
          // eslint-disable-next-line no-param-reassign
          if (!assetBalance) return periodAcc;
          if (!periodAcc.byToken[assetBalance.token.address]) {
            // eslint-disable-next-line no-param-reassign
            periodAcc.byToken[assetBalance.token.address] = {
              amount: 0n,
              amountInUnits: '0.00',
              amountInUSD: '0.00',
            };
          }
          const newRatiodAmount =
            ((assetBalance?.amount.amount || 0n) *
              BigInt(
                (period.annualRatio * (position.strategy.farm.apy / 100) * 10 ** assetBalance.token.decimals).toFixed(0)
              )) /
            BigInt(10 ** assetBalance.token.decimals);
          const newRatiodUsdAmount =
            Number(assetBalance?.amount.amountInUSD || 0) * (period.annualRatio * (position.strategy.farm.apy / 100));
          const newAmount = newRatiodAmount + periodAcc.byToken[assetBalance.token.address].amount;
          const newAmountInUsd = newRatiodUsdAmount + Number(periodAcc.byToken[assetBalance.token.address].amountInUSD);
          // eslint-disable-next-line no-param-reassign
          periodAcc.byToken[assetBalance.token.address] = {
            amount: newAmount,
            amountInUnits: formatUnits(newAmount, assetBalance.token.decimals),
            amountInUSD: newAmountInUsd.toFixed(18),
          };

          // eslint-disable-next-line no-param-reassign
          periodAcc.total += newAmountInUsd;
          return periodAcc;
        },
        { total: 0, byToken: {} }
      );

      return acc;
    },
    {
      [StrategyReturnPeriods.DAY]: { total: 0, byToken: {} },
      [StrategyReturnPeriods.WEEK]: { total: 0, byToken: {} },
      [StrategyReturnPeriods.MONTH]: { total: 0, byToken: {} },
      [StrategyReturnPeriods.YEAR]: { total: 0, byToken: {} },
    }
  );

  const currentProfitRate = totalInvestedUsd !== 0 ? (currentProfitUsd / totalInvestedUsd) * 100 : 0;

  return { totalInvestedUsd, currentProfitUsd, currentProfitRate, earnings, totalInvested, currentProfit };
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

export const getDelayedWithdrawals = ({
  userStrategies,
  strategyGuardianId,
  withdrawStatus,
}: {
  userStrategies: EarnPosition[];
  strategyGuardianId?: StrategyId;
  withdrawStatus?: DelayedWithdrawalStatus;
}) =>
  userStrategies
    .filter((position): position is DelayedWithdrawalPositions => !!position.delayed)
    .filter((position) => !strategyGuardianId || position.strategy.id === strategyGuardianId)
    .reduce<DelayedWithdrawalPositions[]>((acc, position) => {
      // Calculate totals
      const { totalPendingUsd, totalReadyUsd } = calculatePositionTotalDelayedAmountsUsd(position);
      if (totalPendingUsd === 0 && totalReadyUsd === 0) return acc;

      const positionWithTotals: DelayedWithdrawalPositions = {
        ...position,
        totalPendingUsd,
        totalReadyUsd,
      };

      // No status filter
      if (!withdrawStatus) {
        acc.push(positionWithTotals);
        return acc;
      }

      // Filter by status
      if (withdrawStatus === DelayedWithdrawalStatus.PENDING && totalPendingUsd > 0) {
        acc.push(positionWithTotals);
      } else if (withdrawStatus === DelayedWithdrawalStatus.READY && totalReadyUsd > 0) {
        acc.push(positionWithTotals);
      }

      return acc;
    }, []);

export const getStrategyTokenCurrentPrice = (token: Token, strategy: Strategy) => {
  if (isSameToken(token, strategy.asset)) {
    return strategy.asset.price;
  }

  const rewardToken = find(strategy.rewards.tokens, (rewToken) => isSameToken(rewToken, token));

  if (rewardToken) {
    return rewardToken.price;
  }
};
