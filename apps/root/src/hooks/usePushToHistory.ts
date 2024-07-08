import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function usePushToHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  return React.useCallback(
    (path: string) => navigate(`${path}${location.search}`, { state: { from: location.pathname } }),
    [navigate, location]
  );
}

export default usePushToHistory;
