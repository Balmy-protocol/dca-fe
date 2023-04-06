import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

export default class EventService {
  meanApiService: MeanApiService;

  providerService: ProviderService;

  sessionId: string;

  identifierId: string;

  constructor(meanApiService: MeanApiService, providerService: ProviderService) {
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.sessionId = uuidv4();
  }

  async getIdentifier() {
    const account = await this.providerService.getAddress();

    return (account && md5(account)) || md5(this.sessionId);
  }

  async trackEvent(action: string, extraData?: Record<string | number, unknown>) {
    const network = await this.providerService.getNetwork();
    const hashedId = await this.getIdentifier();
    return this.meanApiService.trackEvent(
      action,
      {
        distinct_id: this.sessionId,
        hashedId,
        chanId: network.chainId,
        ...(extraData || {}),
      },
      'test'
    );
  }
}
