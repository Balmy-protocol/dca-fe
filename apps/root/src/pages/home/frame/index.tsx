import React from 'react';
import { Grid, Skeleton, Typography } from 'ui-library';
import Portfolio, { PortfolioRecord } from '../components/portfolio';
import WalletSelector, { ALL_WALLETS } from '@common/components/wallet-selector';
import { useAllBalances } from '@state/balances/hooks';
import { formatUnits } from '@ethersproject/units';
import Activity from '../components/activity';
import { isUndefined } from 'lodash';
import { BigNumber } from 'ethers';
import { usdFormatter } from '@common/utils/parsing';

const HomeFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState(ALL_WALLETS);
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();

  const portfolioBalances = React.useMemo(
    () =>
      Object.values(allBalances).reduce<PortfolioRecord>((acc, { balancesAndPrices, isLoadingChainPrices }) => {
        const newAcc = { ...acc };
        Object.entries(balancesAndPrices).forEach(([tokenAddress, tokenInfo]) => {
          const tokenKey = `${tokenInfo.token.chainId}-${tokenAddress}`;
          newAcc[tokenKey] = {
            price: tokenInfo.price,
            token: tokenInfo.token,
            balance: BigNumber.from(0),
            balanceUsd: 0,
            isLoadingPrice: isLoadingChainPrices,
          };

          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
            if (selectedWalletOption === ALL_WALLETS) {
              newAcc[tokenKey].balance = newAcc[tokenKey].balance.add(balance);
            } else if (selectedWalletOption === walletAddress) {
              newAcc[tokenKey].balance = newAcc[tokenKey].balance.add(balance);
            }
          });
          const parsedBalance = parseFloat(formatUnits(newAcc[tokenKey].balance, tokenInfo.token.decimals));
          newAcc[tokenKey].balanceUsd = tokenInfo.price ? parsedBalance * tokenInfo.price : undefined;

          if (newAcc[tokenKey].balance.isZero()) {
            delete newAcc[tokenKey];
          }
        });
        return newAcc;
      }, {}),
    [selectedWalletOption, allBalances]
  );

  const assetsTotalValue = React.useMemo<number>(
    () =>
      Object.values(portfolioBalances).reduce<number>((acc, { balanceUsd }) => {
        return acc + (balanceUsd ?? 0);
      }, 0),
    [portfolioBalances]
  );

  const isLoadingSomePrices =
    isLoadingAllBalances ||
    Object.values(allBalances).some(
      (balances) =>
        balances.isLoadingChainPrices &&
        Object.values(balances.balancesAndPrices).some(({ price }) => isUndefined(price))
    );

  return (
    <Grid container>
      <Grid container flexDirection={'column'} xs={12} gap={4}>
        <Grid container flexDirection={'column'} gap={2}>
          <WalletSelector
            allowAllWalletsOption
            onSelectWalletOption={setSelectedWalletOption}
            selectedWalletOption={selectedWalletOption}
          />
          {isLoadingSomePrices ? (
            <Skeleton variant="rounded" width={210} height={32} />
          ) : (
            <Typography>${usdFormatter(assetsTotalValue)}</Typography>
          )}
        </Grid>
        <Grid container>
          <Grid item xs={12} md={8}>
            <Portfolio balances={portfolioBalances} isLoadingAllBalances={isLoadingAllBalances} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Activity />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HomeFrame;
