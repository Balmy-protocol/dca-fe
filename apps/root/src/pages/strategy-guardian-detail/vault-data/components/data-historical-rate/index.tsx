import { useThemeMode } from '@state/config/hooks';
import { DisplayStrategy, EarnPositionActionType } from 'common-types';
import { compact } from 'lodash';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ComposedChart, CartesianGrid, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AvailableDatePeriods, ContainerBox, GraphContainer, Skeleton, Typography, colors, useTheme } from 'ui-library';
import {
  GraphTooltip,
  CustomDot,
  DataItemAction,
  PERMITTED_ACTIONS,
  findClosestTimestamp,
} from '@common/components/earn/action-graph-components';

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
  strategy?: DisplayStrategy;
}

type DataItem = {
  apy: number;
  timestamp: number;
  actions: DataItemAction[];
  mode: 'light' | 'dark';
};

const DataHistoricalRate = ({ strategy }: DataHistoricalRateProps) => {
  const mode = useThemeMode();
  const intl = useIntl();

  const mappedData: DataItem[] = React.useMemo(() => {
    if (!strategy || !strategy.historicalAPY) {
      return [];
    }

    const data: DataItem[] = strategy.historicalAPY.map((item) => ({
      apy: item.apy,
      timestamp: item.timestamp,
      actions: [],
      mode,
    }));

    const userActions = compact(
      strategy.userPositions?.map((position) => {
        if (position.history.length === 0) {
          return null;
        }

        return compact(
          position.history
            ?.filter((action) => PERMITTED_ACTIONS.includes(action.action as EarnPositionActionType))
            .map<DataItemAction | null>((state) => {
              if (
                state.action !== EarnPositionActionType.CREATED &&
                state.action !== EarnPositionActionType.WITHDREW &&
                state.action !== EarnPositionActionType.INCREASED
              ) {
                return null;
              }

              const value: DataItemAction['value'] | undefined =
                state.action === EarnPositionActionType.WITHDREW
                  ? state.withdrawn.find(({ token }) => token.address === strategy.asset.address)
                  : { amount: state.deposited, token: strategy.asset };

              if (!value) return null;

              return {
                user: position.owner,
                type:
                  state.action === EarnPositionActionType.CREATED
                    ? EarnPositionActionType.INCREASED
                    : (state.action as EarnPositionActionType.INCREASED | EarnPositionActionType.WITHDREW),
                value,
                timestamp: state.tx.timestamp,
              } satisfies DataItemAction;
            })
        );
      }) || []
    ).reduce<DataItemAction[]>((acc, userPos) => [...acc, ...userPos], []);

    const timestamps = data.map(({ timestamp }) => timestamp);

    userActions.forEach((action) => {
      const closestTimestamp = findClosestTimestamp(timestamps, action.timestamp);

      const dataItemIndex = data.findIndex(({ timestamp }) => timestamp === closestTimestamp);

      if (dataItemIndex !== -1) {
        data[dataItemIndex].actions.push(action);
      }
    });

    return data;
  }, [strategy, strategy?.userPositions]);

  if (!strategy || !strategy.historicalAPY) {
    return <GraphSkeleton />;
  }

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
        height={270}
        defaultPeriod={AvailableDatePeriods.month}
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
                type="monotone"
                fill="url(#apy)"
                strokeWidth="2px"
                dot={CustomDot}
                activeDot={false}
                stroke={colors[mode].violet.violet500}
                dataKey="apy"
              />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                content={({ payload }) => (
                  <GraphTooltip
                    payload={payload}
                    emptyActionsTitle={intl.formatMessage({
                      description: 'earn.strategy-guardian-detail.vault-data.historical-rate.tooltip.empty-actions',
                      defaultMessage: 'Apy:',
                    })}
                    valueFormatter={(value: number) => `${value}%`}
                  />
                )}
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
                tickFormatter={(value) => `${value}%`}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </GraphContainer>
    </ContainerBox>
  );
};

export default DataHistoricalRate;
