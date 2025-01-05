import Hotjar from '@hotjar/browser';
import MixpanelLibray, { Mixpanel } from 'mixpanel-browser';
import { MEAN_PROXY_PANEL_URL, NETWORKS } from '@constants/addresses';
import find from 'lodash/find';
import ProviderService from './providerService';
import AccountService from './accountService';

export default class EventService {
  providerService: ProviderService;

  accountService: AccountService;

  mixpanel: Mixpanel;

  constructor(providerService: ProviderService, accountService: AccountService) {
    this.providerService = providerService;
    this.accountService = accountService;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.mixpanel = MixpanelLibray.init(process.env.MIXPANEL_TOKEN!, { api_host: MEAN_PROXY_PANEL_URL }, ' ');
    this.mixpanel.set_config({ persistence: 'localStorage', ignore_dnt: true });
    if (process.env.HOTJAR_PAGE_ID) {
      try {
        Hotjar.init(Number(process.env.HOTJAR_PAGE_ID), 6);
      } catch (error) {
        console.error('Error initializing Hotjar', error);
      }
    }
  }

  identifyUser(userId?: string) {
    if (!userId) {
      return;
    }
    this.mixpanel.identify(userId);
    try {
      Hotjar.identify(userId, {});
    } catch (error) {
      console.error('Error identifying user in Hotjar', error);
    }
  }

  async trackEvent(action: string, extraData?: Record<string | number, unknown>) {
    let network;

    try {
      network = await this.providerService.getNetwork();
    } catch (error) {}

    const foundNetwork = find(NETWORKS, { chainId: network?.chainId });
    const userId = this.accountService.getUser()?.id;
    const activeWallet = this.accountService.getActiveWallet()?.address;

    this.mixpanel.identify(userId);

    try {
      this.mixpanel.track(action, {
        chainId: network?.chainId,
        chainName: foundNetwork?.name,
        distinct_id: userId,
        activeWallet,
        ...(extraData || {}),
      });
    } catch (error) {}

    return Promise.resolve();
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
      const pre = prefix.length ? `${prefix}.` : '';

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, this.flattenObject(obj[key], `${pre}${key}`));
      } else {
        acc[`${pre}${key}`] = obj[key];
      }

      return acc;
    }, {});
  }

  setPeopleProperty(properties: Record<string, any>) {
    try {
      this.mixpanel.people.set(this.flattenObject(properties));
    } catch (error) {}
  }

  setOnceProperty(properties: Record<string, any>) {
    try {
      this.mixpanel.people.set_once(this.flattenObject(properties));
    } catch (error) {}
  }

  unsetProperty(propertyName: string | string[]) {
    try {
      this.mixpanel.people.unset(propertyName);
    } catch (error) {}
  }

  incrementProperty(properties: Record<string, any>) {
    try {
      this.mixpanel.people.increment(this.flattenObject(properties));
    } catch (error) {}
  }

  appendProperty(properties: Record<string, any>) {
    try {
      this.mixpanel.people.append(this.flattenObject(properties));
    } catch (error) {}
  }

  unionProperty(properties: Record<string, any>) {
    try {
      this.mixpanel.people.union(this.flattenObject(properties));
    } catch (error) {}
  }
}
