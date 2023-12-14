import React from 'react';
import { Box, Grid, Skeleton, Typography, colors } from 'ui-library';
import Portfolio, { PortfolioRecord } from '../components/portfolio';
import WalletSelector, { ALL_WALLETS } from '@common/components/wallet-selector';
import { useAllBalances } from '@state/balances/hooks';
import { formatUnits } from '@ethersproject/units';
import Activity from '../components/activity';
import { isUndefined } from 'lodash';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import useCountingAnimation from '@hooks/useCountingAnimation';

const StyledNetWorth = styled(Typography)`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo1};
  `}
`;

const StyledNetWorthDecimals = styled(Box)`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo4};
  `}
`;

const StyledFeatureTitle = styled(Typography).attrs({
  variant: 'h4',
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

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
    <Grid container>
      <Grid container flexDirection={'column'} xs={12} gap={4}>
        <Grid container flexDirection={'column'} gap={2}>
          <WalletSelector
            options={{
              allowAllWalletsOption: true,
              onSelectWalletOption: setSelectedWalletOption,
              selectedWalletOption,
            }}
          />
          <StyledNetWorth variant="h2">
            {isLoadingSomePrices ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              <Box display={'flex'}>
                ${totalInteger}
                <StyledNetWorthDecimals>.{totalDecimal}</StyledNetWorthDecimals>
              </Box>
            )}
          </StyledNetWorth>
        </Grid>
        <Grid container>
          <Grid item xs={12} md={8}>
            <StyledFeatureTitle>
              <FormattedMessage description="myPortfolio" defaultMessage="My Portfolio" />
            </StyledFeatureTitle>
            <Portfolio balances={portfolioBalances} isLoadingAllBalances={isLoadingAllBalances} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledFeatureTitle>
              <FormattedMessage description="activity" defaultMessage="Activity" />
            </StyledFeatureTitle>
            <Activity />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HomeFrame;
