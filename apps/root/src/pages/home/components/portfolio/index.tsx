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
  EmptyWalletIcon,
  CircularProgressWithBrackground,
  colors,
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
import Address from '@common/components/address';
import useNetWorth from '@hooks/useNetWorth';
import WidgetFrame from '../widget-frame';
import { SPACING } from 'ui-library/src/theme/constants';

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
  relativeBalance: number;
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
      <TableCell>
        <StyledBodyTypography>
          <Skeleton variant="text" animation="wave" sx={{ minWidth: '5ch' }} />
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
        <Typography variant="bodyRegular" textAlign="center">
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
  { balance, token, isLoadingPrice, price, balanceUsd, relativeBalance }: BalanceItem
) => {
  return (
    <>
      <TableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          <TokenIconWithNetwork token={token} />
          <ContainerBox flexDirection="column" flex="1" style={{ overflow: 'hidden' }}>
            <StyledBodyTypography>{token.symbol}</StyledBodyTypography>
            <StyledBodySmallTypography>{token.name}</StyledBodySmallTypography>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <ContainerBox flexDirection="column">
          <StyledBodyTypography>{formatCurrencyAmount(balance, token, 3)}</StyledBodyTypography>
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
        <StyledBodyTypography>
          {isLoadingPrice && !price ? (
            <Skeleton variant="text" animation="wave" />
          ) : (
            `$${toSignificantFromBigDecimal(price?.toString())}`
          )}
        </StyledBodyTypography>
      </TableCell>
      {relativeBalance !== 0 && (
        <TableCell>
          {isLoadingPrice || !price ? (
            <Skeleton variant="text" animation="wave" sx={{ minWidth: '5ch' }} />
          ) : (
            <ContainerBox alignItems="center" gap={3}>
              <CircularProgressWithBrackground thickness={8} size={SPACING(6)} value={relativeBalance} />
              <StyledBodyTypography sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo3 }}>
                {relativeBalance.toFixed(0)}%
              </StyledBodyTypography>
            </ContainerBox>
          )}
        </TableCell>
      )}
    </>
  );
};

const PortfolioTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="portfolioAssetCol" defaultMessage="Asset" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="portfolioBalanceCol" defaultMessage="Balance" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="portfolioPriceCol" defaultMessage="Price" />
      </StyledBodySmallTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallTypography>
        <FormattedMessage description="portfolio%" defaultMessage="%" />
      </StyledBodySmallTypography>
    </TableCell>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Record<string, never>>();

const Portfolio = ({ selectedWalletOption }: PortfolioProps) => {
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const user = useUser();

  const portfolioBalances = React.useMemo<BalanceItem[]>(() => {
    const tokenBalances = Object.values(allBalances).reduce<Record<string, BalanceItem>>(
      (acc, { balancesAndPrices, isLoadingChainPrices }) => {
        Object.entries(balancesAndPrices).forEach(([tokenAddress, tokenInfo]) => {
          const tokenKey = `${tokenInfo.token.chainId}-${tokenAddress}`;
          // eslint-disable-next-line no-param-reassign
          acc[tokenKey] = {
            price: tokenInfo.price,
            token: tokenInfo.token,
            balance: 0n,
            balanceUsd: 0,
            isLoadingPrice: isLoadingChainPrices,
            relativeBalance: 0,
          };

          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
            if (selectedWalletOption === ALL_WALLETS) {
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey].balance = acc[tokenKey].balance + balance;
            } else if (selectedWalletOption === walletAddress) {
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey].balance = acc[tokenKey].balance + balance;
            }
          });
          const parsedBalance = parseFloat(formatUnits(acc[tokenKey].balance, tokenInfo.token.decimals));
          // eslint-disable-next-line no-param-reassign
          acc[tokenKey].balanceUsd = tokenInfo.price ? parsedBalance * tokenInfo.price : undefined;

          if (acc[tokenKey].balance === 0n) {
            // eslint-disable-next-line no-param-reassign
            delete acc[tokenKey];
          }
        });
        return acc;
      },
      {}
    );

    const mappedBalances = map(Object.entries(tokenBalances), ([key, value]) => ({
      ...value,
      key,
      relativeBalance:
        assetsTotalValue.wallet && value.balanceUsd ? (value.balanceUsd / assetsTotalValue.wallet) * 100 : 0,
    }));

    return orderBy(mappedBalances, [(item) => isUndefined(item.balanceUsd), 'balanceUsd'], ['asc', 'desc']);
  }, [selectedWalletOption, allBalances]);

  if (user?.status !== UserStatus.loggedIn) {
    return <PortfolioNotConnected />;
  }

  return (
    <WidgetFrame
      isLoading={isLoadingAllBalances}
      assetValue={assetsTotalValue.wallet}
      Icon={EmptyWalletIcon}
      totalValue={totalAssetValue}
      showPercentage
      title={
        selectedWalletOption === ALL_WALLETS ? (
          <FormattedMessage defaultMessage="All wallets" description="allWallets" />
        ) : (
          <Address address={selectedWalletOption}></Address>
        )
      }
    >
      <VirtualizedTable
        data={isLoadingAllBalances ? (SKELETON_ROWS as unknown as BalanceItem[]) : portfolioBalances}
        VirtuosoTableComponents={VirtuosoTableComponents}
        header={PortfolioTableHeader}
        itemContent={isLoadingAllBalances ? PortfolioBodySkeleton : PortfolioBodyItem}
        separateRows={false}
      />
    </WidgetFrame>
  );
};

export default Portfolio;
