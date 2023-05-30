import React from 'react';
import Grid from '@mui/material/Grid';
import usePastPositions from '@hooks/usePastPositions';
import EmptyPositions from '@pages/dca/components/empty-positions';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import usePositionService from '@hooks/usePositionService';
import PastPosition from './components/position';

const History = () => {
  const pastPositions = usePastPositions();
  const positionService = usePositionService();
  const [hasLoadedPositions, setHasLoadedPositions] = React.useState(positionService.getHasFetchedPastPositions());

  React.useEffect(() => {
    const fetchPositions = async () => {
      await positionService.fetchPastPositions();
      setHasLoadedPositions(true);
    };

    if (!hasLoadedPositions) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPositions();
    }
  }, []);

  if (!hasLoadedPositions) {
    return <CenteredLoadingIndicator size={70} />;
  }

  if (pastPositions && !pastPositions.length) {
    return <EmptyPositions isClosed />;
  }
  return (
    <Grid container direction="column" alignItems="flex-start" justifyContent="center" spacing={3}>
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container alignItems="stretch" spacing={2}>
          {pastPositions.map((position) => (
            <Grid item xs={12} sm={6} md={4} key={position.id}>
              <PastPosition position={position} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default History;
