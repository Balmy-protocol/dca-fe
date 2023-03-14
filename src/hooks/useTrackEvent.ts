import React from 'react';
import useEventService from './useEventService';

function useTrackEvent() {
  const eventService = useEventService();

  return React.useCallback(
    (action: string, extraData?: Record<string | number, unknown>) => {
      // eslint-disable-next-line no-void
      void eventService.trackEvent(action, extraData);
    },
    [eventService]
  );
}

export default useTrackEvent;
