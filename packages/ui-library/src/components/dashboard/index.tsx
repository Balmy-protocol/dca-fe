import React, { useMemo, useState } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import { BackgroundPaper, ContainerBox, Grid, Popper, Typography, Skeleton, Hidden, HiddenNumber } from '..';
import { LinearProgress, linearProgressClasses, useTheme } from '@mui/material';
import { colors } from '../../theme';
import DashboardPopper from './popper';
import { formatUsdAmount } from '../../common/utils/currency';
import { useIntl } from 'react-intl';

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing, palette } }) => `
    padding: ${spacing(5)};
    border-color: ${colors[palette.mode].border.border2};
  `}
  display: flex;
  flex: 1;
`;

const StyledBullet = styled.div<{ fill: string }>`
  ${({ fill, theme: { spacing } }) => `
    width: ${spacing(2)};
    height: ${spacing(2)};
    border-radius: ${spacing(10)};
    ${fill && `background-color: ${fill};`}}
  `}
`;

const BorderLinearProgress = styled(LinearProgress)<{ fill: string }>(
  ({
    theme: {
      palette: { mode },
      spacing,
    },
    fill,
  }) => ({
    background: colors[mode].background.primary,
    height: spacing(2),
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: spacing(3),
      background: fill,
    },
  })
);

const StyledContainerBox = styled(ContainerBox)`
  .recharts-sector {
    outline: none;
  }
`;
interface BaseData {
  name: string;
  value: number;
}

interface OtherData extends BaseData {
  breakdown: Data[];
  isOther: true;
}

type Data = BaseData | OtherData;

interface DashboardProps {
  data: Data[];
  withPie?: boolean;
  valuesForOther?: number;
  valueFormatter?: (value: number) => string;
  showBalances?: boolean;
}

type DataWithFill = Data & {
  fill: string;
  relativeValue: number;
};

export const CHART_COLOR_PRIORITIES = {
  dark: [
    colors.dark.aqua.aqua700,
    colors.dark.aqua.aqua600,
    colors.dark.aqua.aqua400,
    colors.dark.aqua.aqua300,
    colors.dark.aqua.aqua200,
  ],
  light: [
    colors.light.accent.accent600,
    colors.light.accent.primary,
    colors.light.accent.accent400,
    colors.light.accent.accent200,
    colors.light.accent.accent100,
  ],
};

const Dashboard = ({
  data,
  withPie,
  valuesForOther = 4,
  valueFormatter: passedValueFormatter,
  showBalances = true,
}: DashboardProps) => {
  const {
    palette: { mode },
  } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showPopper, setShowPopper] = useState(false);
  const intl = useIntl();

  const handlePopperElOver = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowPopper(true);
  };
  const handlePopperElOut = () => {
    setAnchorEl(null);
    setShowPopper(false);
  };

  const valueFormatter = passedValueFormatter ?? ((value: number) => formatUsdAmount({ amount: value, intl }));

  const mappedData = useMemo(() => {
    const orderedData = orderBy(data, ['value'], ['desc']);
    let totalValue = 0;

    const dataWithBreakdown = orderedData.reduce<Data[]>((acc, dataPoint) => {
      totalValue += dataPoint.value;
      if (acc.length < valuesForOther) {
        acc.push(dataPoint);
      } else if (acc.length === valuesForOther && orderedData.length > valuesForOther + 1) {
        acc.push({
          name: 'Other',
          value: dataPoint.value,
          isOther: true,
          breakdown: [dataPoint],
        });
      } else if (acc.length > valuesForOther) {
        const other: OtherData = {
          ...acc[valuesForOther],
        } as OtherData;

        other.value += dataPoint.value;
        other.breakdown = [...other.breakdown, dataPoint];

        // eslint-disable-next-line no-param-reassign
        acc[valuesForOther] = other;
      }

      return acc;
    }, []);

    return dataWithBreakdown.map<DataWithFill>((dataPoint, index) => ({
      ...dataPoint,
      fill:
        CHART_COLOR_PRIORITIES[mode][index] || CHART_COLOR_PRIORITIES[mode][CHART_COLOR_PRIORITIES[mode].length - 1],
      relativeValue: (dataPoint.value * 100) / totalValue,
    }));
  }, [data, valuesForOther, mode]);

  const pieValue = mappedData.reduce((acc, dataPoint) => acc + dataPoint.value, 0);
  return (
    <ContainerBox gap={6} flex={1}>
      {withPie && (
        <Hidden mdDown>
          <StyledContainerBox>
            <ResponsiveContainer minHeight={150} minWidth={150} height="100%">
              <PieChart>
                <Pie
                  data={mappedData}
                  dataKey="value"
                  innerRadius={65}
                  paddingAngle={1}
                  outerRadius={75}
                  cursor="pointer"
                  fill={colors[mode].violet.violet200}
                >
                  {mappedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                  ))}
                  <Label
                    value={showBalances ? valueFormatter(pieValue) : '-'}
                    position="center"
                    fontSize="0.875rem"
                    fontWeight={700}
                    fontFamily="Inter"
                    color={colors[mode].typography.typo2}
                    fill={colors[mode].typography.typo2}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </StyledContainerBox>
        </Hidden>
      )}
      <StyledBackgroundPaper variant="outlined">
        <ContainerBox flexDirection="column" alignSelf="stretch" flex={1} justifyContent="space-around">
          {mappedData.map((dataPoint) => (
            <Grid
              container
              alignItems="center"
              onMouseOver={(event) => {
                if ('isOther' in dataPoint) {
                  handlePopperElOver(event);
                }
              }}
              onMouseOut={() => {
                if ('isOther' in dataPoint) {
                  handlePopperElOut();
                }
              }}
              key={dataPoint.name}
            >
              <Grid item xs={1}>
                <StyledBullet fill={dataPoint.fill} />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="bodySmallRegular">{dataPoint.name}</Typography>
              </Grid>
              <Grid item flex={1}>
                {'isOther' in dataPoint && (
                  <Popper id="other-popper" open={showPopper} anchorEl={anchorEl}>
                    <DashboardPopper breakdown={dataPoint.breakdown} valueFormatter={valueFormatter} />
                  </Popper>
                )}
                <BorderLinearProgress variant="determinate" value={dataPoint.relativeValue} fill={dataPoint.fill} />
              </Grid>
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="bodySmallRegular">
                  {showBalances ? valueFormatter(dataPoint.value) : <HiddenNumber size="small" />}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </ContainerBox>
      </StyledBackgroundPaper>
    </ContainerBox>
  );
};

const skeletonRows = Array.from(Array(3).keys());

const DashboardSkeleton = ({ withPie }: { withPie?: DashboardProps['withPie'] }) => {
  return (
    <ContainerBox gap={6} flex={1}>
      {withPie && <Skeleton variant="circular" width={150} height={150} />}
      <StyledBackgroundPaper variant="outlined">
        <ContainerBox flexDirection="column" alignSelf="stretch" flex={1} justifyContent="space-around">
          {skeletonRows.map((key) => (
            <Grid container alignItems="center" key={key} columnSpacing={3}>
              <Grid item xs={1}>
                <Skeleton variant="rounded" />
              </Grid>
              <Grid item xs={3}>
                <Skeleton variant="text" animation="wave" />
              </Grid>
              <Grid item flex={1}>
                <Skeleton variant="text" animation="wave" />
              </Grid>
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Skeleton variant="text" animation="wave" />
              </Grid>
            </Grid>
          ))}
        </ContainerBox>
      </StyledBackgroundPaper>
    </ContainerBox>
  );
};

export { Dashboard, DashboardProps, DashboardSkeleton };
