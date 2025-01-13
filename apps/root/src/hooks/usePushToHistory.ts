import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

function usePushToHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  return React.useCallback(
    (path: string) => {
      setSearchParams([]);
      navigate(`${path}`, { state: { from: location.pathname } });
    },
    [navigate, location]
  );
}

export default usePushToHistory;
