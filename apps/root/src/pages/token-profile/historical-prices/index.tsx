import { PriceResult, TimeString } from '@balmy/sdk';
import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import usePrevious from '@hooks/usePrevious';
import usePriceService from '@hooks/usePriceService';
import useProviderService from '@hooks/useProviderService';
import { useThemeMode } from '@state/config/hooks';
import { AmountsOfToken, Token, TransactionEventIncomingTypes, TransactionEventTypes } from 'common-types';
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

type DataItem = {
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
        actions.map(({ user, value, type, date }, key) => (
          <ContainerBox gap={1} flexDirection="column" key={`${key}-${date}`}>
            <ContainerBox justifyContent="space-between" gap={3}>
              <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
                {type === TransactionEventTypes.SWAP ? (
                  <FormattedMessage
                    description="token-profile-historical-prices.tooltip.swapped"
                    defaultMessage="Swapped:"
                  />
                ) : (
                  <FormattedMessage
                    description="token-profile-historical-prices.tooltip.transfered"
                    defaultMessage="Transfered:"
                  />
                )}
              </Typography>
              <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
                <Address address={user} trimAddress />
              </Typography>
            </ContainerBox>
            <ContainerBox alignItems="center" gap={1}>
              <TokenIcon token={value.token} size={5} />
              <Typography variant="bodySmallBold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
                {formatCurrencyAmount({ amount: value.amount.amount, token: value.token, intl })}
              </Typography>
              <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
                (${formatUsdAmount({ intl, amount: value.amount.amountInUSD })})
              </Typography>
            </ContainerBox>
          </ContainerBox>
        ))
      )}
    </StyledTooltipContainer>
  );
};

const PeriodMap: Record<Exclude<GraphContainerPeriods, GraphContainerPeriods.all>, TimeString> = {
  [GraphContainerPeriods.day]: '30m',
  [GraphContainerPeriods.week]: '3h',
  [GraphContainerPeriods.month]: '12h',
  [GraphContainerPeriods.year]: '1w',
};

const DATA_POINTS = 200;

const TokenHistoricalPrices = ({ token }: TokenHistoricalPricesProps) => {
  const mode = useThemeMode();
  const priceService = usePriceService();
  const providerService = useProviderService();
  const [selectedPeriod, setSelectedPeriod] = React.useState<GraphContainerPeriods>(GraphContainerPeriods.month);
  const prevPeriod = usePrevious(selectedPeriod);
  const [isLoadingHistorical, setIsLoadingHistorical] = React.useState(true);
  const [graphPrices, setGraphPrices] = React.useState<Partial<Record<GraphContainerPeriods, PriceResult[]>>>({});

  const handlePeriodUpdate = (newPeriod: GraphContainerPeriods) => {
    if (!graphPrices[newPeriod]) {
      // When period changes, the useMemo renders no data before the isLoading is set to true by the useEffect
      // By setting it here, we avoid the flickering of the graph
      setIsLoadingHistorical(true);
    }

    setSelectedPeriod(newPeriod);
  };

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
                dot={false}
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
