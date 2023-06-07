import md5 from 'md5';
import MixpanelLibray, { Mixpanel } from 'mixpanel-browser';
import { MEAN_PROXY_PANEL_URL, NETWORKS } from '@constants/addresses';
import find from 'lodash/find';
import ProviderService from './providerService';

export default class EventService {
  providerService: ProviderService;

  mixpanel: Mixpanel;

  constructor(providerService: ProviderService) {
    this.providerService = providerService;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    try {
      return this.mixpanel.track(action, {
        chainId: network.chainId,
        chainName: foundNetwork?.name,
        ...(extraData || {}),
      });
      // eslint-disable-next-line no-empty
    } catch {}

    return Promise.resolve();
  }
}
