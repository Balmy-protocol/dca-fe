import { useThemeMode } from '@state/config/hooks';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, Skeleton, Typography, colors, useTheme } from 'ui-library';

export const GraphSkeleton = () => {
  const { spacing } = useTheme();
  return (
    <ContainerBox gap={4} flexDirection="column">
      <ContainerBox gap={4}>
        <ContainerBox flexDirection="column" gap={3} alignItems="start">
          <Typography variant="body">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="body">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="body">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="body">
            <Skeleton animation="wave" width={40} />
          </Typography>
        </ContainerBox>
        <ContainerBox gap={4} fullWidth justifyContent="center" alignItems="end">
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(12)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(12)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(20)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(12)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(24)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(28)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(32)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(36)} animation="wave" />
        </ContainerBox>
      </ContainerBox>
      <ContainerBox gap={8} justifyContent="space-around">
        <Typography variant="body">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="body">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="body">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="body">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="body">
          <Skeleton animation="wave" width={60} />
        </Typography>
      </ContainerBox>
    </ContainerBox>
  );
};

export const GraphNoData = () => {
  const mode = useThemeMode();
  return (
    <ContainerBox flexDirection="column" gap={2} fullWidth alignItems="center">
      <Typography variant="h4">📊</Typography>
      <Typography variant="h5" fontWeight={700} color={colors[mode].typography.typo3}>
        <FormattedMessage
          description="graphNoDataAvailable"
          defaultMessage="There is no data available about this position yet"
        />
      </Typography>
      <Typography variant="body" color={colors[mode].typography.typo3}>
        <FormattedMessage
          description="graphNoDataAvailableParagraph"
          defaultMessage="Once you have it, you will see the performance of your DCA position."
        />
      </Typography>
    </ContainerBox>
  );
};

export const GraphNoPriceAvailable = () => {
  const mode = useThemeMode();
  return (
    <ContainerBox flexDirection="column" gap={2} fullWidth alignItems="center">
      <Typography variant="h4">📊</Typography>
      <Typography variant="h5" fontWeight={700} color={colors[mode].typography.typo3}>
        <FormattedMessage
          description="No price available"
          defaultMessage="We could not fetch the price of one of the tokens"
        />
      </Typography>
    </ContainerBox>
  );
};
