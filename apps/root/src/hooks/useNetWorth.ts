import React from 'react';
import { isUndefined } from 'lodash';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { useAllBalances } from '@state/balances/hooks';
import { Address, ChainId } from 'common-types';
import useActiveWallet from '@hooks/useActiveWallet';
import { formatUnits, parseUnits } from 'viem';
import useCurrentPositions from './useCurrentPositions';

interface NetWorthProps {
  walletSelector?: WalletOptionValues;
  chainId?: number;
}

type WalletBalances = Record<Address, Record<ChainId, number>>;

const useNetWorth = ({ walletSelector, chainId }: NetWorthProps) => {
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();
  const activeWallet = useActiveWallet();
  const { currentPositions, hasFetchedCurrentPositions } = useCurrentPositions();

  const walletBalances = React.useMemo<WalletBalances>(
    () =>
      Object.entries(allBalances).reduce<WalletBalances>((acc, [chainIdString, { balancesAndPrices }]) => {
        const parsedChainId = Number(chainIdString);
        Object.values(balancesAndPrices).forEach((tokenInfo) => {
          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]: [Address, bigint]) => {
            if (!acc[walletAddress]) {
              // eslint-disable-next-line no-param-reassign
              acc[walletAddress] = {};
            }
            if (!acc[walletAddress]?.[parsedChainId]) {
              // eslint-disable-next-line no-param-reassign
              acc[walletAddress][parsedChainId] = 0;
            }

            // eslint-disable-next-line no-param-reassign
            acc[walletAddress][parsedChainId] += parseFloat(
              formatUnits(
                BigInt(balance) * parseUnits((tokenInfo.price || 0).toFixed(18), 18),
                tokenInfo.token.decimals + 18
              )
            );
          });
        });
        return acc;
      }, {}),
    [allBalances, chainId]
  );

  let walletAssetsTotalValue = 0;

  if (walletSelector === ALL_WALLETS) {
    walletAssetsTotalValue = Object.values(walletBalances).reduce<number>((acc, chainBalances) => {
      let newAcc = acc;
      Object.values(chainBalances).forEach((balance) => {
        newAcc += balance;
      });
      return newAcc;
    }, 0);
  } else if (chainId && walletSelector && activeWallet) {
    walletAssetsTotalValue = walletBalances[walletSelector || activeWallet.address]?.[chainId];
  } else if (walletSelector || activeWallet) {
    const selectedWallet = walletSelector || activeWallet?.address;
    Object.values(walletBalances[selectedWallet!] || {}).forEach((chainBalances) => {
      walletAssetsTotalValue += chainBalances;
    });
  }

  let dcaAssetsTotalValue = 0;
  let filteredPositions = currentPositions;
  if (walletSelector !== ALL_WALLETS) {
    if (chainId && walletSelector && activeWallet) {
      filteredPositions = currentPositions.filter(
        ({ user, chainId: positionChainId }) =>
          chainId === positionChainId && user.toLowerCase() === (walletSelector || activeWallet.address).toLowerCase()
      );
    } else if (walletSelector || activeWallet) {
      const selectedWallet = walletSelector || activeWallet?.address;
      filteredPositions = currentPositions.filter(
        ({ user }) => !selectedWallet || user.toLowerCase() === selectedWallet.toLowerCase()
      );
    }
  }

  dcaAssetsTotalValue = filteredPositions.reduce<number>(
    (acc, { toWithdraw, remainingLiquidity }) =>
      acc + parseFloat(toWithdraw.amountInUSD || '0') + parseFloat(remainingLiquidity.amountInUSD || '0'),
    0
  );

  const isLoadingSomePrices =
    !hasFetchedCurrentPositions ||
    isLoadingAllBalances ||
    Object.values(allBalances).some(
      (balances) =>
        balances.isLoadingChainPrices &&
        Object.values(balances.balancesAndPrices).some(({ price }) => isUndefined(price))
    );

  const assetsTotalValue = {
    wallet: walletAssetsTotalValue,
    dca: dcaAssetsTotalValue,
  };

  const totalAssetValue = Object.values(assetsTotalValue).reduce((acc, value) => acc + value, 0);

  return { isLoadingAllBalances, assetsTotalValue, totalAssetValue, isLoadingSomePrices };
};

export default useNetWorth;
