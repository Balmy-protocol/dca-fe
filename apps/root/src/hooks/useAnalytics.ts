import React from 'react';
import useAnalyticsService from './useAnalyticsService';
import type { AnalyticsData } from '../services/analyticsService';

function useAnalytics() {
  const analyticsService = useAnalyticsService();

  const trackEvent = React.useCallback(
    (action: string, extraData?: Record<string | number, unknown>) => {
      try {
        void analyticsService.trackEvent(action, extraData);
      } catch {}
    },
    [analyticsService]
  );

  const setPeopleProperty = React.useCallback(
    (properties: AnalyticsData) => {
      analyticsService.setPeopleProperty(properties);
    },
    [analyticsService]
  );

  const setOnceProperty = React.useCallback(
    (properties: AnalyticsData) => {
      analyticsService.setOnceProperty(properties);
    },
    [analyticsService]
  );

  const unsetProperty = React.useCallback(
    (propertyName: string | string[]) => {
      analyticsService.unsetProperty(propertyName);
    },
    [analyticsService]
  );

  const incrementProperty = React.useCallback(
    (properties: AnalyticsData) => {
      analyticsService.incrementProperty(properties);
    },
    [analyticsService]
  );

  const appendProperty = React.useCallback(
    (properties: AnalyticsData) => {
      analyticsService.appendProperty(properties);
    },
    [analyticsService]
  );

  const unionProperty = React.useCallback(
    (properties: AnalyticsData) => {
      analyticsService.unionProperty(properties);
    },
    [analyticsService]
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
