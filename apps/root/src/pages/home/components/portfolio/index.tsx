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
  Hidden,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { isUndefined, map, meanBy, orderBy } from 'lodash';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { useAllBalances } from '@state/balances/hooks';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { formatUnits, parseUnits } from 'viem';
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
import { IntervalSetActions, TimeoutPromises } from '@constants/timing';
import { ApiErrorKeys } from '@constants';
import { timeoutPromise } from '@balmy/sdk';
import { Duration } from 'luxon';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useIsLoggingUser from '@hooks/useIsLoggingUser';
import useTrackEvent from '@hooks/useTrackEvent';
import { useShowSmallBalances } from '@state/config/hooks';
import TokenIconMultichain from '../token-icon-multichain';

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

export type BalanceTokens = {
  balance: bigint;
  balanceUsd?: number;
  price?: number;
  token: Token;
}[];

type BalanceItem = {
  balance: bigint;
  balanceUsd?: number;
  price?: number;
  tokens: BalanceTokens;
  isLoadingPrice: boolean;
  relativeBalance: number;
};
interface PortfolioProps {
  selectedWalletOption: WalletOptionValues;
}

interface Context {
  intl: ReturnType<typeof useIntl>;
}

const SKELETON_ROWS = Array.from(Array(5).keys());
const PortfolioBodySkeleton: ItemContent<BalanceItem, Context> = () => {
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
  const { openConnectModal } = useOpenConnectModal();

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
      <Button variant="contained" size="large" onClick={openConnectModal} fullWidth>
        <FormattedMessage description="connectYourWallet" defaultMessage="Connect your wallet" />
      </Button>
    </StyledNoWallet>
  );
};
const PortfolioBodyItem: ItemContent<BalanceItem, Context> = (
  index: number,
  { balance, tokens, isLoadingPrice, price, balanceUsd, relativeBalance }: BalanceItem,
  { intl }
) => {
  return (
    <>
      <TableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          {tokens.length > 1 ? (
            <TokenIconMultichain balanceTokens={tokens} />
          ) : (
            <TokenIconWithNetwork token={tokens[0].token} />
          )}
          <ContainerBox flexDirection="column" flex="1" style={{ overflow: 'hidden' }}>
            <StyledBodySmallBoldTypo2>{tokens[0].token.symbol}</StyledBodySmallBoldTypo2>
            <StyledBodySmallRegularTypo3>{tokens[0].token.name}</StyledBodySmallRegularTypo3>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <ContainerBox flexDirection="column">
          <StyledBodySmallRegularTypo2>
            {formatCurrencyAmount({ amount: balance, token: tokens[0].token, sigFigs: 3, intl })}
          </StyledBodySmallRegularTypo2>
          <StyledBodySmallRegularTypo3>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              `$${formatUsdAmount({ amount: balanceUsd, intl })}`
            )}
          </StyledBodySmallRegularTypo3>
        </ContainerBox>
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              `$${formatUsdAmount({ amount: price, intl })}`
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
      </Hidden>
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
    <Hidden mdDown>
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
    </Hidden>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Context>();

const Portfolio = ({ selectedWalletOption }: PortfolioProps) => {
  const { isLoadingAllBalances, balances: allBalances } = useAllBalances();
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const meanApiService = useMeanApiService();
  const sdkChains = useSdkChains();
  const dispatch = useAppDispatch();
  const user = useUser();
  const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(false);
  const isLoggingUser = useIsLoggingUser();
  const trackEvent = useTrackEvent();
  const intl = useIntl();
  const intlContext = React.useMemo(() => ({ intl }), [intl]);
  const showSmallBalances = useShowSmallBalances();

  const portfolioBalances = React.useMemo<BalanceItem[]>(() => {
    const tokenBalances = Object.values(allBalances).reduce<Record<string, BalanceItem>>(
      (acc, { balancesAndPrices, isLoadingChainPrices }) => {
        Object.entries(balancesAndPrices).forEach(([tokenAddress, tokenInfo]) => {
          const tokenKey = `${tokenInfo.token.chainId}-${tokenAddress}`;
          // eslint-disable-next-line no-param-reassign
          acc[tokenKey] = {
            tokens: [
              {
                balance: 0n,
                token: tokenInfo.token,
                balanceUsd: 0,
                price: tokenInfo.price,
              },
            ],
            balance: 0n,
            balanceUsd: 0,
            isLoadingPrice: isLoadingChainPrices,
            relativeBalance: 0,
          };

          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
            const tokenBalance = acc[tokenKey].tokens[0].balance + balance;

            if (selectedWalletOption === ALL_WALLETS) {
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey].tokens[0].balance = tokenBalance;
            } else if (selectedWalletOption === walletAddress) {
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey].tokens[0].balance = tokenBalance;
            }
          });
          const parsedBalance = parseFloat(formatUnits(acc[tokenKey].tokens[0].balance, tokenInfo.token.decimals));
          // eslint-disable-next-line no-param-reassign
          acc[tokenKey].tokens[0].balanceUsd = tokenInfo.price ? parsedBalance * tokenInfo.price : undefined;

          if (acc[tokenKey].tokens[0].balance === 0n) {
            // eslint-disable-next-line no-param-reassign
            delete acc[tokenKey];
          }
        });
        return acc;
      },
      {}
    );

    const allTokenKeys = Object.keys(tokenBalances);

    // Merge multi-chain tokens
    allTokenKeys.forEach((balanceItemKey) => {
      const balanceItem = tokenBalances[balanceItemKey];
      if (!balanceItem) {
        return;
      }

      const { token: firstAddedToken } = balanceItem.tokens[0];

      firstAddedToken.chainAddresses?.forEach(({ address, chainId }) => {
        const equivalentItemKey = `${chainId}-${address}`;
        const equivalentItem = tokenBalances[equivalentItemKey];
        if (equivalentItem && equivalentItemKey !== balanceItemKey) {
          balanceItem.isLoadingPrice = balanceItem.isLoadingPrice || equivalentItem.isLoadingPrice;
          const equivalentToken = equivalentItem.tokens[0];
          balanceItem.tokens.push(equivalentToken);

          tokenBalances[balanceItemKey] = balanceItem;
          delete tokenBalances[`${chainId}-${address}`];
        }
      });

      if (balanceItem.tokens.length > 1) {
        // All equivalent tokens should have same decimals, but we check just in case against the first token
        const totalBalance = balanceItem.tokens.reduce(
          (acc, { balance, token: equivalentToken }) =>
            acc + parseUnits(balance.toString(), firstAddedToken.decimals - equivalentToken.decimals) || 0n,
          0n
        );
        const totalBalanceUsd = balanceItem.tokens.reduce((acc, { balanceUsd }) => acc + (balanceUsd || 0), 0);

        balanceItem.balance = totalBalance;
        balanceItem.balanceUsd = totalBalanceUsd;
      } else {
        balanceItem.balance = balanceItem.tokens[0].balance;
        balanceItem.balanceUsd = balanceItem.tokens[0].balanceUsd;
      }
    });

    const mappedBalances = map(Object.entries(tokenBalances), ([key, value]) => ({
      ...value,
      key,
      relativeBalance:
        assetsTotalValue.wallet && value.balanceUsd ? (value.balanceUsd / assetsTotalValue.wallet) * 100 : 0,
      price:
        value.tokens.length > 1
          ? meanBy(
              value.tokens.filter((token) => !isUndefined(token.price)),
              'price'
            ) || undefined
          : value.tokens[0].price,
    })).filter((balance) => showSmallBalances || isUndefined(balance.balanceUsd) || balance.balanceUsd >= 1);

    return orderBy(mappedBalances, [(item) => isUndefined(item.balanceUsd), 'balanceUsd'], ['asc', 'desc']);
  }, [selectedWalletOption, allBalances, showSmallBalances]);

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
    await timeoutPromise(dispatch(fetchInitialBalances()).unwrap(), TimeoutPromises.COMMON, {
      description: ApiErrorKeys.BALANCES,
    });
    void timeoutPromise(dispatch(fetchPricesForAllChains()), TimeoutPromises.COMMON);

    trackEvent('Portfolio - User refreshed balances');
  }, [user?.wallets, sdkChains]);

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
      widgetId="Portfolio"
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
        context={intlContext}
      />
    </WidgetFrame>
  );
};

export default Portfolio;
