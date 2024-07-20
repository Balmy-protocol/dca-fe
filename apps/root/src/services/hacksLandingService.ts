import { Address, ChainId } from 'common-types';
import { EventsManager } from './eventsManager';
import MeanApiService from './meanApiService';
import { HackLanding, HackLandingId } from '@pages/hacks/types';
import SdkService from './sdkService';
import { erc20Abi, GetLogsReturnType } from 'viem';

export interface HacksLandingServiceData {
  hacksLandings: Record<HackLandingId, HackLanding>;
  // {
  //   1: {
  //     '0xuser': {
  //       '0xcontract': {
  //         '0xtoken': 100n
  //       }
  //     }
  //   }
  // }
  walletAllowances: Record<
    ChainId,
    {
      isLoading: boolean;
      allowances: Record<Address, Record<Address, Record<Address, bigint>>>;
    }
  >;
}

export default class HacksLandinService extends EventsManager<HacksLandingServiceData> {
  meanApiService: MeanApiService;

  sdkService: SdkService;

  constructor(meanApiService: MeanApiService, sdkService: SdkService) {
    super({ hacksLandings: {}, walletAllowances: {} });
    this.meanApiService = meanApiService;
    this.sdkService = sdkService;
  }

  get hacksLandings() {
    return this.serviceData.hacksLandings;
  }

  set hacksLandings(hacksLandings) {
    this.serviceData = { ...this.serviceData, hacksLandings };
  }

  get walletAllowances() {
    return this.serviceData.walletAllowances;
  }

  set walletAllowances(walletAllowances) {
    this.serviceData = { ...this.serviceData, walletAllowances };
  }

  getHacksLandings() {
    return this.hacksLandings;
  }

  fetchHacksLanding() {
    return this.meanApiService.getHacksLandings();
  }

  async fetchHackLanding(landingId: HackLandingId) {
    const landing = await this.meanApiService.getHackLanding(landingId);

    const hackLandings = {
      ...this.hacksLandings,
    };

    hackLandings[landingId] = landing;

    this.hacksLandings = hackLandings;
  }

  async fetchWalletsAllowances(wallets: Address[], contracts: Record<ChainId, Address[]>) {
    const promises: Promise<GetLogsReturnType | { failed: true; error: string }>[] = [];

    wallets.forEach((wallet) => {
      Object.entries(contracts).forEach(([contractChainId, contractsAddresses]) => {
        const provider = this.sdkService.sdk.providerService.getViemPublicClient({
          chainId: Number(contractChainId),
        });

        promises.push(
          provider
            .getBlockNumber()
            .then((blockNumber) => {
              const a = provider.getLogs({
                event: erc20Abi[0],
                args: {
                  owner: wallet,
                  spender: contractsAddresses,
                },
                fromBlock: 0n,
                toBlock: blockNumber,
              });

              // eslint-disable-next-line promise/no-nesting
              a.catch((e) => ({ failed: true, error: e as string }));

              return a;
            })
            .catch((e) => ({ failed: true, error: e as string }))
        );
      });
    });

    const allowances = await Promise.all(promises);

    allowances.forEach((allowance) => {
      if ('failed' in allowance) {
        console.log('Failed to fetch allowance', allowance.error);
        return;
      }

      console.log('Got allowance', allowance);
    });
  }
}
