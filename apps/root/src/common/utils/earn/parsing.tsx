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
  EarnPositionAction,
  TokenWithWitdrawTypes,
  SdkStrategyTokenWithWithdrawTypes,
  DelayedWithdrawalPositions,
  AmountsOfToken,
  DelayedWithdrawalStatus,
  StrategyId,
  SdkEarnPositionId,
} from 'common-types';
import { compact, find, isNil, isUndefined, uniqBy } from 'lodash';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';
import { isSameToken, parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '../currency';
import { TableStrategy } from '@pages/earn/components/strategies-table';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { Address, formatUnits, parseUnits } from 'viem';
import { FarmWithAvailableDepositTokens, TokenWithStrategy } from '@hooks/earn/useAvailableDepositTokens';
import { nowInSeconds } from '../time';
import { findClosestTimestamp } from '@common/components/earn/action-graph-components';
import { createEmptyEarnPosition } from '@common/mocks/earn';
import { RootState } from '@state';

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
  sdkToken: SdkStrategyTokenWithWithdrawTypes & { apy?: number },
  tokenKey: TokenListId,
  tokenList: TokenList,
  chainId?: number
): TokenWithWitdrawTypes & { apy?: number } => {
  const token = sdkStrategyTokenToToken(sdkToken, tokenKey, tokenList, chainId);
  return { ...token, withdrawTypes: sdkToken.withdrawTypes, apy: sdkToken.apy };
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

    const rewardTokens = Object.values(farm.rewards?.tokens || []).map((reward) =>
      sdkStrategyTokenToTokenWithWitdrawTypes(reward, `${chainId}-${reward.address}` as TokenListId, tokenList, chainId)
    );

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
        apy: farm.rewards?.apy ?? 0,
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
      displayRewards: {
        tokens: rewardTokens.filter((token) => isNil(token.apy) || token.apy > 0) || [],
        apy: farm.rewards?.apy || 0,
      },
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

      const baseEarnPosition: EarnPosition = {
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
      };

      const mappedHistory = userStrategy.history.map<EarnPositionAction>((action) => {
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
        history: mappedHistory,
      } satisfies EarnPosition;
    })
  );
};

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

export const getNeedsTierFromTableObject = <T extends StrategiesTableVariants>(
  tableStrategy: TableStrategy<T>,
  variant: T
): number | undefined => {
  if (variant === StrategiesTableVariants.ALL_STRATEGIES) {
    const strategy = getStrategyFromTableObject<StrategiesTableVariants.ALL_STRATEGIES>(
      tableStrategy as TableStrategy<StrategiesTableVariants.ALL_STRATEGIES>,
      variant
    );
    return strategy.needsTier;
  } else if (variant === StrategiesTableVariants.USER_STRATEGIES) {
    const strategy = getStrategyFromTableObject<StrategiesTableVariants.USER_STRATEGIES>(
      tableStrategy as TableStrategy<StrategiesTableVariants.USER_STRATEGIES>,
      variant
    );
    return strategy.needsTier;
  } else if (variant === StrategiesTableVariants.MIGRATION_OPTIONS) {
    const farmWithAvailableDepositTokens = getStrategyFromTableObject<StrategiesTableVariants.MIGRATION_OPTIONS>(
      tableStrategy as TableStrategy<StrategiesTableVariants.MIGRATION_OPTIONS>,
      variant
    );
    // TODO: Implement this in migration modal (BLY-3658)
    const needsTierLevels = farmWithAvailableDepositTokens.strategies.map((s) => s.needsTier);
    if (needsTierLevels.some((tier) => tier === undefined)) {
      return undefined;
    }
    return Math.min(...needsTierLevels.filter((tier): tier is number => tier !== undefined));
  }
  return undefined;
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
  currentProfitUsd: {
    asset: number;
    total: number;
  };
  currentProfitRate: {
    asset: number;
    total: number;
  };
  totalInvested: Record<Address, AmountsOfToken>;
  currentProfit: Record<Address, AmountsOfToken>;
  earnings: Record<StrategyReturnPeriods, { total: number; byToken: Record<Address, AmountsOfToken> }>;
  monthlyEarnings: Record<Address, AmountsOfToken>;
  totalMonthlyEarnings: number;
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

  let currentProfitAssetUsd = 0;
  let currentProfitTotalUsd = 0;

  const currentProfit = userPositions.reduce<Record<Address, AmountsOfToken>>((acc, position) => {
    position.balances.forEach((tokenBalance) => {
      if (!acc[tokenBalance.token.address]) {
        // eslint-disable-next-line no-param-reassign
        acc[tokenBalance.token.address] = {
          amount: 0n,
          amountInUnits: '0.00',
          amountInUSD: '0.00',
        };
      }

      const newAmount = tokenBalance.profit.amount + acc[tokenBalance.token.address].amount;
      const newAmountInUsd =
        Number(tokenBalance.profit.amountInUSD) + Number(acc[tokenBalance.token.address].amountInUSD);

      // Asset tracking
      if (isSameToken(tokenBalance.token, position.strategy.asset)) {
        currentProfitAssetUsd += Number(tokenBalance.profit.amountInUSD);
      }
      // Totals tracking
      currentProfitTotalUsd += Number(tokenBalance.profit.amountInUSD);

      // eslint-disable-next-line no-param-reassign
      acc[tokenBalance.token.address] = {
        amount: newAmount,
        amountInUnits: formatUnits(newAmount, tokenBalance.token.decimals),
        amountInUSD: newAmountInUsd.toFixed(18),
      };
    });
    return acc;
  }, {});

  const currentProfitUsd = {
    asset: currentProfitAssetUsd,
    total: currentProfitTotalUsd,
  };

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

          const totalApy = position.strategy.farm.apy + (position.strategy.farm.rewards?.apy || 0);
          const newRatiodAmount =
            ((assetBalance?.amount.amount || 0n) *
              BigInt((period.annualRatio * (totalApy / 100) * 10 ** assetBalance.token.decimals).toFixed(0))) /
            BigInt(10 ** assetBalance.token.decimals);
          const newRatiodUsdAmount =
            Number(assetBalance?.amount.amountInUSD || 0) * (period.annualRatio * (totalApy / 100));
          const newAmount = newRatiodAmount + periodAcc.byToken[assetBalance.token.address].amount;
          const newAmountInUsd = newRatiodUsdAmount + Number(periodAcc.byToken[assetBalance.token.address].amountInUSD);
          // eslint-disable-next-line no-param-reassign
          periodAcc.byToken[assetBalance.token.address] = {
            amount: newAmount,
            amountInUnits: formatUnits(newAmount, assetBalance.token.decimals),
            amountInUSD: newAmountInUsd.toFixed(18),
          };

          // eslint-disable-next-line no-param-reassign
          periodAcc.total += newRatiodUsdAmount;
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

  const currentProfitRate = {
    asset: totalInvestedUsd !== 0 ? (currentProfitUsd.asset / totalInvestedUsd) * 100 : 0,
    total: totalInvestedUsd !== 0 ? (currentProfitUsd.total / totalInvestedUsd) * 100 : 0,
  };

  const today = nowInSeconds();
  const monthlyEarnings = userPositions.reduce<Record<Address, AmountsOfToken>>((acc, position) => {
    if (!position.historicalBalances) return acc;
    const timestamps = position.historicalBalances
      // at least 30 days ago
      .filter((balance) => balance.timestamp < today - 30 * 24 * 60 * 60)
      .map((balance) => balance.timestamp);
    // Should always be ordered as descending
    const currentBalances = position.balances;
    const closestTimestamp = findClosestTimestamp(timestamps, today);

    const historicalBalance = position.historicalBalances.find((balance) => balance.timestamp === closestTimestamp);

    if (!historicalBalance) {
      currentBalances.forEach((balance) => {
        if (!acc[balance.token.address]) {
          // eslint-disable-next-line no-param-reassign
          acc[balance.token.address] = {
            amount: 0n,
            amountInUnits: '0.00',
            amountInUSD: '0.00',
          };
        }
        // eslint-disable-next-line no-param-reassign
        acc[balance.token.address] = {
          amount: acc[balance.token.address].amount + balance.profit.amount,
          amountInUnits: formatUnits(acc[balance.token.address].amount + balance.profit.amount, balance.token.decimals),
          amountInUSD: (Number(acc[balance.token.address].amountInUSD) + Number(balance.profit.amountInUSD)).toFixed(
            18
          ),
        };
      });
    } else {
      const balances = historicalBalance.balances;

      balances.forEach((balance) => {
        const currentBalanceToken = currentBalances.find((b) => isSameToken(b.token, balance.token));
        if (!currentBalanceToken) return;

        if (!acc[balance.token.address]) {
          // eslint-disable-next-line no-param-reassign
          acc[balance.token.address] = {
            amount: 0n,
            amountInUnits: '0.00',
            amountInUSD: '0.00',
          };
        }

        const amountProfit = currentBalanceToken.profit.amount - balance.profit.amount;
        const amountProfitInUsd = Number(currentBalanceToken.profit.amountInUSD) - Number(balance.profit.amountInUSD);

        // eslint-disable-next-line no-param-reassign
        acc[balance.token.address] = {
          amount: acc[balance.token.address].amount + amountProfit,
          amountInUnits: formatUnits(acc[balance.token.address].amount + amountProfit, balance.token.decimals),
          amountInUSD: (Number(acc[balance.token.address].amountInUSD) + amountProfitInUsd).toFixed(18),
        };
      });
    }

    return acc;
  }, {});

  const totalMonthlyEarnings = Object.values(monthlyEarnings).reduce((acc, amount) => {
    // eslint-disable-next-line no-param-reassign
    return acc + Number(amount.amountInUSD) || 0;
  }, 0);

  return {
    totalInvestedUsd,
    currentProfitUsd,
    currentProfitRate,
    earnings,
    totalInvested,
    currentProfit,
    monthlyEarnings,
    totalMonthlyEarnings,
  };
}

export function generateEstimatedUserPosition({
  token,
  owner,
  amount,
  strategy,
}: {
  token: Token;
  owner: Address;
  amount: AmountsOfToken;
  strategy: DisplayStrategy;
}): EarnPosition {
  // Create a mock position with the token balance
  const mockPosition = createEmptyEarnPosition(strategy, owner, token);
  mockPosition.balances[0].amount = amount;
  return mockPosition;
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

export const groupPositionsByStrategy = (userPositions: EarnPosition[]) => {
  const strategiesRecord = userPositions.reduce<Record<StrategyId, EarnPosition[]>>((acc, userStrat) => {
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
};

export const getSdkEarnPositionId = ({
  chainId,
  vault,
  positionId,
}: {
  chainId: number;
  vault: Lowercase<Address>;
  positionId: string | bigint;
}): SdkEarnPositionId => {
  return `${chainId}-${vault}-${Number(positionId)}`;
};

export const getTokensWithBalanceAndApy = (strategy: Strategy | DisplayStrategy, userPositions?: EarnPosition[]) => {
  const rewardTokens =
    userPositions?.reduce<Record<Address, { token: Token; tvl: number; amount: bigint }>>((acc, position) => {
      position.balances.forEach((balance) => {
        if (!isSameToken(balance.token, strategy.asset)) {
          if (!acc[balance.token.address]) {
            // eslint-disable-next-line no-param-reassign
            acc[balance.token.address] = {
              token: balance.token,
              tvl: Number(balance.amount.amountInUSD) ?? 0,
              amount: balance.amount.amount,
            };
          } else {
            // eslint-disable-next-line no-param-reassign
            acc[balance.token.address].tvl += Number(balance.amount.amountInUSD) ?? 0;
            // eslint-disable-next-line no-param-reassign
            acc[balance.token.address].amount += balance.amount.amount;
          }
        }
      });
      return acc;
    }, {}) ?? {};

  const totalRewardsTvl = Object.values(rewardTokens).reduce((acc, reward) => acc + reward.tvl, 0);
  const tokens = Object.values(rewardTokens)
    .filter((reward) => reward.amount > 0n)
    .map((reward) => reward.token);
  const tokensToShow = uniqBy([...tokens, ...strategy.displayRewards.tokens], 'address');

  return {
    totalRewardsTvl,
    tokens: tokensToShow,
  };
};

export const getDepositTokensWithBalances = (depositTokens: TokenWithStrategy[], allBalances: RootState['balances']) =>
  depositTokens
    .filter((token) => {
      const chainBalancesAndPrices = allBalances.balances[token.chainId];
      if (!chainBalancesAndPrices) return false;

      const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];
      if (!tokenBalances) return false;

      const walletBalances = Object.entries(tokenBalances.balances).filter(([, balance]) => balance > 0n);
      return walletBalances.length > 0;
    })
    .map((token) => {
      const chainBalancesAndPrices = allBalances.balances[token.chainId];
      const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];
      const balances = Object.entries(tokenBalances.balances);
      return {
        token,
        balances,
        price: tokenBalances.price,
      };
    });
