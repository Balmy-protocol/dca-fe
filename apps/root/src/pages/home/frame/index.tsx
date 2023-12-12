import React from 'react';
import { Grid, Typography } from 'ui-library';
import Portfolio, { PortfolioRecord } from '../components/portfolio';
import WalletSelector, { ALL_WALLETS } from '@common/components/wallet-selector';
import { useAllBalances } from '@state/balances/hooks';
import { formatUnits } from '@ethersproject/units';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import Activity from '../components/activity';
import { isUndefined } from 'lodash';

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
            balance: 0,
            isLoadingPrice: isLoadingChainPrices,
          };

          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
            const parsedBalance = parseFloat(formatUnits(balance, tokenInfo.token.decimals));

            if (selectedWalletOption === ALL_WALLETS) {
              newAcc[tokenKey].balance += parsedBalance;
            } else if (selectedWalletOption === walletAddress) {
              newAcc[tokenKey].balance += parsedBalance;
            }
          });

          if (newAcc[tokenKey].balance === 0) {
            delete newAcc[tokenKey];
          }
        });
        return newAcc;
      }, {}),
    [selectedWalletOption, allBalances]
  );

  const assetsTotalValue = React.useMemo(
    () =>
      Object.values(portfolioBalances).reduce<number>((acc, { balance, price }) => {
        const balanceUsd = (price && balance * price) || 0;
        return acc + balanceUsd;
      }, 0),
    [portfolioBalances]
  );

  const isLoadingSomePrices = Object.values(allBalances).some(
    (balances) =>
      balances.isLoadingChainPrices && Object.values(balances.balancesAndPrices).some(({ price }) => isUndefined(price))
  );

  return (
    <Grid container>
      {isLoadingAllBalances ? (
        <CenteredLoadingIndicator />
      ) : (
        <Grid container flexDirection={'column'} xs={12} gap={4}>
          <Grid container flexDirection={'column'} gap={2}>
            <WalletSelector
              allowAllWalletsOption
              onSelectWalletOption={setSelectedWalletOption}
              selectedWalletOption={selectedWalletOption}
            />
            {isLoadingSomePrices ? (
              <CenteredLoadingIndicator />
            ) : (
              <Typography>${assetsTotalValue.toFixed(2)}</Typography>
            )}
          </Grid>
          <Grid container>
            <Grid item xs={12} md={8}>
              <Portfolio balances={portfolioBalances} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Activity />
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default HomeFrame;
