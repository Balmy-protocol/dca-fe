import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EventsManager } from '@services/eventsManager';

function useServiceEvents<ServiceData, ServiceType extends EventsManager<ServiceData>>(
  service: ServiceType,
  property: keyof ServiceData
) {
  const [serviceData, setServiceData] = React.useState<ServiceData>(service.serviceData);

  React.useEffect(() => {
    const callbackId = uuidv4();
    service.setCallback(callbackId, setServiceData);
    return () => {
      service.removeCallback(callbackId);
    };
  }, []);

  return serviceData[property];
}

export default useServiceEvents;
