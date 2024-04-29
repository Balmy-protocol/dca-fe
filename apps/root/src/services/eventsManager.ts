type EventCallback = () => void;

export class EventsManager<T> {
  private _serviceData: T;

  private _initialServiceData: T;

  private eventCallbacks: Record<string, EventCallback>;

  constructor(initialserviceData: T) {
    this._serviceData = initialserviceData;
    this._initialServiceData = initialserviceData;
    this.eventCallbacks = {};
  }

  get serviceData(): T {
    return this._serviceData;
  }

  set serviceData(newServiceData: T) {
    this._serviceData = newServiceData;
    Object.values(this.eventCallbacks).forEach((callback) => callback());
  }

  setCallback(id: string, callback: EventCallback): void {
    this.eventCallbacks[id] = callback;
  }

  removeCallback(callbackId: string): void {
    delete this.eventCallbacks[callbackId];
  }

  resetData() {
    this.serviceData = this._initialServiceData;
  }
}
