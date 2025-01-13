import React from 'react';
import useAnalytics from '@hooks/useAnalytics';
import { Navigate, Params, useParams } from 'react-router-dom';

export interface RedirectProps {
  to: string;
  oldRoute: string;
}

// 'to' path is received as /path/:key, this function replaces :key with the value from the params object
const updateTo = (to: string, params: Readonly<Params<string>>) => {
  const entries = Object.entries(params);
  let path = `${to}`;

  entries.forEach(([key, value]) => {
    // Replace :key or :key? with value
    if (path.includes(`:${key}?`)) {
      path = path.replace(`:${key}?`, value || '');
    } else if (path.includes(`:${key}`)) {
      path = path.replace(`:${key}`, value || '');
    }
  });

  // remove optional params :key? that were not provided
  path = path.replace(/\/?:\w+\?/g, '');

  return path;
};

// Function usefull for routes close to be deprecated
const RedirectOldRoute = ({ to, oldRoute }: RedirectProps) => {
  const params = useParams();
  const { trackEvent } = useAnalytics();

  React.useEffect(() => {
    trackEvent('Redirect old route', { oldRoute, newRoute: to });
  }, []);

  return React.useMemo(() => <Navigate to={updateTo(to, params)} replace />, [to, params]);
};

export default RedirectOldRoute;
