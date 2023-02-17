import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function useReplaceHistory() {
  const history = useHistory();
  const location = useLocation();

  return React.useCallback((path: string) => history.replace(`${path}${location.search}`), [history, location]);
}

export default useReplaceHistory;
