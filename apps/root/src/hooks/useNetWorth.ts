import React from 'react';
import { find, isUndefined } from 'lodash';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { useAllBalances } from '@state/balances/hooks';
import { Address, ChainId, Token } from 'common-types';
import useActiveWallet from '@hooks/useActiveWallet';
import { formatUnits, parseUnits } from 'viem';
import useCurrentPositions from './useCurrentPositions';
import useWallets from './useWallets';
import useEarnPositions from './earn/useEarnPositions';
import { getIsSameOrTokenEquivalent } from '@common/utils/currency';

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
    [allBalances, chainId]
  );

  let walletAssetsTotalValue = 0;

  const walletAddressToEvaluate =
    walletSelector !== ALL_WALLETS && (walletSelector || activeWallet?.address || authWallet);

  if (walletSelector === ALL_WALLETS) {
    walletAssetsTotalValue = Object.values(walletBalances).reduce<number>((acc, chainBalances) => {
      let newAcc = acc;
      Object.values(chainBalances).forEach((balance) => {
        newAcc += balance;
      });
      return newAcc;
    }, 0);
  } else if (chainId && walletAddressToEvaluate) {
    walletAssetsTotalValue = walletBalances[walletAddressToEvaluate]?.[chainId];
  } else if (walletAddressToEvaluate) {
    Object.values(walletBalances[walletAddressToEvaluate] || {}).forEach((chainBalances) => {
      walletAssetsTotalValue += chainBalances;
    });
  }

  // DCA
  let dcaAssetsTotalValue = 0;
  let filteredPositions = currentPositions.filter(
    (position) =>
      !(tokens && tokens.length) ||
      tokens.some(
        (filterToken) =>
          getIsSameOrTokenEquivalent(filterToken, position.from) || getIsSameOrTokenEquivalent(filterToken, position.to)
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

  dcaAssetsTotalValue = filteredPositions.reduce<number>(
    (acc, { toWithdraw, remainingLiquidity }) =>
      acc + parseFloat(toWithdraw.amountInUSD || '0') + parseFloat(remainingLiquidity.amountInUSD || '0'),
    0
  );

  // EARN
  let earnAssetsTotalValue = 0;
  let filteredUserStrategies = userStrategies;
  if (walletSelector !== ALL_WALLETS) {
    if (chainId && walletAddressToEvaluate) {
      filteredUserStrategies = userStrategies.filter(
        ({
          owner,
          strategy: {
            farm: { chainId: positionChainId },
          },
        }) => chainId === positionChainId && owner.toLowerCase() === walletAddressToEvaluate.toLowerCase()
      );
    } else if (walletAddressToEvaluate) {
      filteredUserStrategies = userStrategies.filter(
        ({ owner }) => owner.toLowerCase() === walletAddressToEvaluate.toLowerCase()
      );
    }
  }

  earnAssetsTotalValue = filteredUserStrategies.reduce<number>(
    (acc, { balances }) =>
      acc +
      balances.reduce((earnAcc, positionBalance) => earnAcc + parseFloat(positionBalance.amount.amountInUSD || '0'), 0),
    0
  );

  const isLoadingSomePrices =
    (activeWallet && (!hasFetchedCurrentPositions || !hasFetchedUserStrategies)) ||
    isLoadingAllBalances ||
    Object.values(allBalances).some(
      (balances) =>
        balances.isLoadingChainPrices &&
        Object.values(balances.balancesAndPrices).some(({ price }) => isUndefined(price))
    );

  const assetsTotalValue = {
    wallet: walletAssetsTotalValue,
    dca: dcaAssetsTotalValue,
    earn: earnAssetsTotalValue,
  };

  const totalAssetValue = Object.values(assetsTotalValue).reduce((acc, value) => acc + value, 0);

  return { isLoadingAllBalances, assetsTotalValue, totalAssetValue, isLoadingSomePrices };
};

export default useNetWorth;
