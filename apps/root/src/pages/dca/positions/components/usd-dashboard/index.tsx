import React from 'react';
import { Grid, Popper, Typography, Hidden, LinearProgress, createStyles, Button, baseColors, colors } from 'ui-library';
import orderBy from 'lodash/orderBy';
import union from 'lodash/union';
import mergeWith from 'lodash/mergeWith';
import styled from 'styled-components';
import useCurrentPositions from '@hooks/useCurrentPositions';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { withStyles } from 'tss-react/mui';

import { Token } from '@types';
import find from 'lodash/find';
import { NETWORKS } from '@constants';
import { emptyTokenWithSymbol, formatCurrencyAmount } from '@common/utils/currency';
import { FormattedMessage } from 'react-intl';
import { usdFormatter } from '@common/utils/parsing';
import usePushToHistory from '@hooks/usePushToHistory';
import { useAppDispatch } from '@hooks/state';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import { changeRoute } from '@state/tabs/actions';
import DashboardPopper from './popper';
import { useThemeMode } from '@state/config/hooks';
import { DCA_CREATE_ROUTE } from '@constants/routes';

const StyledCountDashboardContainer = styled(Grid)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  ${({ breakpoint }) => (breakpoint !== 'xs' ? 'min-height: 190px;' : '')}

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
  ${({ disabled }) => disabled && `color: ${baseColors.disabledText};`}
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

const COLOR_PRIORITIES: (keyof (typeof colors)['dark' | 'light']['accent'])[] = [
  'accent600',
  'primary',
  'accent400',
  'accent200',
  'accent100',
];

const BorderLinearProgress = withStyles(StyledSwapsLinearProgress, () =>
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
      background: baseColors.disabledText,
    },
  })
);

type TokenCount = Record<string, Record<number, { balance: bigint; balanceUSD: number; token: Token; fill: string }>>;

interface ChainBreakdown {
  balance: bigint;
  balanceUSD: number;
}

interface RawCount {
  name: string;
  value: number;
  summedRawBalance: bigint;
  chains: string[];
  valuePerChain: Record<string, ChainBreakdown>;
  token: Token;
  tokens?: string[];
  isOther?: boolean;
  tokensBreakdown?: Record<string, { summedBalanceUsd: number; summedRawBalance: bigint; decimals: number }>;
}

const UsdDashboard = () => {
  const positions = useCurrentPositions();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showPopper, setShowPopper] = React.useState(false);
  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();
  const currentBreakPoint = useCurrentBreakpoint();
  const mode = useThemeMode();

  const handlePopperEl = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTimeout(() => setShowPopper(true), 200);
  };

  const handleGoToCreatePosition = () => {
    dispatch(changeRoute(DCA_CREATE_ROUTE.key));
    pushToHistory(`/create`);
  };

  const tokensCountRaw = React.useMemo(
    () =>
      positions.reduce<TokenCount>((acc, position) => {
        const newAcc: TokenCount = {
          ...acc,
        };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const supportedNetwork = find(NETWORKS, { chainId: position.chainId })!;
        const fill =
          supportedNetwork.mainColor ||
          `linear-gradient(90deg, ${colors[mode].violet.violet200} 0%, ${colors[mode].violet.violet800} 123.4%)`;

        // if (selectedChain && position.chainId !== selectedChain) {
        //   fill = baseColors.disabledText;
        // }

        const remainingLiquidity = position.remainingLiquidity;

        if (position.remainingLiquidity.amount > 0n) {
          if (!newAcc[position.from.symbol]) {
            newAcc[position.from.symbol] = {
              [position.chainId]: {
                balance: remainingLiquidity.amount,
                token: position.from,
                balanceUSD: parseFloat(position.remainingLiquidity.amountInUSD || '0'),
                fill,
              },
            };
          } else if (!newAcc[position.from.symbol][position.chainId]) {
            newAcc[position.from.symbol][position.chainId] = {
              balance: remainingLiquidity.amount,
              balanceUSD: parseFloat(position.remainingLiquidity.amountInUSD || '0'),
              token: position.from,
              fill,
            };
          } else {
            newAcc[position.from.symbol][position.chainId].balance =
              newAcc[position.from.symbol][position.chainId].balance + remainingLiquidity.amount;
            newAcc[position.from.symbol][position.chainId].balanceUSD =
              newAcc[position.from.symbol][position.chainId].balanceUSD +
              parseFloat(position.remainingLiquidity.amountInUSD || '0');
          }
        }

        const toWithdraw = position.toWithdraw;

        if (position.toWithdraw.amount > 0n) {
          if (!newAcc[position.to.symbol]) {
            newAcc[position.to.symbol] = {
              [position.chainId]: {
                balance: toWithdraw.amount,
                balanceUSD: parseFloat(toWithdraw.amountInUSD || '0'),
                token: position.to,
                fill,
              },
            };
          } else if (!newAcc[position.to.symbol][position.chainId]) {
            newAcc[position.to.symbol][position.chainId] = {
              balance: toWithdraw.amount,
              token: position.to,
              balanceUSD: parseFloat(toWithdraw.amountInUSD || '0'),
              fill,
            };
          } else {
            newAcc[position.to.symbol][position.chainId].balance =
              newAcc[position.to.symbol][position.chainId].balance + toWithdraw.amount;
            newAcc[position.to.symbol][position.chainId].balanceUSD =
              newAcc[position.to.symbol][position.chainId].balanceUSD + parseFloat(toWithdraw.amountInUSD || '0');
          }
        }

        return newAcc;
      }, {}),
    [positions.length]
  );

  const tokensCount = React.useMemo(() => {
    const tokenSymbols = Object.keys(tokensCountRaw);

    let rawCounts = tokenSymbols.map((tokenSymbol) => {
      let summedBalanceUsd = 0;
      let summedRawBalance = 0n;
      const chains = Object.keys(tokensCountRaw[tokenSymbol]);

      const valuePerChain = chains.reduce<Record<string, ChainBreakdown>>((acc, chainKey) => {
        return {
          ...acc,
          [chainKey]: {
            balance: tokensCountRaw[tokenSymbol][Number(chainKey)].balance,
            balanceUSD: tokensCountRaw[tokenSymbol][Number(chainKey)].balanceUSD,
          },
        };
      }, {});

      chains.forEach((chain) => {
        const pointBalance = valuePerChain[chain];

        if (!pointBalance || !pointBalance.balance) {
          return;
        }

        summedBalanceUsd += pointBalance.balanceUSD;
        summedRawBalance = summedRawBalance + pointBalance.balance;
      });

      return {
        name: tokenSymbol,
        value: summedBalanceUsd,
        summedRawBalance,
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
              summedBalanceUsd: count.value,
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
        other.summedRawBalance = other.summedRawBalance + count.summedRawBalance;
        other.chains = union(other.chains, count.chains);
        other.tokens = [...(other.tokens || []), count.token.symbol];
        other.tokensBreakdown = {
          ...(other.tokensBreakdown || {}),
          [count.token.symbol]: {
            summedBalanceUsd: count.value,
            summedRawBalance: count.summedRawBalance,
            decimals: count.token.decimals,
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        other.valuePerChain = mergeWith(
          other.valuePerChain,
          count.valuePerChain,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          (value, srcValue) => (value || 0n) + (srcValue || 0n)
        );

        newAcc[4] = other;
      }

      return newAcc;
    }, []);

    const totalUSDAmount = filteredRawCounts.reduce((acc, value) => acc + value.value, 0);

    return orderBy(
      filteredRawCounts.map((val) => {
        const relativeLength = (val.value * 100) / totalUSDAmount;
        const relativeLengthToShow = (val.value * 100) / totalUSDAmount;

        return { ...val, relativeLength, relativeLengthToShow };
      }),
      'count',
      'desc'
    ).map((count, index) => ({
      ...count,
      fill:
        colors[mode].accent[COLOR_PRIORITIES[index]] ||
        colors[mode].accent[COLOR_PRIORITIES[COLOR_PRIORITIES.length - 1]],
    }));
  }, [tokensCountRaw]);

  const totalUSDAmount = React.useMemo(() => tokensCount.reduce((acc, value) => acc + value.value, 0), [tokensCount]);

  return (
    <StyledCountDashboardContainer container breakpoint={currentBreakPoint}>
      <Grid item xs={12} sx={{ paddingBottom: '10px' }}>
        <Typography variant="body" sx={{ fontWeight: 500 }}>
          <FormattedMessage description="generatedDashboard" defaultMessage="Total value" />
        </Typography>
      </Grid>
      {!tokensCount.length && (
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="body">
            <FormattedMessage
              description="generatedDashboardNoValuePart1"
              defaultMessage="There are no funds currently deposited in Mean Finance"
            />
          </Typography>
          <Typography variant="body">
            <StyledButton variant="text" onClick={handleGoToCreatePosition}>
              <Typography variant="body">
                <FormattedMessage description="generatedDashboardNoValueAction" defaultMessage="Create a position" />
              </Typography>
            </StyledButton>
            <FormattedMessage description="generatedDashboardNoValuePart2" defaultMessage="to start investing now!" />
          </Typography>
        </Grid>
      )}
      {!!tokensCount.length && (
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
                    fill={colors[mode].violet.violet200}
                  >
                    {tokensCount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                    <Label
                      value={`$${usdFormatter(totalUSDAmount)}`}
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
                      color={baseColors.white}
                      fill={baseColors.white}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Hidden>
          <StyledGrid item xs={12} md={7}>
            <StyledLabelContainer>
              {tokensCount.map((positionCountLabel) => (
                <Grid
                  container
                  alignItems="center"
                  onMouseOver={(event) => {
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
                    <StyledTypography variant="bodySmall" disabled={positionCountLabel.summedRawBalance <= 0n}>
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
                    <Typography variant="bodySmall">
                      {!positionCountLabel.isOther
                        ? formatCurrencyAmount(positionCountLabel.summedRawBalance, positionCountLabel.token, 4)
                        : `$${positionCountLabel.value.toFixed(2)}`}
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
