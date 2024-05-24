import { mockApiStrategy } from '@common/mocks/earn';
import { ApiStrategy } from 'common-types';
import { EventsManager } from './eventsManager';

export interface EarnServiceData {
  allStrategies: ApiStrategy[];
  isLoadingAllStrategies: boolean;
}

export class EarnService extends EventsManager<EarnServiceData> {
  constructor() {
    super({
      allStrategies: [],
      isLoadingAllStrategies: false,
    });
  }

  get allStrategies(): ApiStrategy[] {
    return this.serviceData.allStrategies;
  }

  set allStrategies(allStrategies) {
    this.serviceData = { ...this.serviceData, allStrategies };
  }

  get isLoadingAllStrategies(): boolean {
    return this.serviceData.isLoadingAllStrategies;
  }

  set isLoadingAllStrategies(isLoadingAllStrategies) {
    this.serviceData = { ...this.serviceData, isLoadingAllStrategies };
  }

  getAllStrategies(): ApiStrategy[] {
    return this.allStrategies;
  }

  getIsLoadingAllStrategies() {
    return this.isLoadingAllStrategies;
  }

  async fetchAllStrategies(): Promise<void> {
    this.isLoadingAllStrategies = true;
    const mockedStrategies = await new Promise<ApiStrategy[]>((resolve) =>
      resolve(Array.from(Array(40)).map(() => mockApiStrategy))
    );

    this.allStrategies = mockedStrategies;
    this.isLoadingAllStrategies = false;
  }
}
