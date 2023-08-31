import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useReplaceHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  return React.useCallback((path: string) => navigate(`${path}${location.search}`), [navigate, location]);
}

export default useReplaceHistory;
