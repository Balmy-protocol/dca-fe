import Hotjar from '@hotjar/browser';
import ProviderService from './providerService';
import AccountService from './accountService';

interface FlattenedRecord {
  [key: string]: string | number | boolean | string[] | number[];
}

export interface AnalyticsData {
  [key: string]: string | number | boolean | string[] | number[] | Record<string, unknown>;
}

export default class AnalyticsService {
  providerService: ProviderService;

  accountService: AccountService;

  constructor(providerService: ProviderService, accountService: AccountService) {
    this.providerService = providerService;
    this.accountService = accountService;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // this.mixpanel = MixpanelLibray.init(process.env.MIXPANEL_TOKEN!, { api_host: MEAN_PROXY_PANEL_URL }, ' ');
    // this.mixpanel.set_config({ persistence: 'localStorage', ignore_dnt: true });
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
    // this.mixpanel.identify(userId);
    try {
      Hotjar.identify(userId, {});
    } catch (error) {
      console.error('Error identifying user in Hotjar', error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async trackEvent(action: string, extraData?: Record<string | number, unknown>) {
    return Promise.resolve();
  }

  private flattenObject(obj: AnalyticsData, prefix = ''): FlattenedRecord {
    return Object.keys(obj).reduce((acc: FlattenedRecord, key) => {
      const pre = prefix.length ? `${prefix}.` : '';

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        return { ...acc, ...this.flattenObject(obj[key] as AnalyticsData, `${pre}${key}`) };
      }

      return { ...acc, [`${pre}${key}`]: obj[key] as FlattenedRecord[string] };
    }, {});
  }
}
