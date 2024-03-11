import React from 'react';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import { Grid, Typography, LinearProgress, createStyles, colors, BackgroundPaper, ContainerBox } from 'ui-library';
import styled from 'styled-components';
import useCurrentPositions from '@hooks/useCurrentPositions';
import { NETWORKS } from '@constants';
import { withStyles } from 'tss-react/mui';

import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)};
  `}
  display: flex;
  flex: 1;
`;

const StyledSwapsLinearProgress = styled(LinearProgress)<{ fill: string }>``;

const StyledBullet = styled.div<{ fill: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50px;
  ${({ fill }) => fill && `background-color: ${fill};`}
`;

const BorderLinearProgress = withStyles(StyledSwapsLinearProgress, ({ palette: { mode }, spacing }, { fill }) =>
  createStyles({
    root: {
      height: 8,
      borderRadius: 10,
      background: colors[mode].background.primary,
    },
    bar1Determinate: {
      borderRadius: spacing(3),
      background: fill,
    },
  })
);

interface ChainCounter extends Record<string, number> {
  count: number;
}

type PositionCountRaw = Record<string, ChainCounter>;

const COLOR_PRIORITIES: (keyof (typeof colors)['dark' | 'light']['accent'])[] = [
  'accent600',
  'primary',
  'accent400',
  'accent200',
  'accent100',
];

const CountDashboard = () => {
  const positions = useCurrentPositions();
  const mode = useThemeMode();
  const positionsCount = React.useMemo(() => {
    const reducedPositions = positions.reduce<PositionCountRaw>((acc, position) => {
      const newAcc: PositionCountRaw = {
        ...acc,
      };

      if (newAcc[position.chainId]) {
        if (position.remainingLiquidity.amount > 0n) {
          if (newAcc[position.chainId][position.from.symbol]) {
            newAcc[position.chainId][position.from.symbol] += 1;
          } else {
            newAcc[position.chainId][position.from.symbol] = 1;
          }
        }
        if (position.toWithdraw.amount > 0n) {
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
        if (position.remainingLiquidity.amount > 0n) {
          newAcc[position.chainId][position.from.symbol] = 1;
        }
        if (position.toWithdraw.amount > 0n) {
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

  const totalPositions = React.useMemo(
    () => positionsCount.reduce((acc, value) => acc + value.value, 0),
    [positionsCount]
  );

  const positionsCountLabels = React.useMemo(
    () =>
      orderBy(
        positionsCount.map((value) => {
          const relativeLength = (value.value * 100) / totalPositions;

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const supportedNetwork = find(NETWORKS, { chainId: Number(value.name) })!;

          const count = value.value;

          const relativeLengthToShow = (count * 100) / totalPositions;

          return {
            chain: supportedNetwork,
            relativeLength,
            relativeLengthToShow,
            fullCount: value.value,
            count,
          };
        }),
        'fullCount',
        'desc'
      ).map((count, index) => ({
        ...count,
        fill:
          colors[mode].accent[COLOR_PRIORITIES[index]] ||
          colors[mode].accent[COLOR_PRIORITIES[COLOR_PRIORITIES.length - 1]],
      })),
    [positionsCount]
  );

  return (
    <ContainerBox flexDirection="column" alignItems="stretch" flex={1} gap={3} style={{ height: '100%' }}>
      <Typography variant="h6" fontWeight={700} color={colors[mode].typography.typo2}>
        <FormattedMessage description="onGoingPositionsDashboard" defaultMessage="Ongoing positions" />
      </Typography>
      <StyledBackgroundPaper variant="outlined">
        <ContainerBox flexDirection="column" alignSelf="stretch" flex={1} justifyContent="space-around">
          {positionsCountLabels.map((positionCountLabel) => (
            <Grid container alignItems="center" key={positionCountLabel.chain.chainId}>
              <Grid item xs={1}>
                <StyledBullet fill={positionCountLabel.fill} />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="bodySmall" fontWeight={500}>
                  {positionCountLabel.chain.name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <BorderLinearProgress
                  variant="determinate"
                  value={positionCountLabel.relativeLengthToShow}
                  valueBuffer={positionCountLabel.relativeLength}
                  fill={positionCountLabel.fill}
                />
              </Grid>
              <Grid item xs={1} sx={{ textAlign: 'right' }}>
                <Typography variant="bodySmall">{positionCountLabel.count}</Typography>
              </Grid>
            </Grid>
          ))}
        </ContainerBox>
      </StyledBackgroundPaper>
    </ContainerBox>
  );
};
export default CountDashboard;
