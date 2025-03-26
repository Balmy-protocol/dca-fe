import { parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '@common/utils/currency';
import { useAllBalances } from '@state/balances/hooks';
import { Address, AmountsOfToken, FarmId, Strategy, StrategyFarm, Token, TokenType } from '@types';
import React from 'react';
import useAllStrategies from './useAllStrategies';
import { formatUnits } from 'viem';
import useTierLevel from '@hooks/tiers/useTierLevel';
import { isNil, uniqBy } from 'lodash';
import useHasFetchedAllStrategies from './useHasFetchedAllStrategies';
import { updateAndParseEarnDepositTokenBalances } from '@state/balances/actions';
import { useAppDispatch } from '@state/hooks';

export interface TokenWithStrategy extends Token {
  strategy: Strategy;
}

export type FarmWithAvailableDepositTokens = {
  farm: StrategyFarm;
  token: Token;
  wallet: Address;
  strategies: Strategy[];
  balance: AmountsOfToken;
  id: FarmId;
  underlying: Token;
  underlyingAmount: AmountsOfToken;
};

export type FarmsWithAvailableDepositTokens = FarmWithAvailableDepositTokens[];

export type DepositTokenWithBalance = {
  token: TokenWithStrategy;
  balances: [string, bigint][];
  price?: number;
};

export type EarnDepositTokenUnderlyingTokens = Record<
  string,
  { underlying: Token; underlyingAmount: string; price: number }
>;

type State = {
  // The key is chainId-tokenAddress-amount
  resultsWithPrices: EarnDepositTokenUnderlyingTokens;
  farmsWithDepositableTokens: FarmsWithAvailableDepositTokens;
};

const parseTokensWithBalanceToFarmsWithDepositableTokens = (
  depositTokensWithBalance: DepositTokenWithBalance[],
  underlyingTokens: EarnDepositTokenUnderlyingTokens
) => {
  return Object.values(
    depositTokensWithBalance.reduce<Record<`${FarmId}-${Address}`, FarmWithAvailableDepositTokens>>(
      (acc, { token, balances, price }) => {
        balances.forEach(([walletAddress, balance]: [Address, bigint]) => {
          // eslint-disable-next-line no-param-reassign
          if (!acc[`${token.strategy.farm.id}-${walletAddress}`]) {
            const underlying = underlyingTokens[`${token.chainId}-${token.address}-${balance}`];
            if (!underlying) {
              return acc;
            }

            if (!underlying.price) {
              return acc;
            }
            const underlyingPrice = underlying.price;
            const underlyingToken = toToken({ ...underlying.underlying, price: underlyingPrice });
            const underlyingAmount = BigInt(underlying.underlyingAmount);
            const underlyingAmountUSD = parseUsdPrice(
              underlyingToken,
              underlyingAmount,
              parseNumberUsdPriceToBigInt(underlyingPrice)
            ).toFixed(2);
            const underlyingAmountUnits = formatUnits(underlyingAmount, underlyingToken.decimals);

            if (Number.isNaN(Number(underlyingAmountUSD)) || Number(underlyingAmountUSD) < 1) {
              return acc;
            }

            // eslint-disable-next-line no-param-reassign
            acc[`${token.strategy.farm.id}-${walletAddress}`] = {
              id: token.strategy.farm.id,
              farm: token.strategy.farm,
              token: { ...toToken({ ...token, price }) },
              wallet: walletAddress,
              strategies: [token.strategy],
              underlying: underlyingToken,
              underlyingAmount: {
                amount: underlyingAmount,
                amountInUSD: underlyingAmountUSD,
                amountInUnits: underlyingAmountUnits,
              },
              balance: {
                amount: balance,
                amountInUSD: parseUsdPrice(token, balance, parseNumberUsdPriceToBigInt(price)).toFixed(2),
                amountInUnits: formatUnits(balance, token.decimals),
              },
            };
          } else {
            // eslint-disable-next-line no-param-reassign
            acc[`${token.strategy.farm.id}-${walletAddress}`].strategies.push(token.strategy);
          }
        });

        return acc;
      },
      {}
    )
  );
};

const useAvailableDepositTokens = () => {
  const strategies = useAllStrategies();
  const hasFetchedAllStrategies = useHasFetchedAllStrategies();
  const { isLoadingAllBalances } = useAllBalances();
  const fetchedInitialBalances = React.useRef(false);
  const fetchedDepositTokens = React.useRef(false);
  const [isFetchingDepositTokenBalances, setIsFetchingDepositTokenBalances] = React.useState(true);
  const dispatch = useAppDispatch();
  const { tierLevel } = useTierLevel();

  const [{ resultsWithPrices, farmsWithDepositableTokens }, setState] = React.useState<State>({
    resultsWithPrices: {},
    farmsWithDepositableTokens: [],
  });

  const depositTokens = React.useMemo(() => {
    if (!hasFetchedAllStrategies) return [];
    const depositTokenList = strategies
      .filter((strategy) => isNil(strategy.needsTier) || isNil(tierLevel) || strategy.needsTier <= tierLevel)
      .reduce<TokenWithStrategy[]>((acc, strategy) => {
        return acc.concat(
          strategy.depositTokens
            .filter((token) => token.type === TokenType.FARM)
            .map((token) => ({
              ...toToken({ ...token, chainId: strategy.network.chainId, type: TokenType.FARM }),
              strategy,
            }))
        );
      }, []);

    return uniqBy(depositTokenList, (token) => `${token.chainId}-${token.address}`);
  }, [strategies, hasFetchedAllStrategies, tierLevel]);

  const onUpdateDepositTokens = React.useCallback(
    async ({ shouldUpdateBalances }: { shouldUpdateBalances?: boolean }) => {
      const response = await dispatch(
        updateAndParseEarnDepositTokenBalances({ depositTokens, resultsWithPrices, shouldUpdateBalances })
      ).unwrap();
      if (!response) return;

      setState((prev) => ({
        resultsWithPrices: { ...prev.resultsWithPrices, ...response.updatedResultsWithPrices },
        farmsWithDepositableTokens: parseTokensWithBalanceToFarmsWithDepositableTokens(
          response.depositTokensWithBalance,
          {
            ...prev.resultsWithPrices,
            ...response.updatedResultsWithPrices,
          }
        ),
      }));

      setIsFetchingDepositTokenBalances(false);
    },
    [dispatch, depositTokens]
  );

  React.useEffect(() => {
    if (hasFetchedAllStrategies && !isLoadingAllBalances && !fetchedInitialBalances.current) {
      fetchedInitialBalances.current = true;
      void onUpdateDepositTokens({ shouldUpdateBalances: false });
    }
  }, [hasFetchedAllStrategies, isLoadingAllBalances]);

  const updateFarmTokensBalances = React.useCallback(async () => {
    if (fetchedDepositTokens.current) return;
    fetchedDepositTokens.current = true;
    setIsFetchingDepositTokenBalances(true);
    await onUpdateDepositTokens({ shouldUpdateBalances: true });
  }, [dispatch, fetchedDepositTokens, depositTokens]);

  return React.useMemo(
    () => ({ farmsWithDepositableTokens, updateFarmTokensBalances, isFetchingDepositTokenBalances }),
    [farmsWithDepositableTokens, updateFarmTokensBalances, isFetchingDepositTokenBalances]
  );
};

export default useAvailableDepositTokens;
