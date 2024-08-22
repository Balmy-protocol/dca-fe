import React from 'react';
import useEarnPositions from './earn/useEarnPositions';

function useUserHasEarnPositions() {
  const { userStrategies } = useEarnPositions();

  return React.useMemo(() => userStrategies.length > 0, [userStrategies.length]);
}

export default useUserHasEarnPositions;
