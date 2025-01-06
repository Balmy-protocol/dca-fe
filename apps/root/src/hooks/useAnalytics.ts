import React from 'react';
import useEventService from './useEventService';
import type { AnalyticsData } from '../services/analyticsService';

function useAnalytics() {
  const eventService = useEventService();

  const trackEvent = React.useCallback(
    (action: string, extraData?: Record<string | number, unknown>) => {
      try {
        void eventService.trackEvent(action, extraData);
      } catch {}
    },
    [eventService]
  );

  const setPeopleProperty = React.useCallback(
    (properties: AnalyticsData) => {
      eventService.setPeopleProperty(properties);
    },
    [eventService]
  );

  const setOnceProperty = React.useCallback(
    (properties: AnalyticsData) => {
      eventService.setOnceProperty(properties);
    },
    [eventService]
  );

  const unsetProperty = React.useCallback(
    (propertyName: string | string[]) => {
      eventService.unsetProperty(propertyName);
    },
    [eventService]
  );

  const incrementProperty = React.useCallback(
    (properties: AnalyticsData) => {
      eventService.incrementProperty(properties);
    },
    [eventService]
  );

  const appendProperty = React.useCallback(
    (properties: AnalyticsData) => {
      eventService.appendProperty(properties);
    },
    [eventService]
  );

  const unionProperty = React.useCallback(
    (properties: AnalyticsData) => {
      eventService.unionProperty(properties);
    },
    [eventService]
  );

  return {
    trackEvent,
    setPeopleProperty,
    setOnceProperty,
    unsetProperty,
    incrementProperty,
    appendProperty,
    unionProperty,
  };
}

export default useAnalytics;
