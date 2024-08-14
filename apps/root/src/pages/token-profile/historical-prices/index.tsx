import React from 'react';
import { getAllChains, TimeString } from '@balmy/sdk';
import usePrevious from '@hooks/usePrevious';
import usePriceService from '@hooks/usePriceService';
import useProviderService from '@hooks/useProviderService';
import { useThemeMode } from '@state/config/hooks';
import {
  AmountsOfToken,
  ERC20TransferEvent,
  NativeTransferEvent,
  SwapEvent,
  Timestamp,
  Token,
  TokenListId,
  TransactionEvent,
  TransactionEventIncomingTypes,
  TransactionEventTypes,
} from 'common-types';
import { DateTime } from 'luxon';
import { ComposedChart, CartesianGrid, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import styled from 'styled-components';
import { ContainerBox, GraphContainer, GraphContainerPeriods, colors } from 'ui-library';
import GraphTooltip from './components/graph-tooltip';
import GraphSkeleton from './components/graph-skeleton';
import CustomDot from './components/custom-dot';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import useStoredTransactionHistory from '@hooks/useStoredTransactionHistory';
import { compact } from 'lodash';

interface TokenHistoricalPricesProps {
  token: Token;
}

function findClosestTimestamp(timestamps: number[], targetTimestamp: number): number {
  const currentTime = Math.floor(Date.now() / 1000);
  return timestamps.reduce((prev, curr) => {
    return Math.abs(curr - targetTimestamp) < Math.abs(prev - targetTimestamp) ? curr : prev;
  }, currentTime);
}

const getEventContextData = (
  txEvent: TransactionEvent,
  token: Token
): { amount: AmountsOfToken; tokenFlow: TransactionEventIncomingTypes } | null => {
  switch (txEvent.type) {
    case TransactionEventTypes.NATIVE_TRANSFER:
    case TransactionEventTypes.ERC20_TRANSFER:
      return {
        amount: txEvent.data.amount,
        tokenFlow: txEvent.data.tokenFlow,
      };
    case TransactionEventTypes.SWAP:
      const isTokenOut = txEvent.data.tokenOut.address === token.address;
      return {
        amount: isTokenOut ? txEvent.data.amountOut : txEvent.data.amountIn,
        tokenFlow: isTokenOut ? TransactionEventIncomingTypes.INCOMING : TransactionEventIncomingTypes.OUTGOING,
      };
    default:
      return null;
  }
};

export type TokenGraphPermittedEvents = NativeTransferEvent | ERC20TransferEvent | SwapEvent;

const permittedActions = [
  TransactionEventTypes.NATIVE_TRANSFER,
  TransactionEventTypes.ERC20_TRANSFER,
  TransactionEventTypes.SWAP,
];

type DataItemAction = {
  tx: TokenGraphPermittedEvents;
  tokenFlow: TransactionEventIncomingTypes;
  amount: AmountsOfToken;
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

const DAY_SECONDS = 24 * 60 * 60;
const TimestampMap: Record<GraphContainerPeriods, number> = {
  [GraphContainerPeriods.day]: DAY_SECONDS,
  [GraphContainerPeriods.week]: 7 * DAY_SECONDS,
  [GraphContainerPeriods.month]: 30 * DAY_SECONDS,
  [GraphContainerPeriods.year]: 365 * DAY_SECONDS,
  [GraphContainerPeriods.all]: Infinity,
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
  const [today] = React.useState(Math.floor(Date.now() / 1000));
  const fetchingHistoryRef = React.useRef(false);

  const tokenListIds = React.useMemo(() => {
    const chains = getAllChains().map((chain) => chain.chainId);
    const ids = token.chainAddresses
      .filter((chainAddress) => chains.includes(chainAddress.chainId))
      .map((chainAddress) => `${chainAddress.chainId}-${chainAddress.address}` as TokenListId);

    return ids.length > 0 ? ids : [`${token.chainId}-${token.address}` as TokenListId];
  }, [token.chainAddresses]);

  const { events, fetchMore } = useTransactionsHistory(tokenListIds);

  const {
    tokenPagination: { lastEventTimestamp },
  } = useStoredTransactionHistory();

  React.useEffect(() => {
    const lastSelectedTimestamp = today - TimestampMap[selectedPeriod];

    const fetchData = async () => {
      await fetchMore();
      fetchingHistoryRef.current = false;
    };

    if (lastEventTimestamp && lastSelectedTimestamp < lastEventTimestamp && !fetchingHistoryRef.current) {
      fetchingHistoryRef.current = true;
      void fetchData();
    }
  }, [selectedPeriod, lastEventTimestamp]);

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

    const userActions = compact(
      events
        .filter((txEvent) => permittedActions.includes(txEvent.type))
        .map<DataItemAction | null>((txEvent) => {
          if (
            txEvent.type !== TransactionEventTypes.NATIVE_TRANSFER &&
            txEvent.type !== TransactionEventTypes.ERC20_TRANSFER &&
            txEvent.type !== TransactionEventTypes.SWAP
          ) {
            return null;
          }

          const eventContext = getEventContextData(txEvent, token);

          if (!eventContext) return null;

          return {
            tx: txEvent,
            tokenFlow: eventContext.tokenFlow,
            amount: eventContext?.amount,
            date: txEvent.tx.timestamp,
            name: DateTime.fromSeconds(txEvent.tx.timestamp).toFormat('MMM d t'),
          };
        })
    );

    const timestamps = data.map(({ timestamp }) => timestamp);

    userActions.forEach((action) => {
      const closestTimestamp = findClosestTimestamp(timestamps, action.date);

      const dataItemIndex = data.findIndex(({ timestamp }) => timestamp === closestTimestamp);

      if (dataItemIndex !== -1) {
        data[dataItemIndex].actions.push(action);
      }
    });

    return data;
  }, [graphPrices, selectedPeriod, events, token]);

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
                dot={CustomDot}
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
