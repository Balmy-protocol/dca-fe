import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function usePushToHistory() {
  const history = useHistory();
  const location = useLocation();

  return React.useCallback((path: string) => history.push(`${path}${location.search}`), [history, location]);
}

export default usePushToHistory;
