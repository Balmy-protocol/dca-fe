import React from 'react';
import { WalletOptionValues, ALL_WALLETS } from '@common/components/wallet-selector/types';
import { useAllBalances } from '@state/balances/hooks';
import { Token } from 'common-types';
import { formatUnits } from 'viem';
import { getIsSameOrTokenEquivalent, parseExponentialNumberToString } from '@common/utils/currency';
import { isUndefined, map, meanBy, orderBy } from 'lodash';
import useNetWorth from './useNetWorth';
import { useShowSmallBalances } from '@state/config/hooks';

export type BalanceToken = {
  balance: bigint;
  balanceUsd?: number;
  price?: number;
  token: Token;
  isLoadingPrice: boolean;
};

export type BalanceItem = {
  totalBalanceInUnits: string;
  totalBalanceUsd?: number;
  price?: number;
  tokens: BalanceToken[];
  isLoadingPrice: boolean;
  relativeBalance: number;
};

export default function useMergedTokensBalances({
  selectedWalletOption,
  supportedNetworks,
}: {
  selectedWalletOption?: WalletOptionValues;
  supportedNetworks?: number[];
}) {
  const { balances: allBalances, isLoadingAllBalances } = useAllBalances();
  const { assetsTotalValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const showSmallBalances = useShowSmallBalances();

  const mergedBalances = React.useMemo<BalanceItem[]>(() => {
    const balanceTokens = Object.values(allBalances).reduce<Record<string, BalanceToken>>(
      (acc, { balancesAndPrices, isLoadingChainPrices }) => {
        Object.entries(balancesAndPrices).forEach(([tokenAddress, tokenInfo]) => {
          if (supportedNetworks && !supportedNetworks.includes(tokenInfo.token.chainId)) {
            return;
          }
          const tokenKey = `${tokenInfo.token.chainId}-${tokenAddress}`;
          // eslint-disable-next-line no-param-reassign
          acc[tokenKey] = {
            balance: 0n,
            token: tokenInfo.token,
            balanceUsd: 0,
            price: tokenInfo.price,
            isLoadingPrice: isLoadingChainPrices,
          };

          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
            const tokenBalance = acc[tokenKey].balance + balance;

            if (selectedWalletOption === ALL_WALLETS || selectedWalletOption === walletAddress) {
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey].balance = tokenBalance;
            }
          });
          const parsedBalance = parseFloat(formatUnits(acc[tokenKey].balance, tokenInfo.token.decimals));
          // eslint-disable-next-line no-param-reassign
          acc[tokenKey].balanceUsd = tokenInfo.price ? parsedBalance * tokenInfo.price : undefined;

          if (acc[tokenKey].balance === 0n) {
            // eslint-disable-next-line no-param-reassign
            delete acc[tokenKey];
          }
        });
        return acc;
      },
      {}
    );

    // Merge multi-chain tokens
    const multiChainTokenBalances = Object.values(balanceTokens).reduce<BalanceItem[]>((acc, balanceToken) => {
      const equivalentTokenIndex = acc.findIndex((item) =>
        item.tokens.some((itemToken) => getIsSameOrTokenEquivalent(itemToken.token, balanceToken.token))
      );

      if (equivalentTokenIndex === -1) {
        // Unique token
        acc.push({
          totalBalanceInUnits: '0',
          totalBalanceUsd: 0,
          tokens: [balanceToken],
          isLoadingPrice: balanceToken.isLoadingPrice,
          relativeBalance: 0,
        });
      } else {
        // Equivalent token
        acc[equivalentTokenIndex].tokens.push(balanceToken);
        // eslint-disable-next-line no-param-reassign
        acc[equivalentTokenIndex].isLoadingPrice =
          acc[equivalentTokenIndex].isLoadingPrice || balanceToken.isLoadingPrice;
      }

      return acc;
    }, []);

    // Calculate totals
    const multiChainTokenBalancesWithTotal = multiChainTokenBalances.map((balanceItem) => {
      const totalBalanceInUnits = balanceItem.tokens.reduce((acc, { balance, token }) => {
        return acc + Number(formatUnits(balance, token.decimals));
      }, 0);
      const totalBalanceUsd = balanceItem.tokens.reduce((acc, { balanceUsd }) => acc + (balanceUsd || 0), 0);
      const totalBalanceInUnitsFormatted = parseExponentialNumberToString(totalBalanceInUnits);

      return { ...balanceItem, totalBalanceInUnits: totalBalanceInUnitsFormatted, totalBalanceUsd };
    });

    const mappedBalances = map(multiChainTokenBalancesWithTotal, (value) => ({
      ...value,
      key: value.tokens.reduce<string>((acc, { token }) => acc + `-${token.chainId}-${token.address}`, ''),
      relativeBalance:
        assetsTotalValue.wallet && value.totalBalanceUsd ? (value.totalBalanceUsd / assetsTotalValue.wallet) * 100 : 0,
      price:
        meanBy(
          value.tokens.filter((token) => !isUndefined(token.price)),
          'price'
        ) || undefined,
    })).filter((balance) => showSmallBalances || isUndefined(balance.totalBalanceUsd) || balance.totalBalanceUsd >= 1);

    return orderBy(mappedBalances, [(item) => isUndefined(item.totalBalanceUsd), 'totalBalanceUsd'], ['asc', 'desc']);
  }, [selectedWalletOption, allBalances, showSmallBalances, assetsTotalValue]);

  return React.useMemo(() => ({ mergedBalances, isLoadingAllBalances }), [mergedBalances, isLoadingAllBalances]);
}
