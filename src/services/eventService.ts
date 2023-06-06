import md5 from 'md5';
import MixpanelLibray, { Mixpanel, Response } from 'mixpanel-browser';
import ProviderService from './providerService';
import { MEAN_PROXY_PANEL_URL, NETWORKS } from '@constants/addresses';
import find from 'lodash/find';

export default class EventService {
  providerService: ProviderService;

  mixpanel: Mixpanel;

  constructor(providerService: ProviderService) {
    this.providerService = providerService;
    this.mixpanel = MixpanelLibray.init(process.env.MIXPANEL_TOKEN!, { api_host: MEAN_PROXY_PANEL_URL }, ' ');
    this.mixpanel.set_config({ persistence: 'localStorage', ignore_dnt: true });
  }

  async getIdentifier() {
    const account = await this.providerService.getAddress();
    return md5(account);
  }

  async trackEvent(action: string, extraData?: Record<string | number, unknown>) {
    const network = await this.providerService.getNetwork();
    const foundNetwork = find(NETWORKS, { chainId: network.chainId });
    return new Promise<void>((resolve, reject) => {
      if (!this.mixpanel) return resolve();
      this.mixpanel.track(
        action,
        {
          chainId: network.chainId,
          chainName: foundNetwork?.name,
          ...(extraData || {}),
        },
        (err: Response) => {
          if (!err) {
            resolve();
          }
          reject(err);
        }
      );
    });
  }
}
