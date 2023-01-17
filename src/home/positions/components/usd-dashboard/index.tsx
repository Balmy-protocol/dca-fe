import React from 'react';
import Grid from '@mui/material/Grid';
import orderBy from 'lodash/orderBy';
import union from 'lodash/union';
import intersection from 'lodash/intersection';
import mergeWith from 'lodash/mergeWith';
import Button from 'common/button';
import styled from 'styled-components';
import useCurrentPositions from 'hooks/useCurrentPositions';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import LinearProgress from '@mui/material/LinearProgress';
import { createStyles } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import { BigNumber } from 'ethers';
import usePriceService from 'hooks/usePriceService';
import { Token } from 'types';
import { formatUnits } from 'ethers/lib/utils';
import find from 'lodash/find';
import { NETWORKS } from 'config';
import { emptyTokenWithSymbol, formatCurrencyAmount } from 'utils/currency';
import { FormattedMessage } from 'react-intl';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { usdFormatter } from 'utils/parsing';
import { Hidden } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from 'hooks/state';
import { changeMainTab } from 'state/tabs/actions';
import DashboardPopper from './popper';

const StyledCountDashboardContainer = styled(Grid)`
  min-height: 190px;

  .label-top {
    transform: translateY(20px);
  }
`;

const StyledButton = styled(Button)`
  padding: 0px 8px 2px 0px;
`;

const StyledBullet = styled.div<{ fill: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50px;
  ${({ fill }) => fill && `background-color: ${fill};`}
`;

const StyledTypography = styled(Typography)<{ disabled: boolean }>`
  ${({ disabled }) => disabled && 'color: rgba(255, 255, 255, 0.5);'}
  font-weight: 500;
`;

const StyledGrid = styled(Grid)`
  display: flex;
  align-items: center;
`;

const StyledSwapsLinearProgress = styled(LinearProgress)<{ fill: string }>``;

const StyledLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  align-self: stretch;
  justify-content: space-evenly;
`;

const COLORS = {
  ETH: '#3076F6',
  MATIC: '#6f41d8',
  OP: '#FF0615',
  LINK: '#2a5ada',
  LYRA: '#4fe49d',
  UNI: '#ff007a',
  USDC: '#3c6ebd',
  SNX: '#5ecefa',
  sUSD: '#31d8a4',
  USDT: '#27a17b',
  rETH: '#ffbf95',
  PERP: '#3be9ac',
  SUSHI: '#d55892',
  CRV: '#4064a1',
  WBTC: '#e2871a',
  jEUR: '#003399',
  QUICK: '#fdfdfe',
  DAI: '#f4b831',
  MANA: '#ff2c56',
  miMATIC: '#da3837',
  AAVE: '#2ebac6',
  MAGIC: '#dd2021',
  LPT: '#00c673',
  GMX: '#25c1d2',
};

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const BorderLinearProgress = withStyles(() =>
  createStyles({
    root: {
      height: 8,
      borderRadius: 10,
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0,
      background: 'transparent',
      cursor: 'pointer',
    },
    dashed: {
      background: 'none',
    },
    bar1Buffer: (props: { fill: string }) => ({
      borderRadius: 10,
      background: props.fill,
    }),
    bar2Buffer: {
      borderRadius: 10,
      background: 'rgba(255, 255, 255, 0.5)',
    },
  })
)(StyledSwapsLinearProgress);

type TokenCount = Record<
  string,
  Record<number, { balance: BigNumber; balanceUSD: number; token: Token; fill: string }>
>;

interface UsdDashboardProps {
  selectedChain: number | null;
  selectedTokens: string[] | null;
  onSelectTokens: (token: string[] | null) => void;
}

interface ChainBreakdown {
  balance: BigNumber;
  balanceUSD: BigNumber;
}

interface RawCount {
  name: string;
  value: number;
  summedRawBalance: BigNumber;
  summedBalanceToShow: BigNumber;
  summedBalanceUsdToShow: number;
  chains: string[];
  valuePerChain: Record<string, ChainBreakdown>;
  token: Token;
  tokens?: string[];
  isOther?: boolean;
  tokensBreakdown?: Record<string, { summedBalanceUsdToShow: number; summedRawBalance: BigNumber; decimals: number }>;
}

const UsdDashboard = ({ selectedChain, onSelectTokens, selectedTokens }: UsdDashboardProps) => {
  const positions = useCurrentPositions();
  const priceService = usePriceService();
  const [hasLoadedUSDValues, setHasLoadedUSDValues] = React.useState(false);
  const [isLoadingUSDValues, setIsLoadingUSDValues] = React.useState(false);
  const [tokenUSDPrices, setTokenUSDPrices] = React.useState<Record<string, Record<string, BigNumber>>>({});
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showPopper, setShowPopper] = React.useState(false);
  const history = useHistory();
  const dispatch = useAppDispatch();

  const handlePopperEl = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTimeout(() => setShowPopper(true), 200);
  };

  const handleGoToCreatePosition = () => {
    dispatch(changeMainTab(0));
    history.push(`/create`);
  };

  const tokensCountRaw = React.useMemo(
    () =>
      positions.reduce<TokenCount>((acc, position) => {
        const newAcc: TokenCount = {
          ...acc,
        };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const supportedNetwork = find(NETWORKS, { chainId: position.chainId })!;
        const fill = supportedNetwork.mainColor || 'linear-gradient(90deg, #3076F6 0%, #B518FF 123.4%)';

        // if (selectedChain && position.chainId !== selectedChain) {
        //   fill = 'rgba(255, 255, 255, 0.5)';
        // }

        const remainingLiquidity = position.remainingLiquidityUnderlying || position.remainingLiquidity;

        if (position.remainingLiquidity.gt(BigNumber.from(0))) {
          if (!newAcc[position.from.symbol]) {
            newAcc[position.from.symbol] = {
              [position.chainId]: {
                balance: remainingLiquidity,
                token: position.from,
                balanceUSD: 0,
                fill,
              },
            };
          } else if (!newAcc[position.from.symbol][position.chainId]) {
            newAcc[position.from.symbol][position.chainId] = {
              balance: remainingLiquidity,
              balanceUSD: 0,
              token: position.from,
              fill,
            };
          } else {
            newAcc[position.from.symbol][position.chainId].balance =
              newAcc[position.from.symbol][position.chainId].balance.add(remainingLiquidity);
          }
        }

        const toWithdraw = position.toWithdrawUnderlying || position.toWithdraw;

        if (position.toWithdraw.gt(BigNumber.from(0))) {
          if (!newAcc[position.to.symbol]) {
            newAcc[position.to.symbol] = {
              [position.chainId]: {
                balance: toWithdraw,
                balanceUSD: 0,
                token: position.to,
                fill,
              },
            };
          } else if (!newAcc[position.to.symbol][position.chainId]) {
            newAcc[position.to.symbol][position.chainId] = {
              balance: toWithdraw,
              token: position.to,
              balanceUSD: 0,
              fill,
            };
          } else {
            newAcc[position.to.symbol][position.chainId].balance =
              newAcc[position.to.symbol][position.chainId].balance.add(toWithdraw);
          }
        }

        return newAcc;
      }, {}),
    [positions.length]
  );

  React.useEffect(() => {
    const fetchUSDValues = async () => {
      if (!Object.keys(tokensCountRaw).length) {
        setIsLoadingUSDValues(false);
        setHasLoadedUSDValues(true);
        return;
      }

      const promises: Promise<Record<string, BigNumber>>[] = [];

      const tokensSymbols = Object.keys(tokensCountRaw);

      const tokensPerChain: Record<string, Token[]> = {};

      tokensSymbols.forEach((tokenSymbol) => {
        const tokenChains = Object.keys(tokensCountRaw[tokenSymbol]);
        tokenChains.forEach((tokenChain) => {
          if (!tokensPerChain[tokenChain]) {
            tokensPerChain[tokenChain] = [tokensCountRaw[tokenSymbol][Number(tokenChain)].token];
          } else {
            tokensPerChain[tokenChain].push(tokensCountRaw[tokenSymbol][Number(tokenChain)].token);
          }
        });
      });

      const chains = Object.keys(tokensPerChain);

      chains.forEach((chainId) => {
        promises.push(priceService.getUsdHistoricPrice(tokensPerChain[chainId], undefined, Number(chainId)));
      });

      const results = await Promise.all(promises);

      const reducedResults = results.reduce<Record<string, Record<string, BigNumber>>>((acc, result, index) => {
        const newAcc = {
          ...acc,
        };

        const chainId = chains[index];

        const tokenRecords: Record<string, BigNumber> = {};

        chains.forEach((chain) => {
          tokensPerChain[chain].forEach((token) => {
            tokenRecords[token.address] = result[token.address];
          });
        });

        newAcc[chainId] = {
          ...tokenRecords,
        };

        return newAcc;
      }, {});

      setTokenUSDPrices(reducedResults);

      setHasLoadedUSDValues(true);
      setIsLoadingUSDValues(false);
    };

    if (!hasLoadedUSDValues && !isLoadingUSDValues) {
      setIsLoadingUSDValues(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchUSDValues();
    }
  }, [positions, hasLoadedUSDValues]);

  const tokensCount = React.useMemo(() => {
    if (!hasLoadedUSDValues) {
      return [];
    }
    const tokenSymbols = Object.keys(tokensCountRaw);

    let rawCounts = tokenSymbols.map((tokenSymbol) => {
      let summedBalanceUsd = 0;
      let summedBalanceUsdToShow = 0;
      let summedBalanceToShow = BigNumber.from(0);
      let summedRawBalance = BigNumber.from(0);
      const chains = Object.keys(tokensCountRaw[tokenSymbol]);

      const valuePerChain = chains.reduce<Record<string, ChainBreakdown>>((acc, chainKey) => {
        const point = tokensCountRaw[tokenSymbol][Number(chainKey)];
        const usdPrice = tokenUSDPrices[chainKey][point.token.address];

        if (!usdPrice) {
          return acc;
        }

        const usdValue = point.balance.mul(usdPrice);

        return {
          ...acc,
          [chainKey]: {
            balance: tokensCountRaw[tokenSymbol][Number(chainKey)].balance,
            balanceUSD: usdValue,
          },
        };
      }, {});

      chains.forEach((chain) => {
        const point = tokensCountRaw[tokenSymbol][Number(chain)];
        const pointBalance = valuePerChain[chain];

        if (!pointBalance || !pointBalance.balance) {
          return;
        }

        if (!selectedChain || selectedChain === Number(chain)) {
          summedBalanceToShow = summedBalanceToShow.add(pointBalance.balance);
          summedBalanceUsdToShow += parseFloat(formatUnits(pointBalance.balanceUSD, point.token.decimals + 18));
        }
        summedBalanceUsd += parseFloat(formatUnits(pointBalance.balanceUSD, point.token.decimals + 18));
        summedRawBalance = summedRawBalance.add(pointBalance.balance);
      });

      return {
        name: tokenSymbol,
        value: summedBalanceUsd,
        summedRawBalance,
        summedBalanceToShow,
        summedBalanceUsdToShow,
        chains,
        valuePerChain,
        token: tokensCountRaw[tokenSymbol][Number(chains[0])].token,
      };
    });

    rawCounts = orderBy(rawCounts, 'value', 'desc');

    const filteredRawCounts = rawCounts.reduce<RawCount[]>((acc, count) => {
      const newAcc: RawCount[] = [...acc];
      if (newAcc.length < 4) {
        newAcc.push(count);
      } else if (newAcc.length === 4) {
        newAcc.push({
          ...count,
          name: 'Other',
          token: emptyTokenWithSymbol('Other'),
          tokens: [count.token.symbol],
          isOther: true,
          tokensBreakdown: {
            [count.token.symbol]: {
              summedBalanceUsdToShow: count.summedBalanceUsdToShow,
              summedRawBalance: count.summedRawBalance,
              decimals: count.token.decimals,
            },
          },
        });
      } else if (newAcc.length > 4) {
        const other = {
          ...newAcc[4],
        };

        other.value += count.value;
        other.summedRawBalance = other.summedRawBalance.add(count.summedRawBalance);
        other.summedBalanceToShow = other.summedBalanceToShow.add(count.summedBalanceToShow);
        other.summedBalanceUsdToShow += count.summedBalanceUsdToShow;
        other.chains = union(other.chains, count.chains);
        other.tokens = [...(other.tokens || []), count.token.symbol];
        other.tokensBreakdown = {
          ...(other.tokensBreakdown || {}),
          [count.token.symbol]: {
            summedBalanceUsdToShow: count.summedBalanceUsdToShow,
            summedRawBalance: count.summedRawBalance,
            decimals: count.token.decimals,
          },
        };

        other.valuePerChain = mergeWith(other.valuePerChain, count.valuePerChain, (value, srcValue) => {
          if (BigNumber.isBigNumber(value) && BigNumber.isBigNumber(srcValue)) {
            return value.add(srcValue);
          }

          return undefined;
        });

        newAcc[4] = other;
      }

      return newAcc;
    }, []);

    return filteredRawCounts.map((rawCount, index) => {
      let fill =
        COLORS[rawCount.token.symbol as keyof typeof COLORS] ||
        DEFAULT_COLORS[index] ||
        DEFAULT_COLORS[DEFAULT_COLORS.length - 1];

      let isSelected = true;

      const selected =
        (selectedTokens && intersection((rawCount.tokens && rawCount.tokens) || [rawCount.name], selectedTokens)) || [];

      if (selectedTokens && selected.length === 0) {
        isSelected = false;
        fill = 'rgba(255, 255, 255, 0.5)';
      }

      if (selectedChain && !rawCount.chains.includes(selectedChain.toString())) {
        isSelected = false;
        fill = 'rgba(255, 255, 255, 0.5)';
      }
      return { ...rawCount, fill, isSelected };
    });
  }, [hasLoadedUSDValues, tokenUSDPrices, tokensCountRaw, selectedTokens, selectedChain]);

  const totalUSDAmount = React.useMemo(() => tokensCount.reduce((acc, value) => acc + value.value, 0), [tokensCount]);

  const shownTotalUSDAmount = React.useMemo(
    () =>
      tokensCount.reduce((acc, value) => {
        if (!selectedChain && !selectedTokens) {
          return acc + value.value;
        }

        if (selectedChain && value.chains.includes(selectedChain.toString())) {
          return (
            acc +
            parseFloat(
              formatUnits(
                value.valuePerChain[selectedChain.toString()]
                  ? value.valuePerChain[selectedChain.toString()].balanceUSD
                  : BigNumber.from('0'),
                value.token.decimals + 18
              )
            )
          );
        }

        const selected =
          (selectedTokens && intersection((value.tokens && value.tokens) || [value.name], selectedTokens)) || [];
        if (selected.length !== 0) {
          return acc + value.value;
        }

        return acc;
      }, 0),
    [tokensCount, selectedTokens]
  );

  const tokensCountLabels = React.useMemo(
    () =>
      orderBy(
        tokensCount.map((value) => {
          const relativeLength = (value.value * 100) / totalUSDAmount;
          const relativeLengthToShow = (value.summedBalanceUsdToShow * 100) / totalUSDAmount;
          return { ...value, relativeLength, relativeLengthToShow };
        }),
        'count',
        'desc'
      ),
    [tokensCount]
  );

  return (
    <StyledCountDashboardContainer container>
      <Grid item xs={12} sx={{ paddingBottom: '10px' }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          <FormattedMessage description="generatedDashboard" defaultMessage="Total value" />
        </Typography>
      </Grid>
      {!hasLoadedUSDValues && (
        <Grid item xs={12}>
          <CenteredLoadingIndicator />
        </Grid>
      )}
      {hasLoadedUSDValues && !tokensCount.length && (
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="body1">
            <FormattedMessage
              description="generatedDashboardNoValuePart1"
              defaultMessage="There are no funds currently deposited in Mean Finance"
            />
          </Typography>
          <Typography variant="body1">
            <StyledButton variant="text" color="secondary" onClick={handleGoToCreatePosition}>
              <Typography variant="body1">
                <FormattedMessage description="generatedDashboardNoValueAction" defaultMessage="Create a position" />
              </Typography>
            </StyledButton>
            <FormattedMessage description="generatedDashboardNoValuePart2" defaultMessage="to start investing now!" />
          </Typography>
        </Grid>
      )}
      {hasLoadedUSDValues && !!tokensCount.length && (
        <>
          <Hidden smDown>
            <Grid item xs={12} md={5}>
              <ResponsiveContainer>
                <PieChart height={150}>
                  <Pie
                    data={tokensCount}
                    dataKey="value"
                    innerRadius={65}
                    paddingAngle={1}
                    outerRadius={75}
                    cursor="pointer"
                    fill="#8884d8"
                    onMouseOver={(data: { name: string; token: Token; tokens?: string[] }) =>
                      onSelectTokens(data.tokens ? data.tokens : [data.name])
                    }
                    onMouseOut={() => onSelectTokens(null)}
                  >
                    {tokensCount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                    <Label
                      value={`$${usdFormatter(shownTotalUSDAmount)}`}
                      position="centerBottom"
                      fontSize="1.7rem"
                      fontWeight={400}
                      offset={-10}
                      letterSpacing="0.0075em"
                      color="white"
                      fill="white"
                    />
                    <Label
                      value="USD"
                      position="centerTop"
                      className="label-top"
                      fontSize="1.10rem"
                      offset={10}
                      fontWeight={400}
                      letterSpacing="0.0075em"
                      color="#FFFFFF80"
                      fill="#FFFFFF80"
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Hidden>
          <StyledGrid item xs={12} md={7}>
            <StyledLabelContainer>
              {tokensCountLabels.map((positionCountLabel) => (
                <Grid
                  container
                  alignItems="center"
                  onMouseOut={() => {
                    onSelectTokens(null);
                    setShowPopper(false);
                  }}
                  onMouseOver={(event) => {
                    onSelectTokens(positionCountLabel.tokens ? positionCountLabel.tokens : [positionCountLabel.name]);
                    if (positionCountLabel.isOther) {
                      handlePopperEl(event);
                    }
                  }}
                  sx={{ cursor: 'pointer' }}
                  key={positionCountLabel.name}
                >
                  <Grid item xs={1}>
                    <StyledBullet fill={positionCountLabel.fill} />
                  </Grid>
                  <Grid item xs={3}>
                    <StyledTypography
                      variant="body2"
                      disabled={positionCountLabel.summedBalanceToShow.lte(BigNumber.from(0))}
                    >
                      {positionCountLabel.name}
                    </StyledTypography>
                  </Grid>
                  <Grid item xs={5}>
                    {positionCountLabel.isOther && (
                      <Popper id="other-popper" open={showPopper} anchorEl={anchorEl}>
                        <DashboardPopper tokensBreakdown={positionCountLabel.tokensBreakdown} />
                      </Popper>
                    )}
                    {!positionCountLabel.isOther && (
                      <BorderLinearProgress
                        variant="buffer"
                        value={positionCountLabel.relativeLengthToShow}
                        valueBuffer={positionCountLabel.relativeLength}
                        fill={positionCountLabel.fill}
                      />
                    )}
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {!positionCountLabel.isOther
                        ? formatCurrencyAmount(positionCountLabel.summedBalanceToShow, positionCountLabel.token, 4)
                        : `$${positionCountLabel.summedBalanceUsdToShow.toFixed(2)}`}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </StyledLabelContainer>
          </StyledGrid>
        </>
      )}
    </StyledCountDashboardContainer>
  );
};
export default UsdDashboard;
