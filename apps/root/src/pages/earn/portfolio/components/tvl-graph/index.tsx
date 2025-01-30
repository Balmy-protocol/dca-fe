import { formatUsdAmount } from '@common/utils/currency';
import { GraphSkeleton } from '@pages/strategy-guardian-detail/vault-data/components/data-historical-rate';
import { useThemeMode } from '@state/config/hooks';
import { EarnPosition } from 'common-types';
import { isUndefined } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
  Tooltip,
} from 'recharts';
import { CustomDot, GraphTooltip } from '@common/components/earn/action-graph-components';
import { ContainerBox, GraphContainer, colors, AvailableDatePeriods } from 'ui-library';
import { buildTypographyVariant } from 'ui-library/src/theme/typography';
import { estReturnLabel, findXPoint, findYPoint, getDataForTVLGraph, TVLDataItem } from './tvl-utils';

const CUSTOM_DAYS_BACK_MAP = {
  [AvailableDatePeriods.day]: 3,
};

const EarnPositionTvlGraph = ({
  userStrategies,
  isLoading,
  extendExpectedReturns = true,
  showDots = true,
  minPoints = 0,
  emptyActionsTitle,
}: {
  userStrategies: EarnPosition[];
  isLoading: boolean;
  showDots?: boolean;
  minPoints?: number;
  extendExpectedReturns?: boolean;
  emptyActionsTitle?: string;
}) => {
  const mode = useThemeMode();
  const intl = useIntl();

  const mappedData = React.useMemo(
    () =>
      getDataForTVLGraph({
        userStrategies,
        mode,
        extendExpectedReturns,
        showDots,
        minPoints,
      }),
    [userStrategies, extendExpectedReturns, showDots, minPoints]
  );

  const organicGrowers: (keyof TVLDataItem)[] = React.useMemo(() => ['estReturn'], []);

  return (
    <ContainerBox>
      {isLoading ? (
        <GraphSkeleton />
      ) : (
        <GraphContainer
          data={mappedData}
          height={190}
          addOrganicGrowthTo={organicGrowers}
          variationFactor={0.1}
          customDaysBackMap={CUSTOM_DAYS_BACK_MAP}
          defaultPeriod={AvailableDatePeriods.month}
        >
          {(data) => (
            <ResponsiveContainer width="100%" height={190}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="tvl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[mode].violet.violet500} stopOpacity={1} />
                    <stop offset="95%" stopColor="#D2B1FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="estReturn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[mode].semantic.success.darker} stopOpacity={1} />
                    <stop offset="95%" stopColor={colors[mode].semantic.success.darker} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={colors[mode].border.border1} />
                <Area
                  connectNulls
                  type="monotone"
                  fill="url(#tvl)"
                  strokeWidth="2px"
                  dot={CustomDot}
                  activeDot={false}
                  stroke={colors[mode].violet.violet500}
                  dataKey="tvl"
                />
                {extendExpectedReturns && (
                  <>
                    <Area
                      connectNulls
                      type="monotone"
                      fill="url(#estReturn)"
                      strokeWidth="2px"
                      strokeDasharray="4 2"
                      dot={false}
                      activeDot={false}
                      stroke={colors[mode].semantic.success.darker}
                      dataKey="estReturn"
                    />
                    <ReferenceDot
                      label={(props: { viewBox: { x: number } }) => estReturnLabel(props, data, intl, mode)}
                      x={findXPoint(data)}
                      y={findYPoint(data)}
                      r={1}
                      color={colors[mode].typography.typo3}
                      fill={colors[mode].typography.typo3}
                    />
                    <ReferenceLine
                      x={findXPoint(data)}
                      strokeWidth="2px"
                      strokeDasharray="4 2"
                      stroke={colors[mode].border.border1}
                    />
                  </>
                )}
                <Tooltip
                  wrapperStyle={{ zIndex: 1000 }}
                  content={({ payload }) => (
                    <GraphTooltip
                      payload={payload}
                      emptyActionsTitle={emptyActionsTitle}
                      valueFormatter={(value) => `$${formatUsdAmount({ amount: Number(value), intl })}`}
                      showFilter={
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        !isUndefined(payload?.[0]?.payload?.timestamp) &&
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        DateTime.fromSeconds(payload?.[0]?.payload?.timestamp as number) < DateTime.now()
                      }
                    />
                  )}
                />
                <XAxis
                  dataKey="timestamp"
                  domain={['dataMin', 'dataMax']}
                  interval="preserveStartEnd"
                  tickMargin={8}
                  minTickGap={30}
                  tickCount={10}
                  axisLine={{ stroke: 'transparent' }}
                  type="number"
                  tickLine={false}
                  tickFormatter={(value: string) => DateTime.fromSeconds(Number(value)).toFormat('MMM d')}
                  // @ts-expect-error no worries about the ones we send here
                  tick={{ fill: colors[mode].typography.typo3, ...buildTypographyVariant(mode).labelRegular }}
                />
                <YAxis
                  tickMargin={4}
                  width={30}
                  strokeWidth="0px"
                  domain={[0, 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: string) =>
                    `$${intl.formatNumber(Number(value), {
                      notation: 'compact',
                      compactDisplay: 'short',
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}`
                  }
                  // @ts-expect-error no worries about the ones we send here
                  tick={{ fill: colors[mode].typography.typo3, ...buildTypographyVariant(mode).labelRegular }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </GraphContainer>
      )}
    </ContainerBox>
  );
};

export default EarnPositionTvlGraph;
