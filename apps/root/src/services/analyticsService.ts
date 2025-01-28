import Hotjar from '@hotjar/browser';
import MixpanelLibray, { Mixpanel } from 'mixpanel-browser';
import { MEAN_PROXY_PANEL_URL, NETWORKS } from '@constants/addresses';
import find from 'lodash/find';
import ProviderService from './providerService';
import AccountService from './accountService';
import { formatUnits } from 'viem';
import { DisplayStrategy, Token } from '@types';

interface FlattenedRecord {
  [key: string]: string | number | boolean | string[] | number[];
}

export interface AnalyticsData {
  [key: string]: string | number | boolean | string[] | number[] | Record<string, unknown>;
}

export default class AnalyticsService {
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

  private flattenObject(obj: AnalyticsData, prefix = ''): FlattenedRecord {
    return Object.keys(obj).reduce((acc: FlattenedRecord, key) => {
      const pre = prefix.length ? `${prefix}.` : '';

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        return { ...acc, ...this.flattenObject(obj[key] as AnalyticsData, `${pre}${key}`) };
      }

      return { ...acc, [`${pre}${key}`]: obj[key] as FlattenedRecord[string] };
    }, {});
  }

  setPeopleProperty(properties: AnalyticsData) {
    try {
      this.mixpanel.people.set(this.flattenObject(properties));
    } catch (error) {}
  }

  setOnceProperty(properties: AnalyticsData) {
    try {
      this.mixpanel.people.set_once(this.flattenObject(properties));
    } catch (error) {}
  }

  unsetProperty(propertyName: string | string[]) {
    try {
      this.mixpanel.people.unset(propertyName);
    } catch (error) {}
  }

  incrementProperty(properties: AnalyticsData) {
    try {
      this.mixpanel.people.increment(this.flattenObject(properties));
    } catch (error) {}
  }

  appendProperty(properties: AnalyticsData) {
    try {
      this.mixpanel.people.append(this.flattenObject(properties));
    } catch (error) {}
  }

  unionProperty(properties: AnalyticsData) {
    try {
      this.mixpanel.people.union(this.flattenObject(properties));
    } catch (error) {}
  }

  trackPositionModified({
    chainId,
    remainingLiquidityDifference,
    usdPrice,
    isIncreasingPosition,
    token,
  }: {
    chainId: number;
    remainingLiquidityDifference: bigint;
    usdPrice: bigint;
    isIncreasingPosition: boolean;
    token: Token;
  }) {
    this.setPeopleProperty({
      general: {
        last_product_used: 'dca',
        last_network_used: find(NETWORKS, { chainId })?.name || 'unknown',
      },
    });
    const usdValueDiff = formatUnits(remainingLiquidityDifference * usdPrice, token.decimals + 18);

    this.incrementProperty({
      general: {
        total_volume_all_time_usd: isIncreasingPosition ? Number(usdValueDiff) : -Number(usdValueDiff),
      },
      dca: {
        total_invested_usd: isIncreasingPosition ? Number(usdValueDiff) : -Number(usdValueDiff),
      },
    });
  }

  trackPositionTerminated({ chainId, usdValueDiff }: { chainId: number; usdValueDiff: string }) {
    this.setPeopleProperty({
      general: {
        last_product_used: 'dca',
        last_network_used: find(NETWORKS, { chainId })?.name || 'unknown',
      },
    });
    this.incrementProperty({
      general: {
        total_volume_all_time_usd: -Number(usdValueDiff),
      },
      dca: {
        total_invested_usd: -Number(usdValueDiff),
      },
    });
  }

  trackSlippageChanged({ slippage }: { slippage: string }) {
    this.setPeopleProperty({
      swap: {
        settings: {
          default_settings: false,
          slippage,
        },
      },
    });
  }

  trackGasSpeedChanged({ gasSpeed }: { gasSpeed: string }) {
    this.setPeopleProperty({
      swap: {
        settings: {
          default_settings: false,
          transaction_speed: gasSpeed,
        },
      },
    });
  }

  trackSourceTimeoutChanged({ sourceTimeout }: { sourceTimeout: string }) {
    this.setPeopleProperty({
      swap: {
        settings: {
          default_settings: false,
          quote_waiting_time: sourceTimeout,
        },
      },
    });
  }

  trackQuoteSortingChanged({ quoteSorting }: { quoteSorting: string }) {
    this.setPeopleProperty({
      swap: {
        settings: {
          default_settings: false,
          quote_sorting: quoteSorting,
        },
      },
    });
  }

  trackPermit2Enabled({ permit2Enabled }: { permit2Enabled: boolean }) {
    this.setPeopleProperty({
      swap: {
        settings: {
          default_settings: false,
          universal_approval: permit2Enabled,
        },
      },
    });
  }

  trackDefaultSettingsChanged({ defaultSettings }: { defaultSettings: boolean }) {
    this.setPeopleProperty({
      swap: {
        settings: {
          default_settings: defaultSettings,
        },
      },
    });
  }

  trackSwap({
    chainId,
    from,
    to,
    fromUsdValueToUse,
  }: {
    chainId: number;
    from: Token;
    to: Token;
    fromUsdValueToUse?: number;
  }) {
    const networkUsed = find(NETWORKS, { chainId })?.name || 'unknown';

    this.setPeopleProperty({
      general: {
        last_product_used: 'swap',
        last_network_used: networkUsed,
      },
    });
    this.incrementProperty({
      general: {
        total_volume_all_time_usd: fromUsdValueToUse,
      },
      swap: {
        total_volume_usd: fromUsdValueToUse,
        count: 1,
      },
    });
    this.unionProperty({
      general: {
        networks_used: networkUsed,
        products_used: 'swap',
        tokens_used: [from.symbol, to.symbol],
        pair_used: `${from.symbol}-${to.symbol}`,
      },
      swap: {
        networks_used: networkUsed,
        tokens_used: [from.symbol, to.symbol],
        pair_used: `${from.symbol}-${to.symbol}`,
      },
    });
  }

  trackDcaCreatePosition({
    chainId,
    from,
    to,
    parsedAmountInUSD,
  }: {
    chainId: number;
    from: Token;
    to: Token;
    parsedAmountInUSD: number;
  }) {
    const networkUsed = find(NETWORKS, { chainId: chainId })?.name || 'unknown';
    this.setPeopleProperty({
      general: {
        last_product_used: 'dca',
        last_network_used: networkUsed,
      },
    });
    this.incrementProperty({
      general: {
        total_volume_all_time_usd: parsedAmountInUSD,
      },
      dca: {
        total_invested_usd: parsedAmountInUSD,
        total_positions: 1,
      },
    });
    this.unionProperty({
      general: {
        networks_used: networkUsed,
        products_used: 'dca',
        tokens_used: [from.symbol, to.symbol],
        pair_used: `${from.symbol}-${to.symbol}`,
      },
      dca: {
        networks_used: networkUsed,
        tokens_used: [from.symbol, to.symbol],
        pair_used: `${from.symbol}-${to.symbol}`,
      },
    });
  }

  trackEarnDeposit({
    chainId,
    asset,
    strategy,
    parsedAmountInUSD,
    hasPosition,
  }: {
    chainId: number;
    asset: Token;
    strategy: DisplayStrategy;
    parsedAmountInUSD: number;
    hasPosition: boolean;
  }) {
    const networkUsed = find(NETWORKS, { chainId: chainId })?.name || 'unknown';

    this.setPeopleProperty({
      general: {
        last_product_used: 'earn',
        last_network_used: networkUsed,
      },
    });
    this.incrementProperty({
      general: {
        total_volume_all_time_usd: parsedAmountInUSD,
      },
      earn: {
        total_deposits_usd: parsedAmountInUSD,
        current_deposits_usd: parsedAmountInUSD,
        deposits_count: !hasPosition ? 1 : 0,
        increase_count: hasPosition ? 1 : 0,
      },
    });
    this.unionProperty({
      general: {
        networks_used: strategy.network.name,
        products_used: 'earn',
        tokens_used: asset.symbol,
      },
      earn: {
        networks_used: strategy.network.name,
        protocols_used: [strategy.farm.protocol],
        tokens_used: [asset.symbol],
      },
    });
  }

  trackEarnWithdraw({ chainId, amountInUsd }: { chainId: number; amountInUsd: number }) {
    const networkUsed = find(NETWORKS, { chainId: chainId })?.name || 'unknown';

    this.setPeopleProperty({
      general: {
        last_product_used: 'earn',
        last_network_used: networkUsed,
      },
    });

    this.incrementProperty({
      earn: {
        current_deposits_usd: -amountInUsd,
        withdraw_counts: 1,
      },
      general: {
        total_volume_all_time_usd: -amountInUsd,
      },
    });
  }

  trackTransfer({ chainId, asset, amountInUsd }: { chainId: number; asset: Token; amountInUsd?: string }) {
    const networkUsed = find(NETWORKS, { chainId: chainId })?.name || 'unknown';

    this.setPeopleProperty({
      general: {
        last_product_used: 'transfer',
        last_network_used: networkUsed,
      },
    });
    this.incrementProperty({
      general: {
        total_volume_all_time_usd: Number(amountInUsd ?? 0),
      },
      transfer: {
        total_volume_usd: Number(amountInUsd ?? 0),
        count: 1,
      },
    });
    this.unionProperty({
      general: {
        networks_used: networkUsed,
        products_used: 'transfer',
        tokens_used: [asset.symbol],
      },
      transfer: {
        networks_used: networkUsed,
        tokens_used: [asset.symbol],
      },
    });
  }
}
