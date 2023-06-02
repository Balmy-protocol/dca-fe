import md5 from 'md5';
import MixpanelLibray, { Mixpanel, Response } from 'mixpanel-browser';
import ProviderService from './providerService';
import { NETWORKS } from '@constants/addresses';
import find from 'lodash/find';

export default class EventService {
  providerService: ProviderService;

  mixpanel: Mixpanel;

  constructor(providerService: ProviderService) {
    this.providerService = providerService;
    this.mixpanel = MixpanelLibray.init(
      '7f62e8855fcbcd72de460ba40b6fc06b',
      { api_host: 'https://mean-finance-mixpanel-proxy.herokuapp.com' },
      ' '
    );
    this.mixpanel.set_config({ persistence: 'localStorage' });
    // We can identify user
    // const id = await this.getIdentifier();
    // this.mixpanel.identify(id);
  }

  async getIdentifier() {
    const account = await this.providerService.getAddress();
    return md5(account);
  }

  async trackEvent(action: string, extraData?: Record<string | number, unknown>) {
    const network = await this.providerService.getNetwork();
    const foundNetwork = find(NETWORKS, { chainId: network.chainId });
    return new Promise<void>((resolve, reject) => {
      this.mixpanel.track(
        action,
        {
          chainId: network.chainId,
          chainName: foundNetwork?.name,
          ...(extraData || {}),
        },
        (err: Response) => {
          if (!err) {
            console.log(' SEEE E E E E ENT');
            resolve();
          }
          reject(err);
        }
      );
    });
  }
}
