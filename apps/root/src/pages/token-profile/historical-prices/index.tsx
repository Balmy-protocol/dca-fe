import { getAllChains, PriceResult, TimeString } from '@balmy/sdk';
import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { getTransactionTitle } from '@common/utils/transaction-history';
import usePrevious from '@hooks/usePrevious';
import usePriceService from '@hooks/usePriceService';
import useProviderService from '@hooks/useProviderService';
import useStoredTransactionHistory from '@hooks/useStoredTransactionHistory';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { useThemeMode } from '@state/config/hooks';
import {
  AmountsOfToken,
  ERC20TransferEvent,
  NativeTransferEvent,
  SwapEvent,
  Token,
  TokenListId,
  TransactionEvent,
  TransactionEventIncomingTypes,
  TransactionEventTypes,
} from 'common-types';
import { compact } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ComposedChart, CartesianGrid, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import {
  ContainerBox,
  GraphContainer,
  GraphContainerPeriods,
  Skeleton,
  Typography,
  colors,
  useTheme,
} from 'ui-library';
import { Address as ViemAddress } from 'viem';

export const GraphSkeleton = () => {
  const { spacing } = useTheme();
  return (
    <ContainerBox gap={4} justifyContent="space-between" flexDirection="column" style={{ minHeight: spacing(77) }}>
      <ContainerBox gap={4} flex="1">
        <ContainerBox flexDirection="column" gap={3} alignItems="start" justifyContent="space-between">
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
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
        </ContainerBox>
        <ContainerBox gap={4} fullWidth justifyContent="center" alignItems="end">
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(20)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(20)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(24)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(28)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(32)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(24)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(28)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(24)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(20)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
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

interface TokenHistoricalPricesProps {
  token: Token;
}

function findClosestTimestamp(timestamps: number[], targetTimestamp: number): number {
  return timestamps.reduce((prev, curr) => {
    return Math.abs(curr - targetTimestamp) < Math.abs(prev - targetTimestamp) ? curr : prev;
  });
}

type PermittedEvents = NativeTransferEvent | ERC20TransferEvent | SwapEvent;

const permittedActions = [
  TransactionEventTypes.NATIVE_TRANSFER,
  TransactionEventTypes.ERC20_TRANSFER,
  TransactionEventTypes.SWAP,
];

type DataItemAction = {
  tx: PermittedEvents;
  tokenFlow: TransactionEventIncomingTypes;
  amount: AmountsOfToken;
  user: ViemAddress;
  date: number;
  name: string;
};

type DataItem = {
  price: number;
  timestamp: number;
  actions: DataItemAction[];
  mode: 'light' | 'dark';
  name: string;
};

interface DotProps {
  payload?: DataItem;
  cx: number;
  cy: number;
}

const StyledGraphContainer = styled(ContainerBox).attrs({ flex: 1 })`
  .recharts-surface {
    overflow: visible;
  }
`;

const StyledTooltipContainer = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 2 })`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    padding: ${spacing(3)};
    background-color: ${colors[mode].background.emphasis};
    border: 1px solid ${colors[mode].border.border1};
    box-shadow: ${colors[mode].dropShadow.dropShadow200};
    border-radius: ${spacing(2)};
  `}
`;

interface TooltipProps {
  payload?: {
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
    payload?: DataItem;
  }[];
}

const getTooltipContent = (tx: PermittedEvents) => {
  const intl = useIntl();
  switch (tx.type) {
    case TransactionEventTypes.NATIVE_TRANSFER:
    case TransactionEventTypes.ERC20_TRANSFER:
      return (
        <ContainerBox alignItems="center" gap={1}>
          <TokenIcon token={tx.data.token} size={5} />
          <Typography variant="bodySmallBold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
            {formatCurrencyAmount({ amount: tx.data.amount.amount, token: tx.data.token, intl })}
          </Typography>
          <Typography variant="bodySmallRegular">
            (${formatUsdAmount({ intl, amount: tx.data.amount.amountInUSD })})
          </Typography>
        </ContainerBox>
      );
    case TransactionEventTypes.SWAP:
      return (
        <ContainerBox gap={3}>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodyExtraSmall">
              <FormattedMessage defaultMessage="Sold" description="token-profile.historical-prices.tooltip.swap.sold" />
            </Typography>
            <ContainerBox alignItems="center" gap={1}>
              <TokenIcon token={tx.data.tokenIn} size={5} />
              <Typography variant="bodySmallBold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
                {formatCurrencyAmount({ amount: tx.data.amountIn.amount, token: tx.data.tokenIn, intl })}
              </Typography>
              <Typography variant="bodySmallRegular">
                (${formatUsdAmount({ intl, amount: tx.data.amountIn.amountInUSD })})
              </Typography>
            </ContainerBox>
          </ContainerBox>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodyExtraSmall">
              <FormattedMessage
                defaultMessage="Bought"
                description="token-profile.historical-prices.tooltip.swap.bought"
              />
            </Typography>
            <ContainerBox alignItems="center" gap={1}>
              <TokenIcon token={tx.data.tokenOut} size={5} />
              <Typography variant="bodySmallBold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
                {formatCurrencyAmount({ amount: tx.data.amountOut.amount, token: tx.data.tokenOut, intl })}
              </Typography>
              <Typography variant="bodySmallRegular">
                (${formatUsdAmount({ intl, amount: tx.data.amountOut.amountInUSD })})
              </Typography>
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      );
    default:
      return <></>;
  }
};

const GraphTooltip = (props: TooltipProps) => {
  const { payload } = props;
  const intl = useIntl();

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const actions = firstPayload.payload.actions;

  return (
    <StyledTooltipContainer>
      {actions.length === 0 ? (
        <ContainerBox flexDirection="column" gap={1}>
          <Typography variant="bodySmallRegular">
            ${formatUsdAmount({ intl, amount: firstPayload.payload.price })}
          </Typography>
          <Typography variant="bodySmallRegular">{firstPayload.payload.name}</Typography>
        </ContainerBox>
      ) : (
        actions.map(({ user, tx, date }, key) => (
          <ContainerBox gap={1} flexDirection="column" key={`${key}-${date}`}>
            <ContainerBox justifyContent="space-between" gap={3}>
              <Typography variant="bodySmallRegular">{intl.formatMessage(getTransactionTitle(tx))}</Typography>
              <Typography variant="bodySmallRegular">
                <Address address={user} trimAddress />
              </Typography>
            </ContainerBox>
            {getTooltipContent(tx)}
          </ContainerBox>
        ))
      )}
    </StyledTooltipContainer>
  );
};

const CustomDot = (props: DotProps) => {
  const { cx, cy, payload } = props;

  if (!payload?.actions.length) return <></>;

  const actionsBalance = payload.actions.reduce((acc, action) => {
    if (action.tx.data.tokenFlow === TransactionEventIncomingTypes.INCOMING) {
      return acc + Number(action.amount.amountInUSD || 0);
    } else if (action.tx.data.tokenFlow === TransactionEventIncomingTypes.OUTGOING) {
      return acc - Number(action.amount.amountInUSD || 0);
    } else {
      return acc;
    }
  }, 0);

  if (actionsBalance >= 0) {
    return (
      <svg x={cx - 9} y={cy - 9.5} width={18} height={19} viewBox="0 0 18 19">
        <rect y="0.316406" width="18" height="18" rx="9" fill="#EFEAF6" />
        <path
          d="M9 17.3789C4.5525 17.3789 0.9375 13.7639 0.9375 9.31641C0.9375 4.86891 4.5525 1.25391 9 1.25391C13.4475 1.25391 17.0625 4.86891 17.0625 9.31641C17.0625 13.7639 13.4475 17.3789 9 17.3789ZM9 2.37891C5.175 2.37891 2.0625 5.49141 2.0625 9.31641C2.0625 13.1414 5.175 16.2539 9 16.2539C12.825 16.2539 15.9375 13.1414 15.9375 9.31641C15.9375 5.49141 12.825 2.37891 9 2.37891Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
        <path
          d="M12 9.87891H6C5.6925 9.87891 5.4375 9.62391 5.4375 9.31641C5.4375 9.00891 5.6925 8.75391 6 8.75391H12C12.3075 8.75391 12.5625 9.00891 12.5625 9.31641C12.5625 9.62391 12.3075 9.87891 12 9.87891Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
        <path
          d="M9 12.8789C8.6925 12.8789 8.4375 12.6239 8.4375 12.3164V6.31641C8.4375 6.00891 8.6925 5.75391 9 5.75391C9.3075 5.75391 9.5625 6.00891 9.5625 6.31641V12.3164C9.5625 12.6239 9.3075 12.8789 9 12.8789Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
      </svg>
    );
  }

  return (
    <svg x={cx - 9} y={cy - 9.5} width={18} height={19} viewBox="0 0 18 19">
      <rect y="0.0898438" width="18" height="18" rx="9" fill="#EFEAF6" />
      <path
        d="M8.93945 17.1523C4.49945 17.1523 0.876953 13.5373 0.876953 9.08984C0.876953 4.64234 4.49945 1.02734 8.93945 1.02734C13.3795 1.02734 17.002 4.64234 17.002 9.08984C17.002 13.5373 13.387 17.1523 8.93945 17.1523ZM8.93945 2.15234C5.11445 2.15234 2.00195 5.26484 2.00195 9.08984C2.00195 12.9148 5.11445 16.0273 8.93945 16.0273C12.7645 16.0273 15.877 12.9148 15.877 9.08984C15.877 5.26484 12.7645 2.15234 8.93945 2.15234Z"
        fill={colors[payload.mode].semantic.error.darker}
      />
      <path
        d="M11.9395 9.65234H5.93945C5.63195 9.65234 5.37695 9.39734 5.37695 9.08984C5.37695 8.78234 5.63195 8.52734 5.93945 8.52734H11.9395C12.247 8.52734 12.502 8.78234 12.502 9.08984C12.502 9.39734 12.2545 9.65234 11.9395 9.65234Z"
        fill={colors[payload.mode].semantic.error.darker}
      />
    </svg>
  );
};

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

const PeriodMap: Record<Exclude<GraphContainerPeriods, GraphContainerPeriods.all>, TimeString> = {
  [GraphContainerPeriods.day]: '30m',
  [GraphContainerPeriods.week]: '3h',
  [GraphContainerPeriods.month]: '12h',
  [GraphContainerPeriods.year]: '1w',
};

const DATA_POINTS = 200;

const DAY_SECONDS = 24 * 60 * 60;
const TimestampMap: Record<GraphContainerPeriods, number> = {
  [GraphContainerPeriods.day]: DAY_SECONDS,
  [GraphContainerPeriods.week]: 7 * DAY_SECONDS,
  [GraphContainerPeriods.month]: 30 * DAY_SECONDS,
  [GraphContainerPeriods.year]: 365 * DAY_SECONDS,
  [GraphContainerPeriods.all]: Infinity,
};

const TokenHistoricalPrices = ({ token }: TokenHistoricalPricesProps) => {
  const mode = useThemeMode();
  const priceService = usePriceService();
  const providerService = useProviderService();
  const [selectedPeriod, setSelectedPeriod] = React.useState<GraphContainerPeriods>(GraphContainerPeriods.month);
  const prevPeriod = usePrevious(selectedPeriod);
  const [isLoadingHistorical, setIsLoadingHistorical] = React.useState(true);
  const [graphPrices, setGraphPrices] = React.useState<Partial<Record<GraphContainerPeriods, PriceResult[]>>>({});
  const [today] = React.useState(Math.floor(Date.now() / 1000));
  const fetchingHistoryRef = React.useRef(false);

  const handlePeriodUpdate = (newPeriod: GraphContainerPeriods) => {
    if (!graphPrices[newPeriod]) {
      // When period changes, the useMemo renders no data before the isLoading is set to true by the useEffect
      // By setting it here, we avoid the flickering of the graph
      setIsLoadingHistorical(true);
    }

    setSelectedPeriod(newPeriod);
  };

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
      fetchingHistoryRef.current = true;
      await fetchMore();
      fetchingHistoryRef.current = false;
    };

    if (lastEventTimestamp && lastSelectedTimestamp < lastEventTimestamp && !fetchingHistoryRef.current) {
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
      const priceResult = await priceService.getPricesForTokenGraph({
        token,
        ...(selectedPeriod === GraphContainerPeriods.all
          ? await handleAllTimeframe()
          : { period: PeriodMap[selectedPeriod], span: DATA_POINTS }),
      });

      setGraphPrices((prev) => ({ ...prev, [selectedPeriod]: priceResult }));
      setIsLoadingHistorical(false);
    };
    if (prevPeriod !== selectedPeriod && !graphPrices[selectedPeriod]) {
      void fetchGraphPrices();
    }
  }, [selectedPeriod]);

  const mappedData: DataItem[] = React.useMemo(() => {
    const prices = graphPrices[selectedPeriod];

    if (!prices) return [];

    const includeYear = [GraphContainerPeriods.year, GraphContainerPeriods.all].includes(selectedPeriod);
    const format = includeYear ? 'MMM d yyyy' : 'MMM d t';
    const data: DataItem[] = prices.map((item) => ({
      price: item.price,
      timestamp: item.closestTimestamp,
      actions: [],
      mode,
      name: DateTime.fromSeconds(item.closestTimestamp).toFormat(format),
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
            user: txEvent.tx.initiatedBy,
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
        defaultPeriod={GraphContainerPeriods.month}
        minHeight={270}
        updatePeriodCb={handlePeriodUpdate}
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
    </StyledGraphContainer>
  );
};

export default TokenHistoricalPrices;
