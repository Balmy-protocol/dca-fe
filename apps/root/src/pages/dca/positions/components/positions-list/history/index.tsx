import React from 'react';
import { Grid } from 'ui-library';
import usePastPositions from '@hooks/usePastPositions';
import EmptyPositions from '@pages/dca/components/empty-positions';
import usePositionService from '@hooks/usePositionService';
import { PositionCardSkeleton, TerminatedPosition } from '../position-card';

const History = () => {
  const { pastPositions } = usePastPositions();
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

  if (pastPositions && !pastPositions.length && hasLoadedPositions) {
    return <EmptyPositions isClosed />;
  }
  return (
    <Grid container spacing={12.5}>
      {!hasLoadedPositions
        ? Array.from(Array(6).keys()).map((i) => (
            <Grid item xs={12} sm={6} key={i}>
              <PositionCardSkeleton />
            </Grid>
          ))
        : pastPositions.map((position) => (
            <Grid item xs={12} sm={6} key={position.id}>
              <TerminatedPosition position={position} />
            </Grid>
          ))}
    </Grid>
  );
};
export default History;
