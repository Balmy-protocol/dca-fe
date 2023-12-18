import React from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import some from 'lodash/some';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Area, Line, ComposedChart } from 'recharts';
import { Typography, Chip, Paper, colors, baseColors } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import map from 'lodash/map';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import { AvailablePair, GetPairPriceResponseData, GetPairResponseSwapData, Token, TokenType } from '@types';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { formatCurrencyAmount } from '@common/utils/currency';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';

import useDCAGraphql from '@hooks/useDCAGraphql';
import useAvailablePairs from '@hooks/useAvailablePairs';
import getPairPrices from '@graphql/getPairPrices.graphql';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { FAIL_ON_ERROR, ONE_DAY, ONE_HOUR, STABLE_COINS } from '@constants';
import EmptyGraph from '@assets/svg/emptyGraph';
import useGraphPrice from '@hooks/useGraphPrice';
import useUsdPrice from '@hooks/useUsdPrice';
import { parseUnits } from 'viem';
import { useCreatePositionState } from '@state/create-position/hooks';
import { withStyles } from 'tss-react/mui';
import MinimalTabs from '@common/components/minimal-tabs';
import GraphFooter from './components/graph-footer';
import { useThemeMode } from '@state/config/hooks';

const DarkChip = withStyles(Chip, ({ palette: { mode } }) => ({
  root: {
    background: colors[mode].violet.violet800,
    zIndex: '2',
    border: `1px solid ${baseColors.disabledText}`,
  },
}));

interface GraphWidgetProps {
  withFooter?: boolean;
}

interface UniMappedPrice {
  date: string;
  tokenPrice: string;
}

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

interface PriceMeanData {
  name: string;
  'Mean Finance': number | null;
  date: string;
}
interface PriceDefillamaData {
  name: string;
  Defillama: number;
  date: string;
}

type Prices = (PriceMeanData | PriceDefillamaData)[];

const StyledPaper = styled(Paper)<{ $column?: boolean }>`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  display: flex;
  gap: 24px;
  flex-direction: ${({ $column }) => ($column ? 'column' : 'row')};
  min-height: 400px;
`;

const StyledTitleContainer = styled.div`
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledLegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const StyledGraphContainer = styled(Paper)`
  flex-grow: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
  .recharts-surface {
    overflow: visible;
  }
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

const StyledLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const StyledLegendIndicator = styled.div<{ fill: string }>`
  width: 12px;
  height: 12px;
  background-color: ${({ fill }) => fill};
  border-radius: 99px;
`;

const StyledGraphPillsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
`;

const PERIODS = [1, 7, 30];

const INDEX_TO_FORMAT = ['t', 'MMM d', 'MMM d'];

const PERIODS_TO_FILTER_FROM = [ONE_HOUR.toString(), ONE_DAY.toString(), ONE_DAY.toString()];

const EMPTY_GRAPH_TOKEN: TokenWithBase = {
  address: '',
  symbol: '',
  decimals: 1,
  isBaseToken: false,
  name: '',
  chainId: 0,
  type: TokenType.BASE,
  underlyingTokens: [],
};
const GraphWidget = ({ withFooter }: GraphWidgetProps) => {
  const { from, to } = useCreatePositionState();
  let tokenA: GraphToken = EMPTY_GRAPH_TOKEN;
  let tokenB: GraphToken = EMPTY_GRAPH_TOKEN;
  let defiLlamaData: UniMappedPrice[] = [];
  let swapData: GetPairResponseSwapData[] = [];
  const [selectedItem, setSelectedItem] = React.useState<{ value?: number }[]>([]);
  let prices: Prices = [];
  const [tabIndex, setTabIndex] = React.useState(1);
  const availablePairs = useAvailablePairs();
  const currentNetwork = useSelectedNetwork();
  const client = useDCAGraphql(currentNetwork.chainId);
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(from, parseUnits('1', from?.decimals || 18), undefined);
  const [toPrice, isLoadingToPrice] = useUsdPrice(to, parseUnits('1', to?.decimals || 18), undefined);
  const mode = useThemeMode();

  const dateFilter = React.useMemo(
    () => parseInt(DateTime.now().minus({ days: PERIODS[tabIndex] }).toFormat('X'), 10),
    [tabIndex]
  );

  if (to && from) {
    const toAddress =
      to.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId).address : to.address;
    const fromAddress =
      from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId).address : from.address;

    if (fromAddress < toAddress) {
      tokenA = {
        ...(from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : from),
        symbol: from.symbol,
        isBaseToken: STABLE_COINS.includes(from.symbol),
      };
      tokenB = {
        ...(to.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
    } else {
      tokenA = {
        ...(to.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
      tokenB = {
        ...(from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : from),
        symbol: from.symbol,
        isBaseToken: STABLE_COINS.includes(from.symbol),
      };
    }
  }

  const [defillamaprices, isLoadingDefillamaPrices] = useGraphPrice(tokenA, tokenB, tabIndex, currentNetwork.chainId);

  const existingPair = React.useMemo(
    () =>
      find(
        availablePairs,
        (pair) => pair.token0.address === tokenA.address && pair.token1.address === tokenB.address
      ) as AvailablePair | null,
    [from, to, availablePairs, (availablePairs && availablePairs.length) || 0]
  );

  const { loading: loadingMeanData, data: pairData } = useQuery<GetPairPriceResponseData>(getPairPrices, {
    variables: {
      id: existingPair?.id,
      ...((!FAIL_ON_ERROR && { subgraphError: 'allow' }) || { subgraphError: 'deny' }),
    },
    skip: !existingPair,
    client,
    errorPolicy: (!FAIL_ON_ERROR && 'ignore') || 'none',
  });

  const { pair } = pairData || {};
  defiLlamaData = React.useMemo(
    () =>
      defillamaprices?.map(({ rate, timestamp }) => ({
        date: timestamp.toString(),
        tokenPrice: rate.toString(),
      })) || [],
    [defillamaprices, isLoadingDefillamaPrices]
  );
  swapData = React.useMemo(() => {
    if (pair && pair.swaps) {
      return pair.swaps.filter((swap) => parseInt(swap.executedAtTimestamp, 10) >= dateFilter);
    }

    return [];
  }, [pair, loadingMeanData, dateFilter]);

  prices = React.useMemo(() => {
    const mappedDefiLlamaData = map(defiLlamaData, ({ date, tokenPrice }) => ({
      name: DateTime.fromSeconds(parseInt(date, 10)).toFormat(INDEX_TO_FORMAT[tabIndex]),
      Defillama: parseFloat(tokenPrice),
      date,
    }));

    const mappedSwapData = map(
      swapData.filter((swap) =>
        some(
          swap.pairSwapsIntervals,
          (interval) => BigInt(interval.swapInterval.interval) >= BigInt(PERIODS_TO_FILTER_FROM[tabIndex])
        )
      ),
      ({ executedAtTimestamp, ratioAToB, ratioBToA }) => ({
        name: DateTime.fromSeconds(parseInt(executedAtTimestamp, 10)).toFormat(INDEX_TO_FORMAT[tabIndex]),
        'Mean Finance':
          parseFloat(
            formatCurrencyAmount(
              BigInt(tokenA.isBaseToken ? ratioBToA : ratioAToB),
              tokenA.isBaseToken ? tokenA : tokenB,
              10,
              10
            )
          ) || null,
        date: executedAtTimestamp,
      })
    );

    return orderBy([...mappedSwapData, ...mappedDefiLlamaData], ['date'], ['desc']).reverse();
  }, [swapData, defiLlamaData, tabIndex]);

  const isLoading = loadingMeanData || isLoadingFromPrice || isLoadingToPrice || isLoadingDefillamaPrices;
  // const isLoading = loadingPool || loadingMeanData || isLoadingOracle;
  const noData = prices.length === 0;

  if (isLoading) {
    return (
      <StyledPaper variant="outlined" $column>
        <CenteredLoadingIndicator />
        {withFooter && <GraphFooter />}
      </StyledPaper>
    );
  }

  if (!from || !to) {
    return (
      <StyledPaper variant="outlined" $column>
        <StyledPaper variant="outlined">
          <StyledCenteredWrapper>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No pair selected"
                defaultMessage="Select a pair to view its price history"
              />
            </Typography>
          </StyledCenteredWrapper>
        </StyledPaper>
        {withFooter && <GraphFooter />}
      </StyledPaper>
    );
  }

  if (noData) {
    return (
      <StyledPaper variant="outlined" $column>
        <StyledPaper variant="outlined">
          <StyledCenteredWrapper>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No data available"
                defaultMessage="There is no data available about this pair"
              />
            </Typography>
          </StyledCenteredWrapper>
        </StyledPaper>
        {withFooter && <GraphFooter />}
      </StyledPaper>
    );
  }

  const selectedItemValue = selectedItem.reduce(
    (acc, item) => item.value || acc,
    (prices &&
      prices.length &&
      ((prices[prices.length - 1] as PriceDefillamaData).Defillama ||
        (prices[prices.length - 1] as PriceMeanData)['Mean Finance'])) ||
      0
  );

  return (
    <StyledPaper variant="outlined" $column>
      <StyledGraphContainer elevation={0}>
        <StyledHeader>
          <StyledTitleContainer>
            <Typography variant="h6">
              <FormattedMessage
                description="graph description"
                defaultMessage="{from}/{to}"
                values={{
                  from: tokenA.symbol,
                  to: tokenB.symbol,
                }}
              />
            </Typography>
            <MinimalTabs
              options={[
                { key: 0, label: 'Day' },
                { key: 1, label: 'Week' },
                { key: 2, label: 'Month' },
              ]}
              selected={{ key: tabIndex, label: '' }}
              onChange={({ key }) => setTabIndex(key as number)}
            />
          </StyledTitleContainer>
          <StyledLegendContainer>
            <Typography variant="h6">
              <FormattedMessage
                description="graph selectedItemValue"
                defaultMessage="{prefix}{value} {token}"
                values={{
                  prefix: tokenA.isBaseToken ? '$' : '',
                  value: selectedItemValue,
                  token: tokenA.isBaseToken ? 'USD' : tokenB.symbol,
                }}
              />
            </Typography>
          </StyledLegendContainer>
          <StyledLegendContainer>
            {!!defiLlamaData.length && (
              <StyledLegend>
                <StyledLegendIndicator fill={colors[mode].violet.violet600} />
                <Typography variant="bodySmall">
                  <FormattedMessage description="defiLlamaLegend" defaultMessage="DefiLlama" />
                </Typography>
              </StyledLegend>
            )}
            {!!swapData.length && (
              <StyledLegend>
                <StyledLegendIndicator fill={colors[mode].aqua.aqua600} />
                <Typography variant="bodySmall">
                  <FormattedMessage description="meanFinanceLegend" defaultMessage="Mean Finance" />
                </Typography>
              </StyledLegend>
            )}
          </StyledLegendContainer>
        </StyledHeader>
        <ResponsiveContainer width="100%">
          <ComposedChart
            data={prices}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            style={{ overflow: 'visible' }}
            onMouseMove={({ activePayload }) => activePayload && setSelectedItem(activePayload)}
            onMouseLeave={() => setSelectedItem([])}
          >
            <defs>
              <linearGradient id="colorDefillama" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[mode].violet.violet600} stopOpacity={0.5} />
                <stop offset="95%" stopColor={colors[mode].violet.violet600} stopOpacity={0} />
              </linearGradient>
            </defs>
            {defiLlamaData.length && (
              <Area
                legendType="none"
                name="defillama"
                connectNulls
                dataKey="Defillama"
                fill="url(#colorDefillama)"
                strokeWidth="2px"
                dot={false}
                activeDot={false}
                stroke={colors[mode].violet.violet600}
              />
            )}
            {swapData.length && (
              <Line
                legendType="none"
                connectNulls
                dataKey="Mean Finance"
                type="monotone"
                strokeWidth="2px"
                stroke={colors[mode].aqua.aqua600}
                dot={{ strokeWidth: '2px', stroke: colors[mode].aqua.aqua600, fill: colors[mode].aqua.aqua600 }}
                strokeDasharray="3 3"
              />
            )}
            <XAxis
              tickMargin={30}
              minTickGap={30}
              interval="preserveStartEnd"
              dataKey="name"
              axisLine={false}
              tickLine={false}
            />
            <YAxis strokeWidth="0px" domain={['auto', 'auto']} axisLine={false} tickLine={false} hide />
            <Tooltip content={<></>} />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
        <StyledGraphPillsContainer>
          <DarkChip label={`1 ${from.symbol} = $${fromPrice?.toFixed(2) || ''} USD`} />
          <DarkChip label={`1 ${to.symbol} = $${toPrice?.toFixed(2) || ''} USD`} />
        </StyledGraphPillsContainer>
      </StyledGraphContainer>
      {withFooter && <GraphFooter />}
    </StyledPaper>
  );
};

export default React.memo(GraphWidget);
