import React from 'react';
import { Token, UserStatus } from '@types';
import {
  Grid,
  ItemContent,
  Skeleton,
  StyledBodyTypography,
  StyledBodySmallTypography,
  TableCell,
  TableRow,
  VirtualizedTable,
  buildVirtuosoTableComponents,
  ContainerBox,
  Typography,
  Button,
  ForegroundPaper,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { formatCurrencyAmount, toSignificantFromBigDecimal } from '@common/utils/currency';
import { isUndefined, map, orderBy } from 'lodash';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { useAllBalances } from '@state/balances/hooks';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { formatUnits } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import useUser from '@hooks/useUser';
import styled from 'styled-components';

const StyledNoWallet = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: ${spacing(6)};
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
          <StyledBodyTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledBodyTypography>
          <StyledBodySmallTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallTypography>
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container direction="row" alignItems={'center'} gap={3}>
          <Skeleton variant="circular" width={32} height={32} animation="wave" />
          <ContainerBox alignItems="stretch" flexDirection="column" flexGrow={1} gap={1}>
            <StyledBodyTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledBodyTypography>
            <StyledBodySmallTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallTypography>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <StyledBodyTypography>
          <Skeleton variant="text" animation="wave" />
        </StyledBodyTypography>
      </TableCell>
    </>
  );
};

const PortfolioNotConnected = () => {
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect({
    onSettled() {
      if (openConnectModal) {
        openConnectModal();
      }
    },
  });
  const onConnectWallet = () => {
    disconnect();

    if (openConnectModal) {
      openConnectModal();
    }
  };
  return (
    <StyledNoWallet>
      <ContainerBox flexDirection="column" gap={2} alignItems="center">
        <Typography variant="h5">💸️</Typography>
        <Typography variant="h5" fontWeight="bold">
          <FormattedMessage description="noWalletConnected" defaultMessage="No Wallet Connected" />
        </Typography>
        <Typography variant="body" textAlign="center">
          <FormattedMessage
            description="noWalletConnectedParagraph"
            defaultMessage="Connect your wallet to view and manage your crypto portfolio"
          />
        </Typography>
      </ContainerBox>
      <Button variant="contained" size="large" onClick={onConnectWallet} fullWidth>
        <FormattedMessage description="connectYourWallet" defaultMessage="Connect your wallet" />
      </Button>
    </StyledNoWallet>
  );
};

const PortfolioBodyItem: ItemContent<BalanceItem, Record<string, never>> = (
  index: number,
  { balance, token, isLoadingPrice, price, balanceUsd }: BalanceItem
) => {
  return (
    <>
      <TableCell>
        <ContainerBox flexDirection="column">
          <StyledBodyTypography>
            {formatCurrencyAmount(balance, token, 3)} {token.symbol}
          </StyledBodyTypography>
          <StyledBodySmallTypography>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              `$${toSignificantFromBigDecimal(balanceUsd?.toString(), 4, 0.01)}`
            )}
          </StyledBodySmallTypography>
        </ContainerBox>
      </TableCell>
      <TableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          <TokenIconWithNetwork token={token} />
          <ContainerBox flexDirection="column">
            <StyledBodyTypography>{token.symbol}</StyledBodyTypography>
            <StyledBodySmallTypography>{token.name}</StyledBodySmallTypography>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <StyledBodyTypography>
          {isLoadingPrice && !price ? (
            <Skeleton variant="text" animation="wave" />
          ) : (
            `$${toSignificantFromBigDecimal(price?.toString())}`
          )}
        </StyledBodyTypography>
      </TableCell>
    </>
  );
};

const PortfolioTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="portfolioBalanceCol" defaultMessage="Balance" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="portfolioAssetCol" defaultMessage="Asset" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="portfolioPriceCol" defaultMessage="Price" />
      </StyledBodySmallTypography>
    </TableCell>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Record<string, never>>();

const Portfolio = ({ selectedWalletOption }: PortfolioProps) => {
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();
  const user = useUser();

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

  if (user?.status !== UserStatus.loggedIn) {
    return <PortfolioNotConnected />;
  }

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
