import React from 'react';
import useEventService from './useEventService';

function useTrackEvent() {
  const eventService = useEventService();

  return React.useCallback(
    (action: string, extraData?: Record<string | number, unknown>) => {
      // eslint-disable-next-line no-void
      try {
        void eventService.trackEvent(action, extraData);
        // We dont care if this fails but we dont want to block where its being used
      } catch {}
    },
    [eventService]
  );
}

export default useTrackEvent;
