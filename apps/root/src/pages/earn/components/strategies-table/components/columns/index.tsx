import React from 'react';
import { FormattedMessage } from 'react-intl';
import { TableStrategy } from '../..';
import {
  ActiveTiersIcons,
  ContainerBox,
  HiddenProps,
  MovingStarIcon,
  Skeleton,
  StyledBodySmallRegularTypo2,
  Tooltip,
  Typography,
  colors,
} from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { emptyTokenWithAddress, emptyTokenWithLogoURI } from '@common/utils/currency';
import { getTokensWithBalanceAndApy, parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';
import styled from 'styled-components';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { Address as ViemAddress } from 'viem';
import Address from '@common/components/address';
import { useThemeMode } from '@state/config/hooks';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import TokenAmount from '@common/components/token-amount';
import { PROMOTED_STRATEGIES_IDS, STRATEGIES_WITH_LM_REWARDS } from '@constants/earn';
import { isNil } from 'lodash';
import { PLATFORM_NAMES_FOR_TOKENS } from '@constants/yield';
import NetWorthNumber from '@common/components/networth-number';

export enum StrategyColumnKeys {
  IS_PROMOTED = 'isPromoted',
  VAULT_NAME = 'vaultName',
  TOKEN = 'token',
  REWARDS = 'rewards',
  CHAIN_NAME = 'chainName',
  YIELD_TYPE = 'yieldType',
  TVL = 'tvl',
  APY = 'apy',
  GUARDIAN = 'guardian',
  WALLET = 'wallet',
  TOTAL_INVESTED = 'totalInvested',
  CURRENT_PROFIT = 'currentProfit',
  WALLET_BALANCE = 'walletBalance',
  PLATFORM = 'platform',
  PLATFORM_USER_BALANCE = 'platformUserBalance',
  SINGLE_WALLET = 'singleWallet',
  MIGRATE = 'migrate',
  NEEDS_TIER = 'needsTier',
  PROTOCOL = 'protocol',
}

const StyledWalletsPlusIndicator = styled(ContainerBox)`
  position: absolute;
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(1)};
    right: -${spacing(2.5)};
    border-radius: 50%;
    border: 1px solid ${colors[palette.mode].border.border2};
    background: ${colors[palette.mode].background.tertiary};
  `}
`;

const StyledBoxedLabel = styled(ContainerBox).attrs({ alignItems: 'center', gap: 2, flex: 1 })`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(1)} ${spacing(3)};
  border-radius: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border2};
  background: ${colors[palette.mode].background.tertiary};
  `}
`;

const StyledTitleContainer = styled(ContainerBox).attrs({ alignItems: 'center', gap: 1 })`
  max-width: 26ch;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledBoxedOwners = ({ owners }: { owners: ViemAddress[] }) => {
  const mode = useThemeMode();

  return owners.length > 2 ? (
    <Tooltip
      title={
        <ContainerBox flexDirection="column" gap={0.5}>
          {owners.map((owner) => (
            <Typography key={owner} variant="bodySmallRegular">
              <Address address={owner} trimAddress />
            </Typography>
          ))}
        </ContainerBox>
      }
    >
      <ContainerBox flexDirection="column" gap={0.5} style={{ position: 'relative' }} justifyContent="center">
        {owners.slice(0, 2).map((owner) => (
          <StyledBoxedLabel key={owner}>
            <StyledBodySmallRegularTypo2>
              <Address address={owner} trimAddress trimSize={3} />
            </StyledBodySmallRegularTypo2>
          </StyledBoxedLabel>
        ))}
        <StyledWalletsPlusIndicator>
          <Typography variant="bodyExtraSmallBold" color={colors[mode].typography.typo3}>
            +{owners.length - 2}
          </Typography>
        </StyledWalletsPlusIndicator>
      </ContainerBox>
    </Tooltip>
  ) : (
    owners.map((owner) => (
      <StyledBoxedLabel key={owner}>
        <StyledBodySmallRegularTypo2>
          <Address address={owner} trimAddress trimSize={3} />
        </StyledBodySmallRegularTypo2>
      </StyledBoxedLabel>
    ))
  );
};

export interface StrategyColumnConfig<T extends StrategiesTableVariants> {
  key: StrategyColumnKeys;
  label: React.ReactNode;
  renderCell: (data: TableStrategy<T>, showBalances: boolean, tierLevel?: number) => React.ReactNode | string;
  getOrderValue?: (data: TableStrategy<T>) => string | number | undefined;
  customSkeleton?: React.ReactNode;
  hiddenProps?: HiddenProps;
}

const StyledCurrentTierFarmName = styled(StyledBodySmallRegularTypo2)`
  ${({ theme: { palette } }) => `
    background: ${palette.gradient.tierLevel};
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

interface StyledTierBadgeProps {
  CurrentTierBadge: React.ElementType;
}

const StyledTierBadge = styled(({ CurrentTierBadge, ...props }: StyledTierBadgeProps) => (
  <CurrentTierBadge {...props} size="1.25rem" />
))``;

const StyledMoreRewardsBadge = styled(ContainerBox).attrs({ alignItems: 'center', gap: 1 })`
  ${({ theme: { spacing, palette } }) => `
    padding: ${spacing(1)} ${spacing(1)};
    border-radius: ${spacing(2)};
    background-color: ${colors[palette.mode].background.tertiary};
    border: 1px solid ${colors[palette.mode].semantic.success.darker};
  `}
`;

export const MoreRewardsBadge = () => {
  return (
    <StyledMoreRewardsBadge>
      <MovingStarIcon sx={({ palette }) => ({ color: colors[palette.mode].semantic.success.darker })} />
      <Typography variant="bodyExtraSmallBold" color={({ palette }) => colors[palette.mode].semantic.success.darker}>
        <FormattedMessage description="earn.all-strategies-table.column.more-rewards" defaultMessage="Higher rewards" />
      </Typography>
    </StyledMoreRewardsBadge>
  );
};

export const strategyColumnConfigs: StrategyColumnConfig<StrategiesTableVariants.ALL_STRATEGIES>[] = [
  {
    key: StrategyColumnKeys.VAULT_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.vault-name" defaultMessage="Vault" />,
    renderCell: (data) => (
      <Tooltip title={data.farm.name}>
        <StyledTitleContainer>
          {!isNil(data.tierLevel) && !isNil(data.needsTier) && data.needsTier === data.tierLevel ? (
            <>
              <StyledCurrentTierFarmName>{data.farm.name}</StyledCurrentTierFarmName>
              <StyledTierBadge CurrentTierBadge={ActiveTiersIcons[data.tierLevel]} />
            </>
          ) : (
            <StyledBodySmallRegularTypo2>{data.farm.name}</StyledBodySmallRegularTypo2>
          )}
        </StyledTitleContainer>
      </Tooltip>
    ),
    getOrderValue: (data) => data.farm.name,
  },
  {
    key: StrategyColumnKeys.TOKEN,
    label: <FormattedMessage description="earn.all-strategies-table.column.token" defaultMessage="Token" />,
    renderCell: (data) => (
      <ContainerBox gap={2} alignItems="center">
        <TokenIcon token={data.asset} size={4.5} />
        <StyledBodySmallRegularTypo2>{data.asset.symbol}</StyledBodySmallRegularTypo2>
      </ContainerBox>
    ),
    customSkeleton: (
      <ContainerBox gap={2} alignItems="center">
        <Skeleton variant="circular" width={28} height={28} animation="wave" />
        <StyledBodySmallRegularTypo2>
          <Skeleton variant="text" animation="wave" width="6ch" />
        </StyledBodySmallRegularTypo2>
      </ContainerBox>
    ),
  },
  {
    key: StrategyColumnKeys.PROTOCOL,
    label: <FormattedMessage description="earn.all-strategies-table.column.protocol" defaultMessage="Protocol" />,
    renderCell: (data) => (
      <ContainerBox>
        <StyledBoxedLabel>
          <TokenIcon token={emptyTokenWithAddress(PLATFORM_NAMES_FOR_TOKENS[data.farm.protocol])} size={4.5} />
          <StyledBodySmallRegularTypo2>{data.farm.protocol}</StyledBodySmallRegularTypo2>
        </StyledBoxedLabel>
      </ContainerBox>
    ),
    getOrderValue: (data) => data.farm.protocol,
  },
  {
    key: StrategyColumnKeys.WALLET_BALANCE,
    label: (
      <FormattedMessage
        description="earn.all-strategies-table.column.deposit-balance"
        defaultMessage="Wallet Balance"
      />
    ),
    renderCell: () => <></>,
    getOrderValue: (data) => (data.walletBalance ? data.walletBalance.amountInUSD || '0' : undefined),
    hiddenProps: {
      xsUp: true,
    },
  },
  {
    key: StrategyColumnKeys.IS_PROMOTED,
    label: <></>,
    renderCell: () => <></>,
    getOrderValue: (data) => (PROMOTED_STRATEGIES_IDS.includes(data.id) ? 1 : 0),
    hiddenProps: {
      xsUp: true,
    },
  },
  {
    key: StrategyColumnKeys.NEEDS_TIER,
    label: <></>,
    renderCell: () => <></>,
    getOrderValue: (data) => data.needsTier ?? 0,
    hiddenProps: {
      xsUp: true,
    },
  },
  {
    key: StrategyColumnKeys.REWARDS,
    label: <FormattedMessage description="earn.all-strategies-table.column.rewards" defaultMessage="Rewards" />,
    renderCell: (data) => (
      <ContainerBox gap={2} alignItems="center">
        <ComposedTokenIcon tokens={data.displayRewards.tokens} size={4.5} />
        {/* Only tier 2 and above have more rewards */}
        {STRATEGIES_WITH_LM_REWARDS.includes(data.id) && <MoreRewardsBadge />}
      </ContainerBox>
    ),
  },
  {
    key: StrategyColumnKeys.CHAIN_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.chain" defaultMessage="Network" />,
    renderCell: (data) => data.network.name,
    getOrderValue: (data) => data.network.name,
  },
  // {
  //   key: StrategyColumnKeys.TVL,
  //   label: <FormattedMessage description="earn.all-strategies-table.column.tvl" defaultMessage="TVL" />,
  //   renderCell: (data) => `$${usdFormatter(data.farm.tvl)}`,
  //   getOrderValue: (data) => data.farm.tvl,
  // },
  {
    key: StrategyColumnKeys.APY,
    label: <FormattedMessage description="earn.all-strategies-table.column.apy" defaultMessage="APY" />,
    renderCell: (data) => `${(data.farm.apy + (data.farm.rewards?.apy ?? 0)).toFixed(2)}%`,
    getOrderValue: (data) => data.farm.apy + (data.farm.rewards?.apy ?? 0),
  },
  {
    key: StrategyColumnKeys.GUARDIAN,
    label: <FormattedMessage description="earn.all-strategies-table.column.guardian" defaultMessage="Guardian" />,
    renderCell: (data) =>
      data.guardian ? (
        <ContainerBox gap={2} alignItems="center">
          <TokenIcon token={emptyTokenWithLogoURI(data.guardian.logo || '')} size={4.5} />
          <StyledBodySmallRegularTypo2>{data.guardian.name}</StyledBodySmallRegularTypo2>
        </ContainerBox>
      ) : (
        <StyledBodySmallRegularTypo2>-</StyledBodySmallRegularTypo2>
      ),
    getOrderValue: (data) => data.guardian?.name || '',
  },
];

const StyledRewardsPill = styled(ContainerBox).attrs({ alignItems: 'center', gap: 1 })`
  ${({ theme: { spacing, palette } }) => `
    padding: ${spacing(1)} ${spacing(2)};
    border-radius: ${spacing(4)};
    background-color: ${colors[palette.mode].background.tertiary};
    border: 1px solid ${colors[palette.mode].semantic.success.darker};
  `}
`;

export const portfolioColumnConfigs: StrategyColumnConfig<StrategiesTableVariants.USER_STRATEGIES>[] = [
  {
    key: StrategyColumnKeys.VAULT_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.vault-name" defaultMessage="Vault" />,
    renderCell: (data, showBalances, tierLevel) => (
      <Tooltip title={data[0].strategy.farm.name}>
        <StyledTitleContainer>
          {!isNil(tierLevel) && !isNil(data[0].strategy.needsTier) && data[0].strategy.needsTier === tierLevel ? (
            <>
              <StyledCurrentTierFarmName>{data[0].strategy.farm.name}</StyledCurrentTierFarmName>
              <StyledTierBadge CurrentTierBadge={ActiveTiersIcons[tierLevel]} />
            </>
          ) : (
            <StyledBodySmallRegularTypo2>{data[0].strategy.farm.name}</StyledBodySmallRegularTypo2>
          )}
        </StyledTitleContainer>
      </Tooltip>
    ),
    getOrderValue: (data) => data[0].strategy.farm.name,
  },
  {
    // Token column for smaller screens
    key: StrategyColumnKeys.TOKEN,
    label: <FormattedMessage description="earn.all-strategies-table.column.token" defaultMessage="Token" />,
    renderCell: (data) => (
      <ContainerBox>
        <TokenIconWithNetwork token={data[0].strategy.asset} />
      </ContainerBox>
    ),
    customSkeleton: (
      <ContainerBox gap={2} alignItems="center">
        <Skeleton variant="circular" width={28} height={28} animation="wave" />
      </ContainerBox>
    ),
    hiddenProps: {
      lgUp: true,
    },
  },
  {
    // Token column for larger screens
    key: StrategyColumnKeys.TOKEN,
    label: <FormattedMessage description="earn.all-strategies-table.column.token" defaultMessage="Token" />,
    renderCell: (data) => (
      <ContainerBox gap={2} alignItems="center">
        <TokenIcon token={data[0].strategy.asset} size={4.5} />
        <StyledBodySmallRegularTypo2>{data[0].strategy.asset.symbol}</StyledBodySmallRegularTypo2>
      </ContainerBox>
    ),
    customSkeleton: (
      <ContainerBox gap={2} alignItems="center">
        <Skeleton variant="circular" width={28} height={28} animation="wave" />
        <StyledBodySmallRegularTypo2>
          <Skeleton variant="text" animation="wave" width="6ch" />
        </StyledBodySmallRegularTypo2>
      </ContainerBox>
    ),
    hiddenProps: {
      lgDown: true,
    },
  },
  {
    key: StrategyColumnKeys.REWARDS,
    label: <FormattedMessage description="earn.all-strategies-table.column.rewards" defaultMessage="Rewards" />,
    renderCell: (data) => {
      const rewardTokensData = React.useMemo(() => getTokensWithBalanceAndApy(data[0].strategy, data), [data]);
      // If the user either has balances or there are reward tokens show the rewards pill
      return rewardTokensData.tokens.length > 0 ? (
        <ContainerBox gap={2} flexWrap="wrap" alignItems="flex-start">
          <StyledRewardsPill>
            <ContainerBox alignItems="center">
              <ComposedTokenIcon tokens={rewardTokensData.tokens} size={4.5} />
            </ContainerBox>
            <NetWorthNumber
              value={rewardTokensData.totalRewardsTvl}
              variant="bodyExtraSmall"
              colorVariant="typo2"
              size="small"
              isFiat
              fontWeight={500}
            />
          </StyledRewardsPill>
        </ContainerBox>
      ) : (
        <></>
      );
    },
    hiddenProps: {
      lgDown: true,
    },
  },
  {
    key: StrategyColumnKeys.CHAIN_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.chain" defaultMessage="Network" />,
    renderCell: (data) => data[0].strategy.network.name,
    getOrderValue: (data) => data[0].strategy.network.name,
    hiddenProps: {
      lgDown: true,
    },
  },
  {
    key: StrategyColumnKeys.APY,
    label: <FormattedMessage description="earn.all-strategies-table.column.apy" defaultMessage="APY" />,
    renderCell: (data) => `${(data[0].strategy.farm.apy + (data[0].strategy.farm.rewards?.apy ?? 0)).toFixed(2)}%`,
    getOrderValue: (data) => data[0].strategy.farm.apy + (data[0].strategy.farm.rewards?.apy ?? 0),
  },
  {
    key: StrategyColumnKeys.WALLET,
    label: <FormattedMessage description="earn.all-strategies-table.column.wallet" defaultMessage="Wallet" />,
    renderCell: (data) => <StyledBoxedOwners owners={data.map((position) => position.owner)} />,
  },
  {
    key: StrategyColumnKeys.TOTAL_INVESTED,
    label: (
      <FormattedMessage description="earn.all-strategies-table.column.total-invested" defaultMessage="Total Invested" />
    ),
    renderCell: (data) => (
      <TokenAmount
        token={data[0].strategy.asset}
        amount={parseUserStrategiesFinancialData(data).totalInvested[data[0].strategy.asset.address]}
        showIcon={false}
        amountTypographyVariant="bodySmallRegular"
        usdPriceTypographyVariant="labelRegular"
        gap={0.5}
      />
    ),
    getOrderValue: (data) => parseUserStrategiesFinancialData(data).totalInvestedUsd,
  },
  {
    key: StrategyColumnKeys.CURRENT_PROFIT,
    label: <FormattedMessage description="earn.all-strategies-table.column.current-profit" defaultMessage="Earnings" />,
    renderCell: (data) => (
      <TokenAmount
        token={data[0].strategy.asset}
        amount={parseUserStrategiesFinancialData(data).currentProfit[data[0].strategy.asset.address]}
        showIcon={false}
        amountTypographyVariant="bodySmallRegular"
        usdPriceTypographyVariant="labelRegular"
        gap={0.5}
        amountColorVariant="success.dark"
        subtitleColorVariant="success.dark"
      />
    ),
    getOrderValue: (data) => parseUserStrategiesFinancialData(data).currentProfitUsd.asset,
  },
];

export const migrationOptionsColumnConfigs: StrategyColumnConfig<StrategiesTableVariants.MIGRATION_OPTIONS>[] = [
  {
    key: StrategyColumnKeys.VAULT_NAME,
    label: <FormattedMessage description="earn.one-click-migration-modal.column.vault-name" defaultMessage="Vault" />,
    renderCell: (data) => (
      <Tooltip title={data.farm.name}>
        <StyledTitleContainer>
          <StyledBodySmallRegularTypo2>{data.farm.name}</StyledBodySmallRegularTypo2>
        </StyledTitleContainer>
      </Tooltip>
    ),
    getOrderValue: (data) => data.farm.name,
  },
  {
    key: StrategyColumnKeys.PLATFORM_USER_BALANCE,
    label: <FormattedMessage description="earn.one-click-migration-modal.column.token" defaultMessage="Amount" />,
    renderCell: (data) => (
      <TokenAmount
        token={data.underlying || data.token}
        amount={data.underlyingAmount || data.balance}
        showIcon={false}
        amountTypographyVariant="bodySmallRegular"
        usdPriceTypographyVariant="labelRegular"
        gap={0.5}
      />
    ),
    getOrderValue: (data) => Number(data.underlyingAmount.amountInUSD) || Number(data.balance.amountInUSD),
  },
  {
    key: StrategyColumnKeys.SINGLE_WALLET,
    label: <FormattedMessage description="earn.one-click-migration-modal.column.wallet" defaultMessage="Wallet" />,
    renderCell: (data) => <StyledBoxedOwners owners={[data.wallet]} />,
  },
  // {
  //   key: StrategyColumnKeys.MIGRATE,
  //   label: null,
  //   renderCell: (data) => (
  //     <Typography variant="linkRegular" color={({ palette: { mode } }) => colors[mode].accent.primary}>
  //       {data.strategies.length === 1 ? (
  //         <FormattedMessage
  //           description="earn.one-click-migration-modal.column.migrate-single"
  //           defaultMessage="Continue in vault"
  //         />
  //       ) : (
  //         <FormattedMessage
  //           description="earn.one-click-migration-modal.column.migrate-multiple"
  //           defaultMessage="Select guardian"
  //         />
  //       )}
  //     </Typography>
  //   ),
  // },
];
