import React, { useEffect, useMemo, useState } from 'react';
import { Button, ColorCircle, ContainerBox, Typography } from '..';
import { colors } from '../../theme';
import { Timestamp } from 'common-types';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { DateTime } from 'luxon';
import styled, { useTheme } from 'styled-components';
import orderBy from 'lodash/orderBy';
import flatten from 'lodash/flatten';
import { ChartEmoji } from '../../emojis';

interface DataItem {
  timestamp: Timestamp;
}

interface Legend {
  label: React.ReactNode;
  color: string;
}

const StyledContainerBoxWithHeight = styled.div<{ height?: number; minHeight?: number }>`
  min-height: ${({ minHeight, height }) => minHeight || height}px;
  ${({ height }) => (height ? ` height: ${height}px;` : 'flex: 1;')}
  color: black;
  .recharts-surface {
    overflow: visible;
  }
`;

interface GraphContainerProps<T extends DataItem> {
  title?: React.ReactNode;
  legend?: Legend[];
  data: T[];
  children(data: T[]): React.ReactNode;
  minHeight?: number;
  height?: number;
  addOrganicGrowthTo?: (keyof T)[];
  variationFactor?: number;
  isLoading?: boolean;
  LoadingSkeleton?: React.ComponentType;
  defaultPeriod?: AvailableDatePeriods;
  defaultEnabledPeriods?: AvailableDatePeriods[];
  updatePeriodCallback?: (period: AvailableDatePeriods) => void;
  customDaysBackMap?: Partial<typeof DAYS_BACK_MAP>;
}

export const GraphNoDataAvailable = () => {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <ContainerBox flexDirection="column" gap={2} fullWidth alignItems="center" justifyContent="center">
      <Typography variant="h4Bold">
        <ChartEmoji />
      </Typography>
      <Typography variant="h5Bold" color={colors[mode].typography.typo3}>
        <FormattedMessage
          description="graph-container.no-data-available"
          defaultMessage="We could not retrieve the data for this graph"
        />
      </Typography>
    </ContainerBox>
  );
};

const LegendItem = ({ legend: { color, label } }: { legend: Legend }) => (
  <ContainerBox gap={2} alignItems="center" justifyContent="center">
    <ColorCircle color={color} size={3} />
    <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
      {label}
    </Typography>
  </ContainerBox>
);

function getMaxAndMin<T extends DataItem>(data: T[]) {
  const values = data.map((d) => d.timestamp);
  return {
    max: Math.max(...values),
    min: Math.min(...values),
  };
}

function getAmountOfDaysBetweenDates(startDate: number, endDate: number) {
  return DateTime.fromSeconds(endDate).diff(DateTime.fromSeconds(startDate), 'days').days;
}

export enum AvailableDatePeriods {
  day = '1d',
  week = '1w',
  month = '1m',
  year = '1y',
  all = 'all',
}

const DAYS_BACK_MAP: Record<AvailableDatePeriods, number> = {
  [AvailableDatePeriods.day]: 3,
  [AvailableDatePeriods.week]: 7,
  [AvailableDatePeriods.month]: 30,
  [AvailableDatePeriods.year]: 365,
  [AvailableDatePeriods.all]: Infinity,
};

const AVAILABLE_DATE_PERIODS_STRING_MAP: Record<AvailableDatePeriods, ReturnType<typeof defineMessage>> = {
  [AvailableDatePeriods.day]: defineMessage({
    description: 'ui-common.graph-container.time-control.day',
    defaultMessage: '1D',
  }),
  [AvailableDatePeriods.week]: defineMessage({
    description: 'ui-common.graph-container.time-control.week',
    defaultMessage: '1W',
  }),
  [AvailableDatePeriods.month]: defineMessage({
    description: 'ui-common.graph-container.time-control.month',
    defaultMessage: '1M',
  }),
  [AvailableDatePeriods.year]: defineMessage({
    description: 'ui-common.graph-container.time-control.year',
    defaultMessage: '1Y',
  }),
  [AvailableDatePeriods.all]: defineMessage({
    description: 'ui-common.graph-container.time-control.all',
    defaultMessage: 'All',
  }),
};

function getEnabledPeriods(amountOfDaysBetween: number) {
  const enabledPeriods: AvailableDatePeriods[] = [];

  if (amountOfDaysBetween > 1) {
    enabledPeriods.push(AvailableDatePeriods.day);
  }

  if (amountOfDaysBetween > 7) {
    enabledPeriods.push(AvailableDatePeriods.week);
  }

  if (amountOfDaysBetween > 30) {
    enabledPeriods.push(AvailableDatePeriods.month);
  }

  if (amountOfDaysBetween > 365) {
    enabledPeriods.push(AvailableDatePeriods.year);
  }

  enabledPeriods.push(AvailableDatePeriods.all);

  return enabledPeriods;
}

const getEnabledDates = (data: DataItem[]) => {
  const { max, min } = getMaxAndMin(data);
  const amountOfDaysBetween = getAmountOfDaysBetweenDates(min, max);

  return getEnabledPeriods(amountOfDaysBetween);
};

function addOrganicVariation<T extends DataItem>(data: T[], keys: (keyof T)[], variationFactor = 0.3) {
  const itemsWithoutData = data.filter((dataPoint) => !keys.some((key) => typeof dataPoint[key] === 'number'));

  const organicItems = keys.map((key) => {
    const itemsWithData = data.filter((dataPoint) => key in dataPoint && typeof dataPoint[key] === 'number');
    const organicEstReturns = itemsWithData.map((dataPoint, index, arr) => {
      if (index === arr.length - 1 || index === 0) return dataPoint; // Keep the first and last point exact

      const dataPointData = dataPoint[keys[0]];

      if (typeof dataPointData !== 'number') {
        return dataPoint;
      }

      const randomVariation = Math.random() * variationFactor * dataPointData;
      return { ...dataPoint, [key]: dataPointData + randomVariation };
    });

    return organicEstReturns;
  });

  return orderBy([...itemsWithoutData, ...flatten(organicItems)], 'timestamp', 'asc');
}

const GraphContainer = <T extends DataItem>({
  children,
  title,
  legend,
  data,
  minHeight,
  height,
  addOrganicGrowthTo,
  variationFactor,
  isLoading,
  LoadingSkeleton,
  defaultPeriod,
  defaultEnabledPeriods,
  updatePeriodCallback,
  customDaysBackMap,
}: GraphContainerProps<T>) => {
  const intl = useIntl();
  const [periodSetByUser, setPeriodSetByUser] = useState(false);
  const [activePeriod, setActivePeriod] = useState<AvailableDatePeriods>(defaultPeriod || AvailableDatePeriods.all);
  const enabledPeriods = useMemo(() => defaultEnabledPeriods || getEnabledDates(data), [data, defaultEnabledPeriods]);

  const handlePeriodChange = (period: AvailableDatePeriods) => {
    setActivePeriod(period);
    if (updatePeriodCallback) {
      updatePeriodCallback(period);
    }
  };

  useEffect(() => {
    if (periodSetByUser) {
      return;
    }

    if (!defaultPeriod) {
      handlePeriodChange(enabledPeriods[enabledPeriods.length - 1]);
    }
    setPeriodSetByUser(true);
  }, [enabledPeriods, periodSetByUser]);

  const filteredData = useMemo(() => {
    const today = Math.floor(Date.now() / 1000);

    const daysBackMapValue = customDaysBackMap?.[activePeriod] || DAYS_BACK_MAP[activePeriod];
    const filteredCurrentData = data.filter((d) => {
      const daysBetween = getAmountOfDaysBetweenDates(d.timestamp, today);

      // We only want the actual data first
      return daysBetween < daysBackMapValue && daysBetween >= 0;
    });

    // Now we only want 1/4th of the graph to be future data
    const amountOfDataToAdd = Math.ceil(filteredCurrentData.length / 4);
    // Now we get the future data and cutoff the rest

    const filteredFutureData = data
      .filter((d) => {
        // this would always be negative for the future ones
        const daysBetween = getAmountOfDaysBetweenDates(d.timestamp, today);
        return daysBetween <= 0 && daysBetween * -1 <= daysBackMapValue;
      })
      .slice(0, amountOfDataToAdd);

    let parsedData = orderBy([...filteredCurrentData, ...filteredFutureData], 'timestamp', 'asc');

    if (addOrganicGrowthTo) {
      parsedData = addOrganicVariation(parsedData, addOrganicGrowthTo, variationFactor);
    }

    return parsedData;
  }, [data, activePeriod, customDaysBackMap]);

  if (isLoading && LoadingSkeleton) {
    return <LoadingSkeleton />;
  }

  if (!isLoading && !data.length) {
    return <GraphNoDataAvailable />;
  }

  return (
    <ContainerBox flexDirection="column" alignItems="stretch" gap={6} flex={1} style={{ height: '100%' }}>
      {(title || !!legend?.length) && (
        <ContainerBox justifyContent="space-between">
          {title && (
            <Typography variant="h5Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
              {title}
            </Typography>
          )}
          {!!legend?.length && (
            <ContainerBox gap={2}>
              {legend.map((legendItem) => (
                <LegendItem key={legendItem.color} legend={legendItem} />
              ))}
            </ContainerBox>
          )}
        </ContainerBox>
      )}
      <ContainerBox flexDirection="column" gap={3} flex={1}>
        <StyledContainerBoxWithHeight minHeight={minHeight} height={height}>
          {children(filteredData)}
        </StyledContainerBoxWithHeight>
        <ContainerBox justifyContent="flex-end" gap={1} alignItems="center">
          {enabledPeriods.map((period) => (
            <Button
              key={period}
              variant="contained"
              color={period === activePeriod ? 'primary' : 'secondary'}
              size="small"
              sx={({ spacing }) => ({ padding: `${spacing(1)} ${spacing(2)}` })}
              onClick={() => handlePeriodChange(period)}
            >
              {intl.formatMessage(AVAILABLE_DATE_PERIODS_STRING_MAP[period])}
            </Button>
          ))}
        </ContainerBox>
      </ContainerBox>
    </ContainerBox>
  );
};

export { GraphContainer, GraphContainerProps, AvailableDatePeriods as GraphContainerPeriods };
