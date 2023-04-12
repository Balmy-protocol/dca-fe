import find from 'lodash/find';
import { AxiosInstance } from 'axios';
import { DefillamaResponse, YieldOptions } from 'types';

// MOCKS
import { ALLOWED_YIELDS, DISABLED_YIELDS } from 'config/constants';
import { getProtocolToken, getWrappedProtocolToken } from 'common/mocks/tokens';
import WalletService from './walletService';
import ProviderService from './providerService';

export default class YieldService {
  axiosClient: AxiosInstance;

  providerService: ProviderService;

  walletService: WalletService;

  constructor(walletService: WalletService, providerService: ProviderService, axiosClient: AxiosInstance) {
    this.walletService = walletService;
    this.providerService = providerService;
    this.axiosClient = axiosClient;
  }

  async getYieldOptions(chainId?: number, useBlacklist = false): Promise<YieldOptions> {
    const network = await this.providerService.getNetwork();

    const chainidTouse = chainId || network.chainId;

    const defillamaYields = await this.axiosClient.get<DefillamaResponse>('https://yields.llama.fi/pools');

    const yields = defillamaYields.data.data;

    let yieldsByChain = ALLOWED_YIELDS[chainidTouse].map((option) => ({
      ...option,
      tokenAddress: option.tokenAddress.toLowerCase(),
    }));

    if (useBlacklist) {
      yieldsByChain = yieldsByChain.filter((option) => !DISABLED_YIELDS.includes(option.tokenAddress));
    }

    return yieldsByChain.map((baseYield) => {
      const foundYield = find(yields, { pool: baseYield.poolId });

      const enabledTokens = foundYield?.underlyingTokens?.map((token) => token.toLowerCase()) || [];

      const forcedEnabledTokens = baseYield.forcedUnderlyings || [];

      const wrappedProtocolToken = getWrappedProtocolToken(chainidTouse);

      const protocolToken = getProtocolToken(chainidTouse);

      let finalEnabledTokens = [...enabledTokens, ...forcedEnabledTokens];

      if (finalEnabledTokens.includes(wrappedProtocolToken.address)) {
        finalEnabledTokens = [...finalEnabledTokens, protocolToken.address];
      }

      return {
        ...baseYield,
        apy: foundYield?.apyBase || foundYield?.apy || 0,
        enabledTokens: finalEnabledTokens,
      };
    });
  }
}
