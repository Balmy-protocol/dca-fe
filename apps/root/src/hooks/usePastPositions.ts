import usePositionService from './usePositionService';
import PositionService, { PositionServiceData } from '@services/positionService';
import useServiceEvents from './useServiceEvents';

function usePastPositions() {
  const positionService = usePositionService();

  const pastPositions = useServiceEvents<PositionServiceData, PositionService, 'getPastPositions'>(
    positionService,
    'getPastPositions'
  );

  const hasFetchedPastPositions = useServiceEvents<PositionServiceData, PositionService, 'getHasFetchedPastPositions'>(
    positionService,
    'getHasFetchedPastPositions'
  );

  return { pastPositions, hasFetchedPastPositions };
}

export default usePastPositions;
