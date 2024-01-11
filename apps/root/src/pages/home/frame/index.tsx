import React from 'react';
import { Box, Grid, Skeleton, Typography, colors } from 'ui-library';
import Portfolio, { PortfolioRecord } from '../components/portfolio';
import WalletSelector, { ALL_WALLETS } from '@common/components/wallet-selector';
import { useAllBalances } from '@state/balances/hooks';
import { formatUnits } from 'viem';
import Activity from '../components/activity';
import { isUndefined } from 'lodash';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import useCountingAnimation from '@hooks/useCountingAnimation';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { DASHBOARD_ROUTE } from '@constants/routes';

const StyledNetWorthContainer = styled.div`
  ${({ theme: { palette, spacing } }) => `
    border: 1px solid ${colors[palette.mode].border.border1};
    border-radius: ${spacing(4)};
    display: flex;
    flex-direction: column;
    gap: ${spacing(1)};
    padding: ${spacing(4)};
  `}
`;

const StyledNetWorth = styled(Typography)`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo1};
    font-weight: bold
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
    font-weight: bold
  `}
`;

const StyledContainer = styled.div`
  ${({ theme: { spacing } }) => `
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: ${spacing(4)}
  `}
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
`;
const HomeFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState(ALL_WALLETS);
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeRoute(DASHBOARD_ROUTE.key));
    trackEvent('Home - Visit Dashboard Page');
  }, []);

  const portfolioBalances = React.useMemo(
    () =>
      Object.values(allBalances).reduce<PortfolioRecord>((acc, { balancesAndPrices, isLoadingChainPrices }) => {
        const newAcc = { ...acc };
        Object.entries(balancesAndPrices).forEach(([tokenAddress, tokenInfo]) => {
          const tokenKey = `${tokenInfo.token.chainId}-${tokenAddress}`;
          newAcc[tokenKey] = {
            price: tokenInfo.price,
            token: tokenInfo.token,
            balance: 0n,
            balanceUsd: 0,
            isLoadingPrice: isLoadingChainPrices,
          };

          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
            if (selectedWalletOption === ALL_WALLETS) {
              newAcc[tokenKey].balance = newAcc[tokenKey].balance + balance;
            } else if (selectedWalletOption === walletAddress) {
              newAcc[tokenKey].balance = newAcc[tokenKey].balance + balance;
            }
          });
          const parsedBalance = parseFloat(formatUnits(newAcc[tokenKey].balance, tokenInfo.token.decimals));
          newAcc[tokenKey].balanceUsd = tokenInfo.price ? parsedBalance * tokenInfo.price : undefined;

          if (newAcc[tokenKey].balance === 0n) {
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
      <Grid container flexDirection={'column'} xs={12} gap={12}>
        <StyledNetWorthContainer>
          <WalletSelector
            options={{
              allowAllWalletsOption: true,
              onSelectWalletOption: setSelectedWalletOption,
              selectedWalletOption,
            }}
            size="medium"
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
        </StyledNetWorthContainer>
        <Grid container sx={{ flex: 1 }} gap={8} flexWrap="nowrap">
          <Grid item xs={12} md={8} display="flex">
            <StyledContainer>
              <StyledFeatureTitle>
                <FormattedMessage description="myPortfolio" defaultMessage="My Portfolio" />
              </StyledFeatureTitle>
              <StyledContent>
                <Portfolio balances={portfolioBalances} isLoadingAllBalances={isLoadingAllBalances} />
              </StyledContent>
            </StyledContainer>
          </Grid>
          <Grid item xs={12} md={4} display="flex">
            <StyledContainer>
              <StyledFeatureTitle>
                <FormattedMessage description="activity" defaultMessage="Activity" />
              </StyledFeatureTitle>
              <StyledContent>
                <Activity />
              </StyledContent>
            </StyledContainer>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HomeFrame;
