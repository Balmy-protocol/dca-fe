import React from 'react';
import { Token, UserStatus } from '@types';
import {
  Grid,
  ItemContent,
  Skeleton,
  StyledBodySmallBoldTypo2,
  StyledBodySmallRegularTypo2,
  StyledBodySmallRegularTypo3,
  StyledBodySmallLabelTypography,
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
  RefreshIcon,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { formatCurrencyAmount, toSignificantFromBigDecimal } from '@common/utils/currency';
import { isUndefined, map, orderBy } from 'lodash';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { useAllBalances } from '@state/balances/hooks';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { formatUnits } from 'viem';
import { useDisconnect } from 'wagmi';
import useUser from '@hooks/useUser';
import styled from 'styled-components';
import Address from '@common/components/address';
import useNetWorth from '@hooks/useNetWorth';
import WidgetFrame from '../widget-frame';
import { SPACING } from 'ui-library/src/theme/constants';
import useMeanApiService from '@hooks/useMeanApiService';
import { useAppDispatch } from '@state/hooks';
import { fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import useSdkChains from '@hooks/useSdkChains';
import useTokenListByChainId from '@hooks/useTokenListByChainId';
import { IntervalSetActions, TimeoutPromises } from '@constants/timing';
import { ApiErrorKeys } from '@constants';
import { timeoutPromise } from '@mean-finance/sdk';
import { Duration } from 'luxon';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useIsLoggingUser from '@hooks/useIsLoggingUser';

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
          <StyledBodySmallBoldTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallBoldTypo2>
          <StyledBodySmallRegularTypo3>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo3>
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container direction="row" alignItems={'center'} gap={3}>
          <Skeleton variant="circular" width={32} height={32} animation="wave" />
          <ContainerBox alignItems="stretch" flexDirection="column" flexGrow={1} gap={1}>
            <StyledBodySmallRegularTypo2>
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallRegularTypo2>
            <StyledBodySmallRegularTypo3>
              <Skeleton variant="text" animation="wave" />
            </StyledBodySmallRegularTypo3>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <StyledBodySmallRegularTypo2>
          <Skeleton variant="text" animation="wave" />
        </StyledBodySmallRegularTypo2>
      </TableCell>
      <TableCell>
        <StyledBodySmallRegularTypo2>
          <Skeleton variant="text" animation="wave" sx={{ minWidth: '5ch' }} />
        </StyledBodySmallRegularTypo2>
      </TableCell>
    </>
  );
};

const PortfolioNotConnected = () => {
  const openConnectModal = useOpenConnectModal();
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
            <StyledBodySmallBoldTypo2>{token.symbol}</StyledBodySmallBoldTypo2>
            <StyledBodySmallRegularTypo3>{token.name}</StyledBodySmallRegularTypo3>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <ContainerBox flexDirection="column">
          <StyledBodySmallRegularTypo2>{formatCurrencyAmount(balance, token, 3)}</StyledBodySmallRegularTypo2>
          <StyledBodySmallRegularTypo3>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              `$${toSignificantFromBigDecimal(balanceUsd?.toString(), 4, 0.01)}`
            )}
          </StyledBodySmallRegularTypo3>
        </ContainerBox>
      </TableCell>
      <TableCell>
        <StyledBodySmallRegularTypo2>
          {isLoadingPrice && !price ? (
            <Skeleton variant="text" animation="wave" />
          ) : (
            `$${toSignificantFromBigDecimal(price?.toString())}`
          )}
        </StyledBodySmallRegularTypo2>
      </TableCell>
      {relativeBalance !== 0 && (
        <TableCell>
          {isLoadingPrice || !price ? (
            <Skeleton variant="text" animation="wave" sx={{ minWidth: '5ch' }} />
          ) : (
            <ContainerBox alignItems="center" gap={3}>
              <CircularProgressWithBrackground thickness={8} size={SPACING(6)} value={relativeBalance} />
              <StyledBodySmallLabelTypography>{relativeBalance.toFixed(0)}%</StyledBodySmallLabelTypography>
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
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="portfolioAssetCol" defaultMessage="Asset" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="portfolioBalanceCol" defaultMessage="Balance" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="portfolioPriceCol" defaultMessage="Price" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="portfolio%" defaultMessage="%" />
      </StyledBodySmallLabelTypography>
    </TableCell>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Record<string, never>>();

const Portfolio = ({ selectedWalletOption }: PortfolioProps) => {
  const { isLoadingAllBalances, ...allBalances } = useAllBalances();
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const meanApiService = useMeanApiService();
  const tokenListByChainId = useTokenListByChainId();
  const sdkChains = useSdkChains();
  const dispatch = useAppDispatch();
  const user = useUser();
  const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(false);
  const isLoggingUser = useIsLoggingUser();

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

  const onRefreshBalance = React.useCallback(async () => {
    setIsRefreshDisabled(true);
    setTimeout(() => setIsRefreshDisabled(false), IntervalSetActions.globalBalance);
    const chains = sdkChains;
    const addresses = user?.wallets.map(({ address }) => address);

    if (!addresses) return;

    await meanApiService.invalidateCacheForBalancesOnWallets({
      chains,
      addresses,
    });
    await timeoutPromise(dispatch(fetchInitialBalances({ tokenListByChainId })).unwrap(), TimeoutPromises.COMMON, {
      description: ApiErrorKeys.BALANCES,
    });
    void timeoutPromise(dispatch(fetchPricesForAllChains()), TimeoutPromises.COMMON);
  }, [user?.wallets, sdkChains, tokenListByChainId]);

  if (user?.status !== UserStatus.loggedIn && !isLoggingUser) {
    return <PortfolioNotConnected />;
  }

  const isLoading = isLoadingAllBalances || isLoggingUser;

  return (
    <WidgetFrame
      isLoading={isLoading}
      assetValue={assetsTotalValue.wallet}
      Icon={EmptyWalletIcon}
      totalValue={totalAssetValue}
      showPercentage
      title={
        selectedWalletOption === ALL_WALLETS ? (
          <FormattedMessage defaultMessage="All wallets" description="allWallets" />
        ) : (
          <Address address={selectedWalletOption} trimAddress />
        )
      }
      actions={[
        {
          label: <FormattedMessage defaultMessage="Refresh" description="refresh" />,
          onClick: onRefreshBalance,
          disabled: isRefreshDisabled,
          icon: RefreshIcon,
          tooltipTitle: isRefreshDisabled ? undefined : (
            <FormattedMessage
              defaultMessage="You need to wait at least {time} minutes to refresh your balances"
              values={{ time: Duration.fromMillis(IntervalSetActions.globalBalance).as('minutes') }}
              description="refreshTooltip"
            />
          ),
        },
      ]}
    >
      <VirtualizedTable
        data={isLoading ? (SKELETON_ROWS as unknown as BalanceItem[]) : portfolioBalances}
        VirtuosoTableComponents={VirtuosoTableComponents}
        header={PortfolioTableHeader}
        itemContent={isLoading ? PortfolioBodySkeleton : PortfolioBodyItem}
        separateRows={false}
      />
    </WidgetFrame>
  );
};

export default Portfolio;
