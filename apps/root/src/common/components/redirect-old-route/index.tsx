import React from 'react';
import useTrackEvent from '@hooks/useTrackEvent';
import { Navigate, Params, useParams } from 'react-router-dom';

export interface RedirectProps {
  to: string;
  oldRoute: string;
}

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

const RedirectOldRoute = ({ to, oldRoute }: RedirectProps) => {
  const params = useParams();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    trackEvent('Redirect old route', { oldRoute, newRoute: to });
  }, []);

  return <Navigate to={updateTo(to, params)} replace />;
};

export default RedirectOldRoute;
