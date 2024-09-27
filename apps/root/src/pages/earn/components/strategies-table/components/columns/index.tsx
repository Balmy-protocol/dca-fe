import React from 'react';
import { FormattedMessage } from 'react-intl';
import { TableStrategy } from '../..';
import { ContainerBox, Skeleton, StyledBodySmallRegularTypo2, Tooltip, Typography, colors } from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { usdFormatter } from '@common/utils/parsing';
import { emptyTokenWithLogoURI } from '@common/utils/currency';
import { getStrategySafetyIcon, parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';
import styled, { useTheme } from 'styled-components';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { Address as ViemAddress } from 'viem';
import Address from '@common/components/address';
import { useThemeMode } from '@state/config/hooks';
import { StrategyRiskLevel } from 'common-types';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';

export enum StrategyColumnKeys {
  VAULT_NAME = 'vaultName',
  TOKEN = 'token',
  REWARDS = 'rewards',
  CHAIN_NAME = 'chainName',
  YIELD_TYPE = 'yieldType',
  TVL = 'tvl',
  APY = 'apy',
  GUARDIAN = 'guardian',
  SAFETY = 'safety',
  WALLET = 'wallet',
  TOTAL_INVESTED = 'totalInvested',
  CURRENT_PROFIT = 'currentProfit',
  WALLET_BALANCE = 'walletBalance',
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

const StyledBoxedLabel = styled.div`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(1)} ${spacing(3)};
  border-radius: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border2};
  background: ${colors[palette.mode].background.tertiary};
  `}
`;

const StyledBoxedOwners = ({ owners }: { owners: ViemAddress[] }) => {
  const mode = useThemeMode();

  return owners.length >= 2 ? (
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
          <Typography variant="bodyExtraSmallBold" color={colors[mode].typography.typo2}>
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
  renderCell: (data: TableStrategy<T>) => React.ReactNode | string;
  getOrderValue?: (data: TableStrategy<T>) => string | number | undefined;
  customSkeleton?: React.ReactNode;
  hidden?: (theme: ReturnType<typeof useTheme>) => boolean;
}

export const strategyColumnConfigs: StrategyColumnConfig<StrategiesTableVariants.ALL_STRATEGIES>[] = [
  {
    key: StrategyColumnKeys.VAULT_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.vault-name" defaultMessage="Vault name" />,
    renderCell: (data) => data.farm.name,
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
    key: StrategyColumnKeys.WALLET_BALANCE,
    label: (
      <FormattedMessage
        description="earn.all-strategies-table.column.deposit-balance"
        defaultMessage="Wallet Balance"
      />
    ),
    renderCell: () => <></>,
    getOrderValue: (data) => (data.walletBalance ? data.walletBalance.amountInUSD || '0' : undefined),
    hidden: () => true,
  },
  {
    key: StrategyColumnKeys.REWARDS,
    label: <FormattedMessage description="earn.all-strategies-table.column.rewards" defaultMessage="Rewards" />,
    renderCell: (data) => <ComposedTokenIcon tokens={data.rewards.tokens} size={4.5} />,
  },
  {
    key: StrategyColumnKeys.CHAIN_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.chain" defaultMessage="Chain" />,
    renderCell: (data) => data.network.name,
    getOrderValue: (data) => data.network.name,
  },
  {
    key: StrategyColumnKeys.YIELD_TYPE,
    label: <FormattedMessage description="earn.all-strategies-table.column.yield-type" defaultMessage="Yield Type" />,
    renderCell: (data) => (
      <ContainerBox>
        <StyledBoxedLabel>
          <StyledBodySmallRegularTypo2>{data.formattedYieldType}</StyledBodySmallRegularTypo2>
        </StyledBoxedLabel>
      </ContainerBox>
    ),
    customSkeleton: (
      <ContainerBox>
        <StyledBoxedLabel>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" width="6ch" />
          </StyledBodySmallRegularTypo2>
        </StyledBoxedLabel>
      </ContainerBox>
    ),
    hidden: (theme) => window.innerWidth < theme.breakpoints.values.lg,
  },
  {
    key: StrategyColumnKeys.TVL,
    label: <FormattedMessage description="earn.all-strategies-table.column.tvl" defaultMessage="TVL" />,
    renderCell: (data) => `$${usdFormatter(data.farm.tvl)}`,
    getOrderValue: (data) => data.farm.tvl,
  },
  {
    key: StrategyColumnKeys.APY,
    label: <FormattedMessage description="earn.all-strategies-table.column.apy" defaultMessage="APY" />,
    renderCell: (data) => `${data.farm.apy}%`,
    getOrderValue: (data) => data.farm.apy,
  },
  {
    key: StrategyColumnKeys.SAFETY,
    label: <FormattedMessage description="earn.all-strategies-table.column.safety" defaultMessage="Safety" />,
    renderCell: (data) => (data.riskLevel ? getStrategySafetyIcon(data.riskLevel) : '-'),
    getOrderValue: (data) => {
      if (!data.riskLevel) {
        return undefined;
      }

      return (
        Object.keys(StrategyRiskLevel).length -
        Object.values(StrategyRiskLevel).findIndex((rskLvl: StrategyRiskLevel) => rskLvl === data.riskLevel)
      );
    },
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

export const portfolioColumnConfigs: StrategyColumnConfig<StrategiesTableVariants.USER_STRATEGIES>[] = [
  {
    key: StrategyColumnKeys.VAULT_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.vault-name" defaultMessage="Vault name" />,
    renderCell: (data) => data[0].strategy.farm.name,
    getOrderValue: (data) => data[0].strategy.farm.name,
  },
  {
    // Token column for smaller screens
    key: StrategyColumnKeys.TOKEN,
    label: <FormattedMessage description="earn.all-strategies-table.column.token" defaultMessage="Token" />,
    renderCell: (data) => <TokenIconWithNetwork token={data[0].strategy.asset} />,
    customSkeleton: (
      <ContainerBox gap={2} alignItems="center">
        <Skeleton variant="circular" width={28} height={28} animation="wave" />
      </ContainerBox>
    ),
    hidden: (theme) => window.innerWidth >= theme.breakpoints.values.lg,
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
    hidden: (theme) => window.innerWidth < theme.breakpoints.values.lg,
  },
  {
    key: StrategyColumnKeys.REWARDS,
    label: <FormattedMessage description="earn.all-strategies-table.column.rewards" defaultMessage="Rewards" />,
    renderCell: (data) => <ComposedTokenIcon tokens={data[0].strategy.rewards.tokens} size={4.5} />,
    hidden: (theme) => window.innerWidth < theme.breakpoints.values.lg,
  },
  {
    key: StrategyColumnKeys.CHAIN_NAME,
    label: <FormattedMessage description="earn.all-strategies-table.column.chain" defaultMessage="Chain" />,
    renderCell: (data) => data[0].strategy.network.name,
    getOrderValue: (data) => data[0].strategy.network.name,
    hidden: (theme) => window.innerWidth < theme.breakpoints.values.lg,
  },
  {
    key: StrategyColumnKeys.APY,
    label: <FormattedMessage description="earn.all-strategies-table.column.apy" defaultMessage="APY" />,
    renderCell: (data) => `${data[0].strategy.farm.apy}%`,
    getOrderValue: (data) => data[0].strategy.farm.apy,
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
    renderCell: (data) => `$${usdFormatter(parseUserStrategiesFinancialData(data).totalInvestedUsd)}`,
    getOrderValue: (data) => parseUserStrategiesFinancialData(data).totalInvestedUsd,
  },
  {
    key: StrategyColumnKeys.CURRENT_PROFIT,
    label: (
      <FormattedMessage description="earn.all-strategies-table.column.current-profit" defaultMessage="Current Profit" />
    ),
    renderCell: (data) => (
      <StyledBodySmallRegularTypo2 color="success.dark">
        +{usdFormatter(parseUserStrategiesFinancialData(data).currentProfitUsd)}
      </StyledBodySmallRegularTypo2>
    ),
    getOrderValue: (data) => parseUserStrategiesFinancialData(data).currentProfitUsd,
  },
];
