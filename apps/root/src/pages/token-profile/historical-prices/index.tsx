import React from 'react';
import { TimeString } from '@balmy/sdk';
import usePrevious from '@hooks/usePrevious';
import usePriceService from '@hooks/usePriceService';
import useProviderService from '@hooks/useProviderService';
import { useThemeMode } from '@state/config/hooks';
import { AmountsOfToken, Timestamp, Token, TransactionEventIncomingTypes, TransactionEventTypes } from 'common-types';
import { DateTime } from 'luxon';
import { ComposedChart, CartesianGrid, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import styled from 'styled-components';
import { ContainerBox, GraphContainer, GraphContainerPeriods, colors } from 'ui-library';
import { Address as ViemAddress } from 'viem';
import GraphTooltip from './components/graph-tooltip';
import GraphSkeleton from './components/graph-skeleton';

interface TokenHistoricalPricesProps {
  token: Token;
}

type TokenFlow = TransactionEventIncomingTypes.INCOMING | TransactionEventIncomingTypes.OUTGOING;

type DataItemAction = {
  type: TransactionEventTypes.NATIVE_TRANSFER | TransactionEventTypes.ERC20_TRANSFER | TransactionEventTypes.SWAP;
  tokenFlow: TokenFlow;
  value: {
    token: Token;
    amount: AmountsOfToken;
  };
  user: ViemAddress;
  date: number;
  name: string;
};

export type GraphDataItem = {
  price: number;
  timestamp: number;
  actions: DataItemAction[];
  mode: 'light' | 'dark';
  name: string;
};

const StyledGraphContainer = styled(ContainerBox).attrs({ flex: 1 })`
  .recharts-surface {
    overflow: visible;
  }
`;

const DATA_POINTS = 200;

// Calculate the period string based on desired data points and timeframe duration
const PeriodMap: Record<Exclude<GraphContainerPeriods, GraphContainerPeriods.all>, TimeString> = {
  [GraphContainerPeriods.day]: `10m`, // For small periods, this number works better than the exact needed
  [GraphContainerPeriods.week]: `${Math.round((7 * 24) / DATA_POINTS)}h`, // 7 days * 24 hours / DATA_POINTS
  [GraphContainerPeriods.month]: `${Math.round((30 * 24) / DATA_POINTS)}h`, // 30 days * 24 hours / DATA_POINTS
  [GraphContainerPeriods.year]: `${Math.round(365 / DATA_POINTS)}d`, // 365 days / DATA_POINTS
};

const PeriodDateFormatMap: Record<GraphContainerPeriods, string> = {
  [GraphContainerPeriods.day]: 't',
  [GraphContainerPeriods.week]: 'MMM d',
  [GraphContainerPeriods.month]: 'MMM d',
  [GraphContainerPeriods.year]: 'MMM yyyy',
  [GraphContainerPeriods.all]: 'MMM yyyy',
};

const DEFAULT_PERIOD = GraphContainerPeriods.day;

const TokenHistoricalPrices = ({ token }: TokenHistoricalPricesProps) => {
  const mode = useThemeMode();
  const priceService = usePriceService();
  const providerService = useProviderService();
  const [selectedPeriod, setSelectedPeriod] = React.useState<GraphContainerPeriods>(DEFAULT_PERIOD);
  const prevPeriod = usePrevious(selectedPeriod);
  const [isLoadingHistorical, setIsLoadingHistorical] = React.useState(true);
  const [graphPrices, setGraphPrices] = React.useState<Record<Timestamp, number>>({});
  const fetchedPeriodsRef = React.useRef<GraphContainerPeriods[]>([]);

  React.useEffect(() => {
    const handleAllTimeframe = async () => {
      const firstTimestamp = await providerService.getBlockTimestamp(token.chainId, 1n);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      const totalDataPoints = Math.floor((currentTimestamp - firstTimestamp) / (24 * 60 * 60));

      if (totalDataPoints < 30) {
        // Fresh chain
        return {
          period: PeriodMap[GraphContainerPeriods.day],
          span: DATA_POINTS,
        };
      }

      let span = totalDataPoints;

      let periodDays = 1;
      while (span > DATA_POINTS) {
        span = Math.floor(span / 3);
        periodDays = periodDays * 3;
      }

      return {
        period: `${periodDays}d` as TimeString,
        span,
      };
    };

    const fetchGraphPrices = async () => {
      setIsLoadingHistorical(true);
      const priceResult = await priceService.getPricesForTokenGraph({
        token,
        ...(selectedPeriod === GraphContainerPeriods.all
          ? await handleAllTimeframe()
          : { period: PeriodMap[selectedPeriod], span: DATA_POINTS }),
      });

      setGraphPrices((prev) => ({ ...prev, ...priceResult }));
      setIsLoadingHistorical(false);
    };
    if (prevPeriod !== selectedPeriod && !fetchedPeriodsRef.current.includes(selectedPeriod)) {
      fetchedPeriodsRef.current.push(selectedPeriod);
      void fetchGraphPrices();
    }
  }, [selectedPeriod]);

  const mappedData: GraphDataItem[] = React.useMemo(() => {
    const includeYear = [GraphContainerPeriods.year, GraphContainerPeriods.all].includes(selectedPeriod);
    const format = includeYear ? 'MMM d yyyy' : 'MMM d t';
    const data: GraphDataItem[] = Object.entries(graphPrices).map(([timestamp, price]) => ({
      price,
      timestamp: Number(timestamp),
      actions: [],
      mode,
      name: DateTime.fromSeconds(Number(timestamp)).toFormat(format),
    }));

    return data;
  }, [graphPrices, selectedPeriod]);

  return (
    <StyledGraphContainer>
      <GraphContainer
        data={mappedData}
        defaultEnabledPeriods={[
          GraphContainerPeriods.day,
          GraphContainerPeriods.week,
          GraphContainerPeriods.month,
          GraphContainerPeriods.year,
          GraphContainerPeriods.all,
        ]}
        defaultPeriod={DEFAULT_PERIOD}
        minHeight={270}
        updatePeriodCallback={(period) => setSelectedPeriod(period)}
        isLoading={isLoadingHistorical}
        LoadingSkeleton={GraphSkeleton}
      >
        {(data) => (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ right: 16, left: 16 }}>
              <defs>
                <linearGradient id="priceColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[mode].violet.violet500} stopOpacity={1} />
                  <stop offset="95%" stopColor="#D2B1FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={colors[mode].border.border1} />
              <Area
                connectNulls
                legendType="none"
                type="monotone"
                fill="url(#priceColor)"
                strokeWidth="2px"
                dot={false}
                activeDot={false}
                stroke={colors[mode].violet.violet500}
                dataKey="price"
              />
              <Tooltip content={({ payload }) => <GraphTooltip payload={payload} />} />
              <XAxis
                interval="preserveStartEnd"
                scale="time"
                type="number"
                domain={['auto', 'auto']}
                minTickGap={12}
                dataKey="timestamp"
                includeHidden
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => {
                  const formattedDate = DateTime.fromSeconds(value).toFormat(PeriodDateFormatMap[selectedPeriod]);
                  return formattedDate;
                }}
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
    </StyledGraphContainer>
  );
};

export default TokenHistoricalPrices;
