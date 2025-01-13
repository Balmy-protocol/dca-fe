import React from 'react';
import { find, isUndefined } from 'lodash';
import { WalletOptionValues, ALL_WALLETS } from '@common/components/wallet-selector/types';
import { useAllBalances } from '@state/balances/hooks';
import { Address, ChainId, DelayedWithdrawalPositions, Token } from 'common-types';
import useActiveWallet from '@hooks/useActiveWallet';
import { formatUnits, parseUnits } from 'viem';
import useCurrentPositions from './useCurrentPositions';
import useWallets from './useWallets';
import useEarnPositions from './earn/useEarnPositions';
import { getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { calculatePositionTotalDelayedAmountsUsd } from '@common/utils/earn/parsing';
import useEarnAccess from './useEarnAccess';

interface NetWorthProps {
  walletSelector?: WalletOptionValues;
  chainId?: number;
  tokens?: Token[];
}

type WalletBalances = Record<Address, Record<ChainId, number>>;

const useNetWorth = ({ walletSelector, chainId, tokens }: NetWorthProps) => {
  const { isLoadingAllBalances, balances: allBalances } = useAllBalances();
  const activeWallet = useActiveWallet();
  const { currentPositions, hasFetchedCurrentPositions } = useCurrentPositions();
  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();
  const wallets = useWallets();
  const authWallet = find(wallets, { isAuth: true })?.address;
  const { hasEarnAccess } = useEarnAccess();

  const walletBalances = React.useMemo<WalletBalances>(
    () =>
      Object.entries(allBalances).reduce<WalletBalances>((acc, [chainIdString, { balancesAndPrices }]) => {
        const parsedChainId = Number(chainIdString);
        Object.values(balancesAndPrices)
          .filter(
            (tokenInfo) =>
              !(tokens && tokens.length) ||
              tokens.some((filterToken) => getIsSameOrTokenEquivalent(filterToken, tokenInfo.token))
          )
          .forEach((tokenInfo) => {
            Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]: [Address, bigint]) => {
              if (!acc[walletAddress]) {
                // eslint-disable-next-line no-param-reassign
                acc[walletAddress] = {};
              }
              if (!acc[walletAddress]?.[parsedChainId]) {
                // eslint-disable-next-line no-param-reassign
                acc[walletAddress][parsedChainId] = 0;
              }

              if (tokenInfo) {
                // eslint-disable-next-line no-param-reassign
                acc[walletAddress][parsedChainId] += parseFloat(
                  formatUnits(
                    BigInt(balance) * parseUnits((tokenInfo.price || 0).toFixed(18), 18),
                    tokenInfo.token.decimals + 18
                  )
                );
              }
            });
          });
        return acc;
      }, {}),
    [allBalances, chainId, tokens]
  );

  const walletAddressToEvaluate =
    walletSelector !== ALL_WALLETS && (walletSelector || activeWallet?.address || authWallet);

  const walletAssetsTotalValue = React.useMemo(() => {
    let walletAssetsTotalValueToReturn = 0;

    if (walletSelector === ALL_WALLETS) {
      walletAssetsTotalValueToReturn = Object.values(walletBalances).reduce<number>((acc, chainBalances) => {
        let newAcc = acc;
        Object.values(chainBalances).forEach((balance) => {
          newAcc += balance;
        });
        return newAcc;
      }, 0);
    } else if (chainId && walletAddressToEvaluate) {
      walletAssetsTotalValueToReturn = walletBalances[walletAddressToEvaluate]?.[chainId];
    } else if (walletAddressToEvaluate) {
      Object.values(walletBalances[walletAddressToEvaluate] || {}).forEach((chainBalances) => {
        walletAssetsTotalValueToReturn += chainBalances;
      });
    }

    return walletAssetsTotalValueToReturn;
  }, [walletSelector, chainId, walletBalances, walletAddressToEvaluate]);

  // DCA
  const dcaAssetsTotalValue = React.useMemo(() => {
    let filteredPositions = currentPositions.filter(
      (position) =>
        !(tokens && tokens.length) ||
        tokens.some(
          (filterToken) =>
            getIsSameOrTokenEquivalent(filterToken, position.from) ||
            getIsSameOrTokenEquivalent(filterToken, position.to)
        )
    );
    if (walletSelector !== ALL_WALLETS) {
      if (chainId && walletAddressToEvaluate) {
        filteredPositions = currentPositions.filter(
          ({ user, chainId: positionChainId }) =>
            chainId === positionChainId && user.toLowerCase() === walletAddressToEvaluate.toLowerCase()
        );
      } else if (walletAddressToEvaluate) {
        filteredPositions = currentPositions.filter(
          ({ user }) => user.toLowerCase() === walletAddressToEvaluate.toLowerCase()
        );
      }
    }

    return filteredPositions.reduce<number>(
      (acc, { toWithdraw, remainingLiquidity }) =>
        acc + parseFloat(toWithdraw.amountInUSD || '0') + parseFloat(remainingLiquidity.amountInUSD || '0'),
      0
    );
  }, [walletAddressToEvaluate, walletSelector, chainId, currentPositions, tokens]);

  // EARN
  const earnTokensTotalValue = React.useMemo(() => {
    let filteredUserStrategies = userStrategies.filter(
      (userStrategy) =>
        !(tokens && tokens.length) ||
        tokens.some(
          (filterToken) =>
            getIsSameOrTokenEquivalent(userStrategy.strategy.asset, filterToken) ||
            userStrategy.strategy.rewards.tokens.some((rewardToken) =>
              getIsSameOrTokenEquivalent(rewardToken, filterToken)
            )
        )
    );

    if (walletSelector !== ALL_WALLETS) {
      if (chainId && walletAddressToEvaluate) {
        filteredUserStrategies = userStrategies.filter(
          ({
            owner,
            strategy: {
              network: { chainId: positionChainId },
            },
          }) => chainId === positionChainId && owner.toLowerCase() === walletAddressToEvaluate.toLowerCase()
        );
      } else if (walletAddressToEvaluate) {
        filteredUserStrategies = userStrategies.filter(
          ({ owner }) => owner.toLowerCase() === walletAddressToEvaluate.toLowerCase()
        );
      }
    }

    const depositedTokensValue = filteredUserStrategies.reduce<number>(
      (acc, { balances }) =>
        acc +
        balances
          .filter(
            (balance) =>
              !(tokens && tokens.length) ||
              tokens.some((filterToken) => getIsSameOrTokenEquivalent(balance.token, filterToken))
          )
          .reduce((earnAcc, positionBalance) => earnAcc + parseFloat(positionBalance.amount.amountInUSD || '0'), 0),
      0
    );

    const delayedTokensValue = filteredUserStrategies
      .filter((position): position is DelayedWithdrawalPositions => !!position.delayed)
      .reduce<number>((acc, userStrategy) => {
        const { totalPendingUsd, totalReadyUsd } = calculatePositionTotalDelayedAmountsUsd(userStrategy);
        return acc + totalPendingUsd + totalReadyUsd;
      }, 0);

    return depositedTokensValue + delayedTokensValue;
  }, [tokens, userStrategies, walletSelector, chainId, walletAddressToEvaluate]);

  const isLoadingSomePrices =
    (activeWallet && (!hasFetchedCurrentPositions || (hasEarnAccess && !hasFetchedUserStrategies))) ||
    isLoadingAllBalances ||
    Object.values(allBalances).some(
      (balances) =>
        balances.isLoadingChainPrices &&
        Object.values(balances.balancesAndPrices).some(({ price }) => isUndefined(price))
    );

  const assetsTotalValue = {
    wallet: walletAssetsTotalValue,
    dca: dcaAssetsTotalValue,
    earn: earnTokensTotalValue,
  };

  const totalAssetValue = Object.values(assetsTotalValue).reduce((acc, value) => acc + Number(value || 0), 0);

  return React.useMemo(
    () => ({ isLoadingAllBalances, assetsTotalValue, totalAssetValue, isLoadingSomePrices }),
    [isLoadingAllBalances, assetsTotalValue, totalAssetValue, isLoadingSomePrices]
  );
};

export default useNetWorth;
