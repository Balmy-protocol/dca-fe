import { SetStateCallback } from 'common-types';

type EventCallback<T> = SetStateCallback<T>;

export class EventsManager<T> {
  private _serviceData: T;

  private eventCallbacks: Record<string, EventCallback<T>>;

  constructor(initialserviceData: T) {
    this._serviceData = initialserviceData;
    this.eventCallbacks = {};
  }

  get serviceData(): T {
    return this._serviceData;
  }

  set serviceData(newServiceData: T) {
    this._serviceData = newServiceData;
    Object.values(this.eventCallbacks).forEach((callback) => callback(this._serviceData));
  }

  setCallback(id: string, callback: EventCallback<T>): void {
    this.eventCallbacks[id] = callback;
  }

  removeCallback(callbackId: string): void {
    delete this.eventCallbacks[callbackId];
  }
}
