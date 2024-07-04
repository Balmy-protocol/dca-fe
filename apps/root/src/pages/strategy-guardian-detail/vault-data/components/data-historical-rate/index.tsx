import { useThemeMode } from '@state/config/hooks';
import { Strategy } from 'common-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ComposedChart, CartesianGrid, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ContainerBox, GraphContainer, Skeleton, Typography, colors, useTheme } from 'ui-library';

export const GraphSkeleton = () => {
  const { spacing } = useTheme();
  return (
    <ContainerBox gap={4} flexDirection="column">
      <ContainerBox gap={4}>
        <ContainerBox flexDirection="column" gap={3} alignItems="start">
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
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
        </ContainerBox>
      </ContainerBox>
      <ContainerBox gap={8} justifyContent="space-around">
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
      </ContainerBox>
    </ContainerBox>
  );
};

interface DataHistoricalRateProps {
  strategy?: Strategy;
}

const DataHistoricalRate = ({ strategy }: DataHistoricalRateProps) => {
  const mode = useThemeMode();

  if (!strategy || !('detailed' in strategy)) {
    return <GraphSkeleton />;
  }

  const mappedData = strategy.historicalAPY.map((item) => ({
    apy: item.apy,
    timestamp: item.timestamp,
  }));

  return (
    <ContainerBox>
      <GraphContainer
        data={mappedData}
        legend={[
          {
            color: colors[mode].violet.violet500,
            label: (
              <FormattedMessage
                description="earn.strategy-guardian-detail.vault-data.historical-rate.apy.legend"
                defaultMessage="APY"
              />
            ),
          },
        ]}
        title={
          <FormattedMessage
            description="earn.strategy-guardian-detail.vault-data.historical-rate.title"
            defaultMessage="Vault history overview"
          />
        }
        height={270}
      >
        {(data) => (
          <ResponsiveContainer width="100%" height={270}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="apy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[mode].violet.violet500} stopOpacity={1} />
                  <stop offset="95%" stopColor="#D2B1FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={colors[mode].border.border1} />
              <Area
                connectNulls
                legendType="none"
                type="monotone"
                fill="url(#apy)"
                strokeWidth="2px"
                dot={false}
                activeDot={false}
                stroke={colors[mode].violet.violet500}
                dataKey="apy"
              />
              <XAxis
                interval="preserveStartEnd"
                dataKey="name"
                hide
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: string) => `${value.split(' ')[0]} ${value.split(' ')[1]}`}
              />
              <YAxis
                tickMargin={0}
                width={30}
                strokeWidth="0px"
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </GraphContainer>
    </ContainerBox>
  );
};

export default DataHistoricalRate;
