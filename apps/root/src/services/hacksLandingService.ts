import { Address, ChainId, TokenAddress } from 'common-types';
import { toLower } from '@balmy/sdk';
import { EventsManager } from './eventsManager';
import MeanApiService from './meanApiService';
import { HackLanding, HackLandingId } from '@pages/hacks/types';
import SdkService from './sdkService';
import { erc20Abi } from 'viem';

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

  fetchWalletsAllowances(
    wallets: Address[],
    contracts: Record<ChainId, Address[]>
  ): Record<ChainId, Promise<Record<Wallet, Record<Contract, Record<TokenAddress, bigint>>>>> {
    const entries = Object.entries(contracts).map(([chainId, contracts]) => [
      chainId,
      this.fetchAllowancesInChain(wallets, Number(chainId), contracts),
    ]);
    return Object.fromEntries(entries);
  }

  private async fetchAllowancesInChain(wallets: Wallet[], chainId: ChainId, contracts: Contract[]) {
    const provider = this.sdkService.sdk.providerService.getViemPublicClient({ chainId });

    // Fetch all logs for the wallets and contracts
    const blockNumber = await provider.getBlockNumber();
    const logs = await provider.getLogs({
      event: erc20Abi[0],
      args: {
        owner: wallets,
        spender: contracts,
      },
      fromBlock: 0n,
      toBlock: blockNumber,
      strict: true,
    });

    // Based on logs, determine which allowances to check for
    const toCheck: Record<Lowercase<Wallet>, Record<Lowercase<Contract>, Set<Lowercase<TokenAddress>>>> = {};
    for (const { address, args } of logs) {
      const wallet = toLower(args.owner) as Lowercase<Wallet>;
      const contract = toLower(args.spender) as Lowercase<Contract>;
      const token = toLower(address) as Lowercase<TokenAddress>;
      const value = args.value;
      if (value > 0n) {
        if (!toCheck[wallet]) toCheck[wallet] = {};
        if (!toCheck[wallet][contract]) toCheck[wallet][contract] = new Set();
        toCheck[wallet][contract].add(token);
      } else {
        // If the event was actually a revoke, then we can remove the token from the list
        toCheck[wallet]?.[contract]?.delete(token);
      }
    }

    // Fetch allowances
    const toCheckArray = Object.entries(toCheck)
      .flatMap(([wallet, record]) =>
        Object.entries(record).flatMap(([contract, tokens]) =>
          [...tokens].map((token) => ({ wallet, contract, token }))
        )
      )
      .map(({ wallet, contract, token }) => ({ owner: wallet, spender: contract, token }));
    const allowances = await this.sdkService.sdk.allowanceService.getAllowancesInChain({
      chainId,
      allowances: toCheckArray,
    });

    // Switch to the format that return function expected
    const result: Record<Wallet, Record<Contract, Record<TokenAddress, bigint>>> = {};
    for (const { owner, spender, token: token_ } of toCheckArray) {
      const wallet = owner as Wallet;
      const contract = spender as Contract;
      const token = token_ as TokenAddress;
      if (!result[wallet]) result[wallet] = {};
      if (!result[wallet][contract]) result[wallet][contract] = {};
      result[wallet][contract][token] = allowances[token][owner][spender];
    }

    return result;
  }
}

type Wallet = Address;
type Contract = Address;
