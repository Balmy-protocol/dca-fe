import { formatUsdAmount } from '@common/utils/currency';
import { getStrategySafetyIcon } from '@common/utils/earn/parsing';
import { Strategy } from 'common-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  Typography,
  colors,
  ContainerBox,
  Skeleton,
  Tooltip,
  InfoCircleIcon,
  SkeletonProps,
  DividerBorder1,
} from 'ui-library';
import { SPACING } from 'ui-library/src/theme/constants';

interface DataCardsProps {
  strategy?: Strategy;
}

interface DataCardProps {
  title: React.ReactNode;
  content: React.ReactNode;
  info?: React.ReactNode;
}

const StyledDataCardBox = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    border: 1px solid ${colors[mode].border.border1};
    background-color: ${colors[mode].background.tertiary};
    padding: ${spacing(1)} ${spacing(3)};
    border-radius: ${spacing(2)};
    min-height: ${spacing(25.5)}; // 102px
  `};
`;

const DataCard = ({ title, content, info }: DataCardProps) => (
  <StyledDataCardBox alignItems="center" justifyContent="center" flexDirection="column" gap={1} flex={1}>
    <ContainerBox alignItems="center" justifyContent="center" gap={1}>
      <Typography variant="bodySmallBold" whiteSpace="nowrap">
        {title}
      </Typography>
      {info && (
        <Tooltip title={info}>
          <InfoCircleIcon size={SPACING(4.5)} />
        </Tooltip>
      )}
    </ContainerBox>
    <Typography variant="h5Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
      {content}
    </Typography>
  </StyledDataCardBox>
);

interface SkeletonDataCardProps {
  variant?: SkeletonProps['variant'];
}

const SkeletonDataCard = ({ variant = 'text' }: SkeletonDataCardProps) => (
  <>
    {variant === 'rounded' && <Skeleton variant="rounded" width={SPACING(8)} height={SPACING(8)} />}
    {variant === 'text' && <Skeleton variant="text" width="7ch" />}
  </>
);

const StyledDataCardYieldTypeBox = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(2)} ${spacing(3)};
  `};
`;

const DataCards = ({ strategy }: DataCardsProps) => {
  const intl = useIntl();
  const loading = !strategy;

  return (
    <ContainerBox flexDirection="column" style={{ margin: `${SPACING(0)} ${SPACING(6)}` }} gap={4.5}>
      <ContainerBox alignItems="center" justifyContent="space-evenly" gap={4}>
        <DataCard
          title={<FormattedMessage defaultMessage="APY" description="earn.strategy-details.vault-data.apy" />}
          content={loading ? <SkeletonDataCard /> : `${formatUsdAmount({ amount: strategy.farm.apy, intl })}%`}
          info={
            <FormattedMessage
              defaultMessage="Annual Percentage Yield"
              description="earn.strategy-details.vault-data.apy-info"
            />
          }
        />
        <DataCard
          title={<FormattedMessage defaultMessage="TVL" description="earn.strategy-details.vault-data.tvl" />}
          content={
            loading ? (
              <SkeletonDataCard />
            ) : (
              `$${intl.formatNumber(strategy.farm.tvl, { notation: 'compact', compactDisplay: 'short' })}`
            )
          }
          info={
            <FormattedMessage
              defaultMessage="Total Value Locked"
              description="earn.strategy-details.vault-data.tvl-info"
            />
          }
        />
        <DataCard
          title={
            <FormattedMessage defaultMessage="Risk Level" description="earn.strategy-details.vault-data.risk-level" />
          }
          content={loading ? <SkeletonDataCard variant="rounded" /> : getStrategySafetyIcon(strategy.riskLevel)}
        />
      </ContainerBox>
      <ContainerBox flexDirection="column" justifyContent="stretch">
        <DividerBorder1 />
        <StyledDataCardYieldTypeBox alignItems="center" justifyContent="center">
          <Typography variant="bodySemibold">
            {loading ? (
              <SkeletonDataCard />
            ) : (
              <FormattedMessage
                defaultMessage="Strategy: {yieldType}"
                values={{ yieldType: strategy.formattedYieldType }}
                description="earn.strategy-details.vault-data.yield-type"
              />
            )}
          </Typography>
        </StyledDataCardYieldTypeBox>
      </ContainerBox>
    </ContainerBox>
  );
};

export default DataCards;
