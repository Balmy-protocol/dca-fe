import React from 'react';
import { UserStatus } from '@types';
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
  WalletIcon,
  CircularProgressWithBrackground,
  RefreshIcon,
  Hidden,
  HiddenNumber,
  colors,
  AnimatedChevronRightIcon,
  VirtualizedTableContext,
  SPACING,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector/types';
import { parseUnits } from 'viem';
import useUser from '@hooks/useUser';
import styled from 'styled-components';
import Address from '@common/components/address';
import useNetWorth from '@hooks/useNetWorth';
import WidgetFrame from '../widget-frame';
import { useAppDispatch } from '@state/hooks';
import { fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import { IntervalSetActions, TimeoutPromises } from '@constants/timing';
import { ApiErrorKeys } from '@constants';
import { timeoutPromise } from '@balmy/sdk';
import { Duration } from 'luxon';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useIsLoggingUser from '@hooks/useIsLoggingUser';
import useAnalytics from '@hooks/useAnalytics';
import { useShowBalances } from '@state/config/hooks';
import TokenIconMultichain from '../token-icon-multichain';
import useAccountService from '@hooks/useAccountService';
import useMergedTokensBalances, { BalanceItem } from '@hooks/useMergedTokensBalances';
import { Link } from 'react-router-dom';
import usePushToHistory from '@hooks/usePushToHistory';
import { TOKEN_PROFILE_ROUTE } from '@constants/routes';
import { WalletActionType } from '@services/accountService';

const StyledNoWallet = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: ${spacing(6)};
  background-color: ${colors[mode].background.quartery};
  `}
`;

const StyledTableEnd = styled(TableCell).attrs({ size: 'small' })`
  overflow: hidden;
  ${({ theme: { spacing } }) => `
    padding: ${spacing(1)} 0px !important;
    width: ${spacing(12.5)};
  `}
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].accentPrimary};
  `}
`;

interface PortfolioProps {
  selectedWalletOption: WalletOptionValues;
}

interface Context extends VirtualizedTableContext {
  intl: ReturnType<typeof useIntl>;
  showBalances: boolean;
  hoveredRow?: number;
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
      <StyledTableEnd></StyledTableEnd>
    </>
  );
};

const PortfolioNotConnected = () => {
  const openConnectModal = useOpenConnectModal();

  return (
    <StyledNoWallet>
      <ContainerBox flexDirection="column" gap={2} alignItems="center">
        <Typography variant="h5Bold">💸️</Typography>
        <Typography variant="h5Bold">
          <FormattedMessage description="noWalletConnected" defaultMessage="No Wallet Connected" />
        </Typography>
        <Typography variant="bodyRegular" textAlign="center">
          <FormattedMessage
            description="noWalletConnectedParagraph"
            defaultMessage="Connect your wallet to view and manage your crypto portfolio"
          />
        </Typography>
      </ContainerBox>
      <Button variant="contained" size="large" onClick={() => openConnectModal(WalletActionType.connect)}>
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
                <StyledBodySmallRegularTypo2>
                  {showBalances ? relativeBalance.toFixed(0) : '-'}%
                </StyledBodySmallRegularTypo2>
              </ContainerBox>
            )}
          </TableCell>
        )}
        <StyledTableEnd>
          <StyledLink to={`/token/${firstAddedToken.chainId}-${firstAddedToken.address}`}>
            <AnimatedChevronRightIcon />
          </StyledLink>
        </StyledTableEnd>
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
      <StyledTableEnd></StyledTableEnd>
    </Hidden>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Context>();

const Portfolio = ({ selectedWalletOption }: PortfolioProps) => {
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const accountService = useAccountService();
  const dispatch = useAppDispatch();
  const user = useUser();
  const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(false);
  const isLoggingUser = useIsLoggingUser();
  const { trackEvent } = useAnalytics();
  const intl = useIntl();
  const showBalances = useShowBalances();
  const pushToHistory = usePushToHistory();
  const { mergedBalances, isLoadingAllBalances } = useMergedTokensBalances(selectedWalletOption);

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

  const onRowClick = React.useCallback(
    (rowIndex: number) => {
      const token = mergedBalances[rowIndex].tokens[0].token;
      pushToHistory(`/${TOKEN_PROFILE_ROUTE.key}/${token.chainId}-${token.address}`);
    },
    [mergedBalances, pushToHistory]
  );

  const tableContext = React.useMemo<Context>(
    () => ({
      intl,
      showBalances,
      onRowClick,
    }),
    [intl, showBalances, onRowClick]
  );

  const isLoading = isLoadingAllBalances || isLoggingUser;

  if (user?.status !== UserStatus.loggedIn && !isLoggingUser) {
    return <PortfolioNotConnected />;
  }

  return (
    <WidgetFrame
      isLoading={isLoading}
      assetValue={assetsTotalValue.wallet}
      Icon={WalletIcon}
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
        data={isLoading ? (SKELETON_ROWS as unknown as BalanceItem[]) : mergedBalances}
        VirtuosoTableComponents={VirtuosoTableComponents}
        header={PortfolioTableHeader}
        itemContent={isLoading ? PortfolioBodySkeleton : PortfolioBodyItem}
        context={tableContext}
        className="variant-portfolio"
      />
    </WidgetFrame>
  );
};

export default Portfolio;
