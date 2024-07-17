import React from 'react';
import { FormattedMessage } from 'react-intl';
import { TableStrategy } from '../..';
import { ContainerBox, Skeleton, StyledBodySmallRegularTypo2, colors } from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { usdFormatter } from '@common/utils/parsing';
import { emptyTokenWithLogoURI } from '@common/utils/currency';
import { getStrategySafetyIcon } from '@common/utils/earn/parsing';
import { StrategyRiskLevel } from 'common-types';
import styled from 'styled-components';

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
}

const StyledYieldTypeBox = styled.div`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(1)} ${spacing(3)};
  border-radius: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].violet.violet300};
  `}
`;

export interface StrategyColumnConfig {
  key: StrategyColumnKeys;
  label: React.ReactNode;
  renderCell: (data: TableStrategy) => React.ReactNode | string;
  getOrderValue?: (data: TableStrategy) => string | number;
  customSkeleton?: React.ReactNode;
}

export const strategyColumnConfigs: StrategyColumnConfig[] = [
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
        <StyledYieldTypeBox>
          <StyledBodySmallRegularTypo2>{data.formattedYieldType}</StyledBodySmallRegularTypo2>
        </StyledYieldTypeBox>
      </ContainerBox>
    ),
    customSkeleton: (
      <ContainerBox>
        <StyledYieldTypeBox>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" width="6ch" />
          </StyledBodySmallRegularTypo2>
        </StyledYieldTypeBox>
      </ContainerBox>
    ),
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
  {
    key: StrategyColumnKeys.SAFETY,
    label: <FormattedMessage description="earn.all-strategies-table.column.safety" defaultMessage="Safety" />,
    renderCell: (data) => getStrategySafetyIcon(data.riskLevel),
    getOrderValue: (data) => Object.keys(StrategyRiskLevel).length - data.riskLevel,
  },
];

export type ColumnOrder = 'asc' | 'desc';

export function getComparator<Key extends StrategyColumnKeys>(
  order: ColumnOrder,
  orderBy: Key
): (a: TableStrategy, b: TableStrategy) => number {
  return (a, b) => {
    const column = strategyColumnConfigs.find((config) => config.key === orderBy);
    if (column && column.getOrderValue) {
      const aValue = column.getOrderValue(a);
      const bValue = column.getOrderValue(b);
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (order === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    }
    return 0;
  };
}
