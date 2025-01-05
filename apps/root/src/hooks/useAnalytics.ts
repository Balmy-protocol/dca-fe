import React from 'react';
import useEventService from './useEventService';

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
    (properties: Record<string, any>) => {
      eventService.setPeopleProperty(properties);
    },
    [eventService]
  );

  const setOnceProperty = React.useCallback(
    (properties: Record<string, any>) => {
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
    (properties: Record<string, any>) => {
      eventService.incrementProperty(properties);
    },
    [eventService]
  );

  const appendProperty = React.useCallback(
    (properties: Record<string, any>) => {
      eventService.appendProperty(properties);
    },
    [eventService]
  );

  const unionProperty = React.useCallback(
    (properties: Record<string, any>) => {
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
