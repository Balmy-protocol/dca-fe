import { formatUsdAmount } from '@common/utils/currency';
import { DisplayStrategy, Strategy } from 'common-types';
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
  DividerBorder2,
} from 'ui-library';
import { SPACING } from 'ui-library/src/theme/constants';

export enum DataCardVariants {
  Details = 'details',
  Home = 'home',
}

interface DataCardsProps {
  strategy?: Strategy | DisplayStrategy;
  dataCardsGap?: number;
  variant?: DataCardVariants;
}

interface DataCardProps {
  title: React.ReactNode;
  content: React.ReactNode;
  info?: React.ReactNode;
  variant?: DataCardVariants;
}

const StyledDataCardBox = styled(ContainerBox)<{ $isDetails: boolean }>`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
    $isDetails,
  }) => `
    border: 1px solid ${$isDetails ? colors[mode].border.border1 : colors[mode].border.border2};
    background-color: ${colors[mode].background.tertiary};
    padding: ${spacing(3)};
    border-radius: ${spacing(3)};
    ${$isDetails ? `min-height: ${spacing(25.5)}; // 102px` : ''}
  `};
`;

const StyledDataCardsContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 3,
})<{ $isDetails: boolean }>`
  ${({ theme: { spacing }, $isDetails }) => `
  margin: ${$isDetails ? `${spacing(0)} ${spacing(6)}` : '0'};
  `};
`;

const DataCard = ({ title, content, info, variant }: DataCardProps) => (
  <StyledDataCardBox
    alignItems="center"
    justifyContent="center"
    flexDirection="column"
    gap={1}
    flex={1}
    $isDetails={variant === DataCardVariants.Details}
  >
    <ContainerBox alignItems="center" justifyContent="center" gap={1}>
      <Typography variant="bodySmallBold" whiteSpace="nowrap">
        {title}
      </Typography>
      {info && (
        <Tooltip title={info}>
          <ContainerBox>
            <InfoCircleIcon size={SPACING(4.5)} />
          </ContainerBox>
        </Tooltip>
      )}
    </ContainerBox>
    <Typography
      variant={variant === DataCardVariants.Details ? 'h5Bold' : 'bodyBold'}
      color={({ palette: { mode } }) => colors[mode].typography.typo1}
    >
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

const DataCards = ({ strategy, dataCardsGap = 4, variant = DataCardVariants.Details }: DataCardsProps) => {
  const intl = useIntl();
  const loading = !strategy;

  return (
    <StyledDataCardsContainer $isDetails={variant === DataCardVariants.Details}>
      <ContainerBox alignItems="center" justifyContent="space-evenly" gap={dataCardsGap}>
        <DataCard
          title={<FormattedMessage defaultMessage="APY" description="earn.strategy-details.vault-data.apy" />}
          content={loading ? <SkeletonDataCard /> : `${formatUsdAmount({ amount: strategy.farm.apy, intl })}%`}
          info={
            <FormattedMessage
              defaultMessage="Annual Percentage Yield (APY) shows your potential yearly earnings, including compound interest."
              description="earn.strategy-details.vault-data.apy-info"
            />
          }
          variant={variant}
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
              defaultMessage="Total Value Locked (TVL) shows the overall worth of cryptocurrencies deposited in this vault, usually indicating its liquidity and market size."
              description="earn.strategy-details.vault-data.tvl-info"
            />
          }
          variant={variant}
        />
      </ContainerBox>
      {variant === DataCardVariants.Home && (
        <ContainerBox flexDirection="column" justifyContent="stretch">
          <DividerBorder2 />
          <StyledDataCardYieldTypeBox alignItems="center" justifyContent="center">
            <Typography variant="bodySmallRegular">
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
      )}
    </StyledDataCardsContainer>
  );
};

export default DataCards;
