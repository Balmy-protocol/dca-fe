import { ApiStrategy } from 'common-types';
import { EventsManager } from './eventsManager';
import SdkService from './sdkService';

export interface EarnServiceData {
  allStrategies: ApiStrategy[];
  isLoadingAllStrategies: boolean;
}

export class EarnService extends EventsManager<EarnServiceData> {
  sdkService: SdkService;

  constructor(sdkService: SdkService) {
    super({
      allStrategies: [],
      isLoadingAllStrategies: false,
    });

    this.sdkService = sdkService;
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
    const strategies = await this.sdkService.getAllStrategies();

    this.allStrategies = strategies;
    this.isLoadingAllStrategies = false;
  }
}
