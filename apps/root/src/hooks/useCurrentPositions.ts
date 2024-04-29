import usePositionService from './usePositionService';
import PositionService, { PositionServiceData } from '@services/positionService';
import useServiceEvents from './useServiceEvents';

function useCurrentPositions() {
  const positionService = usePositionService();

  const currentPositions = useServiceEvents<PositionServiceData, PositionService, 'getCurrentPositions'>(
    positionService,
    'getCurrentPositions'
  );

  const hasFetchedCurrentPositions = useServiceEvents<
    PositionServiceData,
    PositionService,
    'getHasFetchedCurrentPositions'
  >(positionService, 'getHasFetchedCurrentPositions');

  return { currentPositions, hasFetchedCurrentPositions };
}

export default useCurrentPositions;
