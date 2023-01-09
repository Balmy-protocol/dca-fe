import MeanApiService from './meanApiService';

export default class ErrorService {
  meanApiService: MeanApiService;

  constructor(meanApiService: MeanApiService) {
    this.meanApiService = meanApiService;
  }

  logError(error: string, errorMessage: string, extraData: unknown) {
    return this.meanApiService.logError(error, errorMessage, extraData);
  }
}
