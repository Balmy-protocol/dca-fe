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
  HiddenNumber,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  formatCurrencyAmount,
  formatUsdAmount,
  getIsSameOrTokenEquivalent,
  parseExponentialNumberToString,
} from '@common/utils/currency';
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
import { useAppDispatch } from '@state/hooks';
import { fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import { IntervalSetActions, TimeoutPromises } from '@constants/timing';
import { ApiErrorKeys } from '@constants';
import { timeoutPromise } from '@balmy/sdk';
import { Duration } from 'luxon';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useIsLoggingUser from '@hooks/useIsLoggingUser';
import useTrackEvent from '@hooks/useTrackEvent';
import { useShowSmallBalances, useShowBalances } from '@state/config/hooks';
import TokenIconMultichain from '../token-icon-multichain';
import useAccountService from '@hooks/useAccountService';

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

export type BalanceToken = {
  balance: bigint;
  balanceUsd?: number;
  price?: number;
  token: Token;
  isLoadingPrice: boolean;
};

type BalanceItem = {
  totalBalanceInUnits: string;
  totalBalanceUsd?: number;
  price?: number;
  tokens: BalanceToken[];
  isLoadingPrice: boolean;
  relativeBalance: number;
};
interface PortfolioProps {
  selectedWalletOption: WalletOptionValues;
}

interface Context {
  intl: ReturnType<typeof useIntl>;
  showBalances: boolean;
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
      <Button variant="contained" size="large" onClick={() => openConnectModal()} fullWidth>
        <FormattedMessage description="connectYourWallet" defaultMessage="Connect your wallet" />
      </Button>
    </StyledNoWallet>
  );
};
const PortfolioBodyItem: ItemContent<BalanceItem, Context> = (
  index: number,
  { totalBalanceInUnits, tokens, isLoadingPrice, price, totalBalanceUsd, relativeBalance }: BalanceItem,
  { intl, showBalances }
) => {
  const firstAddedToken = tokens[0].token;
  return (
    <>
      <TableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          {tokens.length > 1 ? (
            <TokenIconMultichain balanceTokens={tokens} />
          ) : (
            <TokenIconWithNetwork token={firstAddedToken} />
          )}
          <ContainerBox flexDirection="column" flex="1" style={{ overflow: 'hidden' }}>
            <StyledBodySmallBoldTypo2>{firstAddedToken.symbol}</StyledBodySmallBoldTypo2>
            <StyledBodySmallRegularTypo3>{firstAddedToken.name}</StyledBodySmallRegularTypo3>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <ContainerBox flexDirection="column">
          <StyledBodySmallRegularTypo2>
            {showBalances ? (
              formatCurrencyAmount({
                amount: parseUnits(totalBalanceInUnits, firstAddedToken.decimals),
                token: firstAddedToken,
                sigFigs: 3,
                intl,
              })
            ) : (
              <HiddenNumber size="small" />
            )}
          </StyledBodySmallRegularTypo2>
          <StyledBodySmallRegularTypo3>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              !!showBalances && `$${formatUsdAmount({ amount: totalBalanceUsd, intl })}`
            )}
          </StyledBodySmallRegularTypo3>
        </ContainerBox>
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : showBalances ? (
              `$${formatUsdAmount({ amount: price, intl })}`
            ) : (
              <HiddenNumber size="small" />
            )}
          </StyledBodySmallRegularTypo2>
        </TableCell>
        {relativeBalance !== 0 && (
          <TableCell>
            {isLoadingPrice || !price ? (
              <Skeleton variant="text" animation="wave" sx={{ minWidth: '5ch' }} />
            ) : (
              <ContainerBox alignItems="center" gap={3}>
                <CircularProgressWithBrackground
                  thickness={8}
                  size={SPACING(6)}
                  value={showBalances ? relativeBalance : 0}
                />
                <StyledBodySmallLabelTypography>
                  {showBalances ? relativeBalance.toFixed(0) : '-'}%
                </StyledBodySmallLabelTypography>
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
  const accountService = useAccountService();
  const dispatch = useAppDispatch();
  const user = useUser();
  const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(false);
  const isLoggingUser = useIsLoggingUser();
  const trackEvent = useTrackEvent();
  const intl = useIntl();
  const showBalances = useShowBalances();
  const intlContext = React.useMemo(() => ({ intl, showBalances }), [intl, showBalances]);
  const showSmallBalances = useShowSmallBalances();

  const portfolioBalances = React.useMemo<BalanceItem[]>(() => {
    const balanceTokens = Object.values(allBalances).reduce<Record<string, BalanceToken>>(
      (acc, { balancesAndPrices, isLoadingChainPrices }) => {
        Object.entries(balancesAndPrices).forEach(([tokenAddress, tokenInfo]) => {
          const tokenKey = `${tokenInfo.token.chainId}-${tokenAddress}`;
          // eslint-disable-next-line no-param-reassign
          acc[tokenKey] = {
            balance: 0n,
            token: tokenInfo.token,
            balanceUsd: 0,
            price: tokenInfo.price,
            isLoadingPrice: isLoadingChainPrices,
          };

          Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
            const tokenBalance = acc[tokenKey].balance + balance;

            if (selectedWalletOption === ALL_WALLETS) {
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey].balance = tokenBalance;
            } else if (selectedWalletOption === walletAddress) {
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey].balance = tokenBalance;
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

    // Merge multi-chain tokens
    const multiChainTokenBalances = Object.values(balanceTokens).reduce<BalanceItem[]>((acc, balanceToken) => {
      const equivalentTokenIndex = acc.findIndex((item) =>
        item.tokens.some((itemToken) => getIsSameOrTokenEquivalent(itemToken.token, balanceToken.token))
      );

      if (equivalentTokenIndex === -1) {
        // Unique token
        acc.push({
          totalBalanceInUnits: '0',
          totalBalanceUsd: 0,
          tokens: [balanceToken],
          isLoadingPrice: balanceToken.isLoadingPrice,
          relativeBalance: 0,
        });
      } else {
        // Equivalent token
        acc[equivalentTokenIndex].tokens.push(balanceToken);
        // eslint-disable-next-line no-param-reassign
        acc[equivalentTokenIndex].isLoadingPrice =
          acc[equivalentTokenIndex].isLoadingPrice || balanceToken.isLoadingPrice;
      }

      return acc;
    }, []);

    // Calculate totals
    const multiChainTokenBalancesWithTotal = multiChainTokenBalances.map((balanceItem) => {
      const totalBalanceInUnits = balanceItem.tokens.reduce((acc, { balance, token }) => {
        return acc + Number(formatUnits(balance, token.decimals));
      }, 0);
      const totalBalanceUsd = balanceItem.tokens.reduce((acc, { balanceUsd }) => acc + (balanceUsd || 0), 0);
      const totalBalanceInUnitsFormatted = parseExponentialNumberToString(totalBalanceInUnits);

      return { ...balanceItem, totalBalanceInUnits: totalBalanceInUnitsFormatted, totalBalanceUsd };
    });

    const mappedBalances = map(multiChainTokenBalancesWithTotal, (value, index) => ({
      ...value,
      key: index,
      relativeBalance:
        assetsTotalValue.wallet && value.totalBalanceUsd ? (value.totalBalanceUsd / assetsTotalValue.wallet) * 100 : 0,
      price:
        meanBy(
          value.tokens.filter((token) => !isUndefined(token.price)),
          'price'
        ) || undefined,
    })).filter((balance) => showSmallBalances || isUndefined(balance.totalBalanceUsd) || balance.totalBalanceUsd >= 1);

    return orderBy(mappedBalances, [(item) => isUndefined(item.totalBalanceUsd), 'totalBalanceUsd'], ['asc', 'desc']);
  }, [selectedWalletOption, allBalances, showSmallBalances]);

  const onRefreshBalance = React.useCallback(async () => {
    setIsRefreshDisabled(true);
    setTimeout(() => setIsRefreshDisabled(false), IntervalSetActions.globalBalance);
    await accountService.invalidateAccountBalances();
    await timeoutPromise(dispatch(fetchInitialBalances()).unwrap(), TimeoutPromises.COMMON, {
      description: ApiErrorKeys.BALANCES,
    });
    void timeoutPromise(dispatch(fetchPricesForAllChains()), TimeoutPromises.COMMON);

    trackEvent('Portfolio - User refreshed balances');
  }, [accountService]);

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
