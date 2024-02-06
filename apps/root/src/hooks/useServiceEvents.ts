import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EventsManager } from '@services/eventsManager';

function useServiceEvents<ServiceData, ServiceType extends EventsManager<ServiceData>, Key extends keyof ServiceType>(
  service: ServiceType,
  property: Key
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type PropertyValue = ServiceType[Key] extends (...args: any[]) => any
    ? ReturnType<ServiceType[Key]>
    : ServiceType[Key];
  const getServicePropertyData = () => (service[property] as () => PropertyValue).bind(service) as PropertyValue;

  const [serviceData, setServiceData] = React.useState<PropertyValue>(getServicePropertyData());

  React.useEffect(() => {
    const callbackId = uuidv4();
    service.setCallback(callbackId, () => setServiceData(getServicePropertyData()));
    return () => {
      service.removeCallback(callbackId);
    };
  }, []);

  return serviceData;
}

export default useServiceEvents;
