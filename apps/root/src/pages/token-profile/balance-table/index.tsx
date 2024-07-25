import React from 'react';
import { Address as ViemAddress, Token, UserStatus } from '@types';
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
  Hidden,
  HiddenNumber,
  colors,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  formatCurrencyAmount,
  formatUsdAmount,
  getIsSameOrTokenEquivalent,
  parseExponentialNumberToString,
  toToken,
} from '@common/utils/currency';
import { isUndefined, map, orderBy } from 'lodash';
import { useAllBalances } from '@state/balances/hooks';
import { formatUnits, parseUnits } from 'viem';
import useUser from '@hooks/useUser';
import styled from 'styled-components';
import Address from '@common/components/address';
import useNetWorth from '@hooks/useNetWorth';
import { SPACING } from 'ui-library/src/theme/constants';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useIsLoggingUser from '@hooks/useIsLoggingUser';
import { useShowSmallBalances, useShowBalances } from '@state/config/hooks';
import WidgetFrame from '@pages/home/components/widget-frame';
import { getAllChains } from '@balmy/sdk';
import TokenIcon from '@common/components/token-icon';
import { getGhTokenListLogoUrl } from '@constants';

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

type BalanceItem = {
  balance: bigint;
  balanceUsd?: number;
  balanceInUnits: string;
  price?: number;
  token: Token;
  isLoadingPrice: boolean;
  walletAddress: ViemAddress;
  relativeBalance: number;
};

interface BalanceTableProps {
  token: Token;
}

interface Context {
  intl: ReturnType<typeof useIntl>;
  showBalances: boolean;
}

const SKELETON_ROWS = Array.from(Array(5).keys());
const BalanceTableBodySkeleton: ItemContent<BalanceItem, Context> = () => {
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
          <Skeleton variant="text" animation="wave" sx={{ minWidth: '5ch' }} />
        </StyledBodySmallRegularTypo2>
      </TableCell>
    </>
  );
};

const BalanceTableNotConnected = () => {
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
            defaultMessage="Connect your wallet to view and manage your crypto BalanceTable"
          />
        </Typography>
      </ContainerBox>
      <Button variant="contained" size="large" onClick={() => openConnectModal()} fullWidth>
        <FormattedMessage description="connectYourWallet" defaultMessage="Connect your wallet" />
      </Button>
    </StyledNoWallet>
  );
};

const StyledNetworkLogoContainer = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  width: 16px;
  height: 16px;
`;

const StyledAssetLogosContainer = styled.div`
  position: relative;
  display: flex;
`;

const StyledWalletIconContainer = styled.div<{ $size: number }>`
  ${({
    $size,
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
  width: ${spacing($size)};
  height: ${spacing($size)};
  background-color: ${colors[mode].background.tertiary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  `};
`;

const BalanceTableBodyItem: ItemContent<BalanceItem, Context> = (
  index: number,
  { balanceInUnits, balanceUsd, walletAddress, token, isLoadingPrice, price, relativeBalance }: BalanceItem,
  { intl, showBalances }
) => {
  const network = getAllChains().find((chain) => chain.chainId === token.chainId);

  return (
    <>
      <TableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          <StyledAssetLogosContainer>
            <StyledWalletIconContainer $size={8}>
              <EmptyWalletIcon size={SPACING(4)} />
            </StyledWalletIconContainer>
            <StyledNetworkLogoContainer>
              <TokenIcon
                size={3.5}
                token={toToken({
                  logoURI: getGhTokenListLogoUrl(token.chainId, 'logo'),
                })}
              />
            </StyledNetworkLogoContainer>
          </StyledAssetLogosContainer>
          <ContainerBox flexDirection="column" flex="1" style={{ overflow: 'hidden' }}>
            <StyledBodySmallBoldTypo2>
              <Address address={walletAddress} trimAddress />
            </StyledBodySmallBoldTypo2>
            <StyledBodySmallRegularTypo3>{network?.name}</StyledBodySmallRegularTypo3>
          </ContainerBox>
        </Grid>
      </TableCell>
      <TableCell>
        <ContainerBox flexDirection="column">
          <StyledBodySmallRegularTypo2>
            {showBalances ? (
              `${formatCurrencyAmount({
                amount: parseUnits(balanceInUnits, token.decimals),
                token,
                sigFigs: 3,
                intl,
              })} ${token.symbol}`
            ) : (
              <HiddenNumber size="small" />
            )}
          </StyledBodySmallRegularTypo2>
          <StyledBodySmallRegularTypo3>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              !!showBalances && `$${formatUsdAmount({ amount: balanceUsd, intl })}`
            )}
          </StyledBodySmallRegularTypo3>
        </ContainerBox>
      </TableCell>
      <Hidden mdDown>
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

const BalanceTableTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="token-profile.balance.asset" defaultMessage="Asset" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="token-profile.balance.balance" defaultMessage="Balance" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <Hidden mdDown>
      <TableCell>
        <StyledBodySmallLabelTypography>
          <FormattedMessage description="token-profile.balance.percentage" defaultMessage="%" />
        </StyledBodySmallLabelTypography>
      </TableCell>
    </Hidden>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Context>();

const BalanceTable = ({ token }: BalanceTableProps) => {
  const { isLoadingAllBalances, balances: allBalances } = useAllBalances();
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: 'allWallets', tokens: token && [token] });
  const user = useUser();
  const isLoggingUser = useIsLoggingUser();
  const intl = useIntl();
  const showBalances = useShowBalances();
  const intlContext = React.useMemo(() => ({ intl, showBalances }), [intl, showBalances]);
  const showSmallBalances = useShowSmallBalances();

  const BalanceTableBalances = React.useMemo<BalanceItem[]>(() => {
    const balanceTokens = Object.values(allBalances).reduce<Record<string, BalanceItem>>(
      (acc, { balancesAndPrices, isLoadingChainPrices }) => {
        Object.entries(balancesAndPrices)
          .filter(([, tokenInfo]) => getIsSameOrTokenEquivalent(token, tokenInfo.token))
          .forEach(([tokenAddress, tokenInfo]) => {
            Object.entries(tokenInfo.balances).forEach(([walletAddress, balance]) => {
              if (!balance) {
                return;
              }
              const tokenKey = `${tokenInfo.token.chainId}-${tokenAddress}-${walletAddress}`;
              const parsedBalance = parseFloat(formatUnits(balance, tokenInfo.token.decimals));
              // eslint-disable-next-line no-param-reassign
              acc[tokenKey] = {
                walletAddress: walletAddress as ViemAddress,
                balanceInUnits: parseExponentialNumberToString(parsedBalance),
                balance: balance,
                token: tokenInfo.token,
                balanceUsd: tokenInfo.price ? parsedBalance * tokenInfo.price : undefined,
                price: tokenInfo.price,
                isLoadingPrice: isLoadingChainPrices,
                relativeBalance: 0,
              };
            });
          });
        return acc;
      },
      {}
    );

    const mappedBalances = map(balanceTokens, (value) => ({
      ...value,
      key: `${value.token.chainId}-${value.token.address}-${value.walletAddress}`,
      relativeBalance:
        assetsTotalValue.wallet && value.balanceUsd ? (value.balanceUsd / assetsTotalValue.wallet) * 100 : 0,
    })).filter((balance) => showSmallBalances || isUndefined(balance.balanceUsd) || balance.balanceUsd >= 1);

    return orderBy(mappedBalances, [(item) => isUndefined(item.balanceUsd), 'balanceUsd'], ['asc', 'desc']);
  }, [allBalances, showSmallBalances]);

  if (user?.status !== UserStatus.loggedIn && !isLoggingUser) {
    return <BalanceTableNotConnected />;
  }

  const isLoading = isLoadingAllBalances || isLoggingUser;

  return (
    <WidgetFrame
      isLoading={isLoading}
      assetValue={assetsTotalValue.wallet}
      Icon={EmptyWalletIcon}
      totalValue={totalAssetValue}
      showPercentage
      widgetId="BalanceTable"
      title={<FormattedMessage defaultMessage="All wallets" description="allWallets" />}
    >
      <VirtualizedTable
        data={isLoading ? (SKELETON_ROWS as unknown as BalanceItem[]) : BalanceTableBalances}
        VirtuosoTableComponents={VirtuosoTableComponents}
        header={BalanceTableTableHeader}
        itemContent={isLoading ? BalanceTableBodySkeleton : BalanceTableBodyItem}
        separateRows={false}
        context={intlContext}
      />
    </WidgetFrame>
  );
};

export default BalanceTable;
