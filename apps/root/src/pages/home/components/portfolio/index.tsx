import React from 'react';
import { Token } from '@types';
import {
  Box,
  Grid,
  ItemContent,
  Skeleton,
  TableCell,
  TableRow,
  Typography,
  VirtualizedTable,
  buildVirtuosoTableComponents,
  colors,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { formatCurrencyAmount, toSignificantFromBigDecimal } from '@common/utils/currency';
import { isUndefined, map, orderBy } from 'lodash';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { useAllBalances } from '@state/balances/hooks';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { formatUnits } from 'viem';

const StyledCellTypography = styled(Typography).attrs({
  variant: 'body',
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

const StyledCellTypographySmall = styled(Typography).attrs({
  variant: 'bodySmall',
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo3};

  `}
`;

export type BalanceItem = {
  balance: bigint;
  balanceUsd?: number;
  price?: number;
  token: Token;
  isLoadingPrice: boolean;
};
interface PortfolioProps {
  selectedWalletOption: WalletOptionValues;
}

const SKELETON_ROWS = Array.from(Array(5).keys());
const PortfolioBodySkeleton: ItemContent<BalanceItem, Record<string, never>> = () => {
  return (
    <>
      <TableCell>
        <Grid container gap={1} direction="column">
          <StyledCellTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledCellTypography>
          <StyledCellTypographySmall>
            <Skeleton variant="text" animation="wave" />
          </StyledCellTypographySmall>
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container direction="row" alignItems={'center'} gap={3}>
          <Skeleton variant="circular" width={32} height={32} animation="wave" />
          <Box display="flex" alignItems={'stretch'} flexDirection="column" flexGrow={1} gap={1}>
            <StyledCellTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypography>
            <StyledCellTypographySmall>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypographySmall>
          </Box>
        </Grid>
      </TableCell>
      <TableCell>
        <StyledCellTypography>
          <Skeleton variant="text" animation="wave" />
        </StyledCellTypography>
      </TableCell>
    </>
  );
};

const PortfolioBodyItem: ItemContent<BalanceItem, Record<string, never>> = (
  index: number,
  { balance, token, isLoadingPrice, price, balanceUsd }: BalanceItem
) => {
  return (
    <>
      <TableCell>
        <Box display={'flex'} flexDirection={'column'}>
          <StyledCellTypography>
            {formatCurrencyAmount(balance, token, 3)} {token.symbol}
          </StyledCellTypography>
          <StyledCellTypographySmall>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              `$${toSignificantFromBigDecimal(balanceUsd?.toString(), 4, 0.01)}`
            )}
          </StyledCellTypographySmall>
        </Box>
      </TableCell>
      <TableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          <TokenIconWithNetwork token={token} />
          <Box display={'flex'} flexDirection={'column'}>
            <StyledCellTypography>{token.symbol}</StyledCellTypography>
            <StyledCellTypographySmall>{token.name}</StyledCellTypographySmall>
          </Box>
        </Grid>
      </TableCell>
      <TableCell>
        <StyledCellTypography>
          {isLoadingPrice && !price ? (
            <Skeleton variant="text" animation="wave" />
          ) : (
            `$${toSignificantFromBigDecimal(price?.toString())}`
          )}
        </StyledCellTypography>
      </TableCell>
    </>
  );
};

const PortfolioTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledCellTypographySmall>
        <FormattedMessage description="portfolioBalanceCol" defaultMessage="Balance" />
      </StyledCellTypographySmall>
    </TableCell>
    <TableCell>
      <StyledCellTypographySmall>
        <FormattedMessage description="portfolioAssetCol" defaultMessage="Asset" />
      </StyledCellTypographySmall>
    </TableCell>
    <TableCell>
      <StyledCellTypographySmall>
        <FormattedMessage description="portfolioPriceCol" defaultMessage="Price" />
      </StyledCellTypographySmall>
    </TableCell>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Record<string, never>>();

const Portfolio = ({ selectedWalletOption }: PortfolioProps) => {
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();

  const portfolioBalances = React.useMemo<BalanceItem[]>(() => {
    const tokenBalances = Object.values(allBalances).reduce<Record<string, BalanceItem>>(
      (acc, { balancesAndPrices, isLoadingChainPrices }) => {
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
      },
      {}
    );

    const mappedBalances = map(Object.entries(tokenBalances), ([key, value]) => ({ ...value, key }));
    return orderBy(mappedBalances, [(item) => isUndefined(item.balanceUsd), 'balanceUsd'], ['asc', 'desc']);
  }, [selectedWalletOption, allBalances]);

  return (
    <VirtualizedTable
      data={isLoadingAllBalances ? (SKELETON_ROWS as unknown as BalanceItem[]) : portfolioBalances}
      VirtuosoTableComponents={VirtuosoTableComponents}
      header={PortfolioTableHeader}
      itemContent={isLoadingAllBalances ? PortfolioBodySkeleton : PortfolioBodyItem}
      separateRows={false}
    />
  );
};

export default Portfolio;
