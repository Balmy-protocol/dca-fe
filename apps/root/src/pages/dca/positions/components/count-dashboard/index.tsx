import React from 'react';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import { Grid, Hidden, Typography, LinearProgress, createStyles } from 'ui-library';
import styled from 'styled-components';
import intersection from 'lodash/intersection';
import useCurrentPositions from '@hooks/useCurrentPositions';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { NETWORKS } from '@constants';
import { withStyles } from 'tss-react/mui';
import { BigNumber } from 'ethers';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';

const StyledTypography = styled(Typography)<{ disabled: boolean }>`
  ${({ disabled }) => disabled && 'color: rgba(255, 255, 255, 0.5);'}
  font-weight: 500;
`;

const StyledCountDashboardContainer = styled(Grid)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  ${({ breakpoint }) => (breakpoint !== 'xs' ? 'min-height: 190px;' : '')}

  .label-top {
    transform: translateY(20px);
  }
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

const StyledBullet = styled.div<{ fill: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50px;
  ${({ fill }) => fill && `background-color: ${fill};`}
`;

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
      background: 'rgba(255, 255, 255, 0.5)',
    },
  })
);

interface CountDashboardProps {
  selectedChain: null | number;
  onSelectChain: (chain: number | null) => void;
  selectedTokens: string[] | null;
}

interface ChainCounter extends Record<string, number> {
  count: number;
}

type PositionCountRaw = Record<string, ChainCounter>;

const CountDashboard = ({ selectedChain, onSelectChain, selectedTokens }: CountDashboardProps) => {
  const positions = useCurrentPositions();
  const intl = useIntl();
  const currentBreakpoint = useCurrentBreakpoint();
  const positionsCountRaw = React.useMemo(() => {
    const reducedPositions = positions.reduce<PositionCountRaw>((acc, position) => {
      const newAcc: PositionCountRaw = {
        ...acc,
      };

      if (newAcc[position.chainId]) {
        if (position.remainingLiquidity.gt(BigNumber.from(0))) {
          if (newAcc[position.chainId][position.from.symbol]) {
            newAcc[position.chainId][position.from.symbol] += 1;
          } else {
            newAcc[position.chainId][position.from.symbol] = 1;
          }
        }
        if (position.toWithdraw.gt(BigNumber.from(0))) {
          if (newAcc[position.chainId][position.to.symbol]) {
            newAcc[position.chainId][position.to.symbol] += 1;
          } else {
            newAcc[position.chainId][position.to.symbol] = 1;
          }
        }

        newAcc[position.chainId].count += 1;
      } else {
        newAcc[position.chainId] = {
          count: 1,
        };
        if (position.remainingLiquidity.gt(BigNumber.from(0))) {
          newAcc[position.chainId][position.from.symbol] = 1;
        }
        if (position.toWithdraw.gt(BigNumber.from(0))) {
          newAcc[position.chainId][position.to.symbol] = 1;
        }
      }

      return newAcc;
    }, {});

    return Object.keys(reducedPositions).map((chainIdKey) => ({
      name: chainIdKey,
      value: reducedPositions[chainIdKey].count,
      positions: reducedPositions[chainIdKey],
    }));
  }, [positions.length]);

  const positionsCount = React.useMemo(
    () =>
      positionsCountRaw.map((positionCount) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const supportedNetwork = find(NETWORKS, { chainId: Number(positionCount.name) })!;
        let fill = supportedNetwork.mainColor || 'linear-gradient(90deg, #3076F6 0%, #B518FF 123.4%)';

        if (selectedChain && Number(positionCount.name) !== selectedChain) {
          fill = 'rgba(255, 255, 255, 0.5)';
        }

        const positionSymbols = Object.keys(positionCount.positions);
        const selected = (selectedTokens && intersection(positionSymbols, selectedTokens)) || [];
        if (selectedTokens && selected.length === 0) {
          fill = 'rgba(255, 255, 255, 0.5)';
        }

        return {
          ...positionCount,
          fill,
        };
      }),
    [selectedChain, positionsCountRaw, selectedTokens]
  );

  const totalPositions = React.useMemo(
    () => positionsCount.reduce((acc, value) => acc + value.value, 0),
    [positionsCount]
  );

  const shownTotalPositions = React.useMemo(
    () =>
      positionsCount.reduce((acc, value) => {
        if (!selectedChain && !selectedTokens) {
          return acc + value.value;
        }

        const positionSymbols = Object.keys(value.positions);

        if (selectedChain && Number(value.name) === selectedChain) {
          return acc + value.value;
        }

        const selected = (selectedTokens && intersection(positionSymbols, selectedTokens)) || [];
        if (selected.length !== 0) {
          let summed = acc;
          selected.forEach((selectedToken) => {
            summed += value.positions[selectedToken];
          });
          return summed;
          // return acc + value.positions[selectedTokens];
        }

        return acc;
      }, 0),
    [positionsCount, selectedChain, selectedTokens]
  );

  const positionsCountLabels = React.useMemo(
    () =>
      orderBy(
        positionsCount.map((value) => {
          const relativeLength = (value.value * 100) / totalPositions;

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const supportedNetwork = find(NETWORKS, { chainId: Number(value.name) })!;

          let count = value.value;

          if (selectedTokens) {
            count = Object.keys(value.positions).reduce((acc, positionKey) => {
              if (selectedTokens.includes(positionKey)) {
                return acc + value.positions[positionKey];
              }
              return acc;
            }, 0);
          }

          const relativeLengthToShow = (count * 100) / totalPositions;

          return {
            chain: supportedNetwork,
            relativeLength,
            relativeLengthToShow,
            fullCount: value.value,
            count,
            fill: value.fill,
          };
        }),
        'fullCount',
        'desc'
      ),
    [positionsCount, selectedTokens]
  );

  return (
    <StyledCountDashboardContainer container breakpoint={currentBreakpoint}>
      <Grid item xs={12} sx={{ paddingBottom: '10px' }}>
        <Typography variant="body" sx={{ fontWeight: 500 }}>
          <FormattedMessage description="onGoingPositionsDashboard" defaultMessage="Ongoing positions" />
        </Typography>
      </Grid>
      <Hidden smDown>
        <Grid item xs={12} md={5}>
          <ResponsiveContainer>
            <PieChart height={150}>
              <Pie
                data={positionsCount}
                dataKey="value"
                innerRadius={65}
                paddingAngle={1}
                outerRadius={75}
                fill="#8884d8"
                onMouseOver={(data: { name: string }) => onSelectChain(Number(data.name))}
                onMouseOut={() => onSelectChain(null)}
                cursor="pointer"
              >
                {positionsCount.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                ))}

                <Label
                  value={shownTotalPositions}
                  position="centerBottom"
                  fontSize="2.125rem"
                  fontWeight={400}
                  offset={-10}
                  letterSpacing="0.0075em"
                  color="white"
                  fill="white"
                />
                <Label
                  value={intl.formatMessage(
                    defineMessage({ description: 'countDashboardPositions', defaultMessage: 'Positions' })
                  )}
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
          {positionsCountLabels.map((positionCountLabel) => (
            <Grid
              container
              alignItems="center"
              sx={{ cursor: 'pointer' }}
              onMouseOut={() => onSelectChain(null)}
              onMouseOver={() => onSelectChain(positionCountLabel.chain.chainId)}
              key={positionCountLabel.chain.chainId}
            >
              <Grid item xs={1}>
                <StyledBullet fill={positionCountLabel.fill} />
              </Grid>
              <Grid item xs={4}>
                <StyledTypography
                  variant="bodySmall"
                  disabled={
                    !positionCountLabel.count || (!!selectedChain && positionCountLabel.chain.chainId !== selectedChain)
                  }
                >
                  {positionCountLabel.chain.name}
                </StyledTypography>
              </Grid>
              <Grid item xs={5}>
                <BorderLinearProgress
                  variant="buffer"
                  value={positionCountLabel.relativeLengthToShow}
                  valueBuffer={positionCountLabel.relativeLength}
                  fill={positionCountLabel.fill}
                />
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}>
                <Typography variant="bodySmall">{positionCountLabel.count}</Typography>
              </Grid>
            </Grid>
          ))}
        </StyledLabelContainer>
      </StyledGrid>
    </StyledCountDashboardContainer>
  );
};
export default CountDashboard;
