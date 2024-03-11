import React from 'react';
import find from 'lodash/find';
import { Typography, colors, ContainerBox, Dashboard } from 'ui-library';
import useCurrentPositions from '@hooks/useCurrentPositions';
import { NETWORKS } from '@constants';

import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';

type PositionCountRaw = Record<string, number>;

const CountDashboard = () => {
  const positions = useCurrentPositions();
  const mode = useThemeMode();
  const positionsCount = React.useMemo(
    () =>
      positions.reduce<PositionCountRaw>((acc, position) => {
        const newAcc: PositionCountRaw = {
          ...acc,
        };

        if (newAcc[position.chainId]) {
          newAcc[position.chainId] += 1;
        } else {
          newAcc[position.chainId] = 1;
        }

        return newAcc;
      }, {}),
    [positions.length]
  );

  const positionCounts = React.useMemo(() => {
    const chainIds = Object.keys(positionsCount);
    return chainIds.map((chainId) => {
      const supportedNetwork = find(NETWORKS, { chainId: Number(chainId) })!;

      return {
        name: supportedNetwork.name,
        value: positionsCount[chainId],
      };
    });
  }, [positionsCount]);

  return (
    <ContainerBox flexDirection="column" alignItems="stretch" flex={1} gap={3} style={{ height: '100%' }}>
      <Typography variant="h6" fontWeight={700} color={colors[mode].typography.typo2}>
        <FormattedMessage description="onGoingPositionsDashboard" defaultMessage="Ongoing positions" />
      </Typography>
      <Dashboard data={positionCounts} withPie={false} />
    </ContainerBox>
  );
};
export default CountDashboard;
