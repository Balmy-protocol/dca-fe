import { ethers } from 'ethers';
import find from 'lodash/find';
import { AxiosInstance } from 'axios';
import { DefillamaResponse, YieldOptions } from 'types';

// MOCKS
import { ALLOWED_YIELDS, DISABLED_YIELDS } from 'config/constants';
import { getProtocolToken, getWrappedProtocolToken } from 'mocks/tokens';
import WalletService from './walletService';

export default class YieldService {
  axiosClient: AxiosInstance;

  walletService: WalletService;

  client: ethers.providers.Web3Provider;

  constructor(walletService: WalletService, axiosClient: AxiosInstance, client?: ethers.providers.Web3Provider) {
    if (client) {
      this.client = client;
    }
    this.walletService = walletService;
    this.axiosClient = axiosClient;
  }

  setClient(client: ethers.providers.Web3Provider) {
    this.client = client;
  }

  async getYieldOptions(chainId?: number, useBlacklist = false): Promise<YieldOptions> {
    const network = await this.walletService.getNetwork();

    const chainidTouse = chainId || network.chainId;

    const defillamaYields = await this.axiosClient.get<DefillamaResponse>('https://yields.llama.fi/pools');

    const yields = defillamaYields.data.data;

    let yieldsByChain = ALLOWED_YIELDS[chainidTouse];

    if (useBlacklist) {
      yieldsByChain = yieldsByChain.filter((option) => !DISABLED_YIELDS.includes(option.tokenAddress));
    }

    return yieldsByChain.map((baseYield) => {
      const foundYield = find(yields, { pool: baseYield.poolId });

      let enabledTokens = foundYield?.underlyingTokens || [];

      const wrappedProtocolToken = getWrappedProtocolToken(chainidTouse);

      const protocolToken = getProtocolToken(chainidTouse);

      if (enabledTokens.includes(wrappedProtocolToken.address)) {
        enabledTokens = [...enabledTokens, protocolToken.address];
      }

      return {
        ...baseYield,
        apy: foundYield?.apy || 0,
        enabledTokens,
      };
    });
  }
}
