import usePositionService from './usePositionService';
import PositionService, { PositionServiceData } from '@services/positionService';
import useServiceEvents from './useServiceEvents';

function useUserHasPositions() {
  const positionService = usePositionService();

  const userHasPositions = useServiceEvents<PositionServiceData, PositionService, 'getUserHasPositions'>(
    positionService,
    'getUserHasPositions'
  );
  const hasFetchedUserHasPositions = useServiceEvents<
    PositionServiceData,
    PositionService,
    'getHasFetchedUserHasPositions'
  >(positionService, 'getHasFetchedUserHasPositions');

  return { userHasPositions, hasFetchedUserHasPositions };
}

export default useUserHasPositions;
