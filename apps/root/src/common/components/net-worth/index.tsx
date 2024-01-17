import React from 'react';
import styled from 'styled-components';
import { isUndefined } from 'lodash';
import useCountingAnimation from '@hooks/useCountingAnimation';
import { BackgroundPaper, Skeleton, Typography, colors } from 'ui-library';
import WalletSelector, { ALL_WALLETS, WalletSelectorProps } from '../wallet-selector';
import { useAllBalances } from '@state/balances/hooks';
import { Address, ChainId } from 'common-types';
import useActiveWallet from '@hooks/useActiveWallet';
import { formatUnits, parseUnits } from 'viem';

const StyledNetWorthContainer = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: ${spacing(1)};
  `}
`;

const StyledNetWorth = styled(Typography)`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo1};
    font-weight: bold
  `}
`;

const StyledNetWorthDecimals = styled.div`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo4};
  `}
`;

interface NetWorthProps {
  walletSelector: WalletSelectorProps;
  chainId?: number;
}

type WalletBalances = Record<Address, Record<ChainId, number>>;

const NetWorth = ({ walletSelector, chainId }: NetWorthProps) => {
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();
  const activeWallet = useActiveWallet();

  const walletBalances = React.useMemo<WalletBalances>(
    () =>
      Object.entries(allBalances).reduce<WalletBalances>((acc, [chainIdString, { balancesAndPrices }]) => {
        const newAcc = { ...acc };
        const parsedChainId = Number(chainIdString);
        Object.values(balancesAndPrices).forEach((tokenInfo) => {
          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]: [Address, bigint]) => {
            if (!newAcc[walletAddress]?.[parsedChainId]) {
              newAcc[walletAddress] = { ...newAcc[walletAddress], [parsedChainId]: 0 };
            }
            newAcc[walletAddress][parsedChainId] += parseFloat(
              formatUnits(
                BigInt(balance) * parseUnits((tokenInfo.price || 0).toFixed(18), 18),
                tokenInfo.token.decimals + 18
              )
            );
          });
        });
        return newAcc;
      }, {}),
    [allBalances, chainId]
  );

  let assetsTotalValue = 0;

  if (walletSelector.options.selectedWalletOption === ALL_WALLETS) {
    assetsTotalValue = Object.values(walletBalances).reduce<number>((acc, chainBalances) => {
      let newAcc = acc;
      Object.values(chainBalances).forEach((balance) => {
        newAcc += balance;
      });
      return newAcc;
    }, 0);
  } else if (chainId && walletSelector.options.selectedWalletOption && activeWallet) {
    assetsTotalValue = walletBalances[walletSelector.options.selectedWalletOption || activeWallet.address]?.[chainId];
  } else if (walletSelector.options.selectedWalletOption && activeWallet) {
    Object.values(walletBalances[walletSelector.options.selectedWalletOption || activeWallet.address] || {}).forEach(
      (chainBalances) => {
        assetsTotalValue += chainBalances;
      }
    );
  }

  const animatedNetWorth = useCountingAnimation(assetsTotalValue);
  const [totalInteger, totalDecimal] = animatedNetWorth.toFixed(2).split('.');

  const isLoadingSomePrices =
    isLoadingAllBalances ||
    Object.values(allBalances).some(
      (balances) =>
        balances.isLoadingChainPrices &&
        Object.values(balances.balancesAndPrices).some(({ price }) => isUndefined(price))
    );
  return (
    <StyledNetWorthContainer variant="outlined">
      <WalletSelector {...walletSelector} />
      <StyledNetWorth variant="h2">
        {isLoadingSomePrices ? (
          <Skeleton variant="text" animation="wave" />
        ) : (
          <div style={{ display: 'flex' }}>
            ${totalInteger}
            <StyledNetWorthDecimals>.{totalDecimal}</StyledNetWorthDecimals>
          </div>
        )}
      </StyledNetWorth>
    </StyledNetWorthContainer>
  );
};

export default NetWorth;
