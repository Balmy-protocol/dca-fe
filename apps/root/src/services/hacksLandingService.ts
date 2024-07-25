import { Address, ChainId, TokenAddress } from 'common-types';
import { EventsManager } from './eventsManager';
import MeanApiService from './meanApiService';
import { ChainAllowances, HackLanding, HackLandingId, SavedAllowance } from '@pages/hacks/types';
import SdkService from './sdkService';
import { getWrappedProtocolToken } from '@common/mocks/tokens';
import { toLower } from '@balmy/sdk';
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
  walletAllowances: SavedAllowance;
  isLoadingAllowances: boolean;
}

export default class HacksLandinService extends EventsManager<HacksLandingServiceData> {
  meanApiService: MeanApiService;

  sdkService: SdkService;

  constructor(meanApiService: MeanApiService, sdkService: SdkService) {
    super({ hacksLandings: {}, walletAllowances: {}, isLoadingAllowances: false });
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

  get isLoadingAllowances() {
    return this.serviceData.isLoadingAllowances;
  }

  set isLoadingAllowances(isLoadingAllowances) {
    this.serviceData = { ...this.serviceData, isLoadingAllowances };
  }

  getHacksLandings() {
    return this.hacksLandings;
  }

  getWalletAllowances() {
    return this.walletAllowances;
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
    if (this.isLoadingAllowances) return;
    this.isLoadingAllowances = true;
    const promises = this.baseFetchWalletsAllowances(wallets, contracts);

    const chains = Object.keys(promises).map((chainId) => Number(chainId));
    // eslint-disable-next-line no-param-reassign
    const newUserAllowances = chains.reduce<SavedAllowance>((acc, chainId) => {
      acc[chainId] = { isLoading: true, allowances: {} };
      return acc;
    }, {});

    this.walletAllowances = newUserAllowances;

    const entries = Object.entries(promises).map(([chainId, promise]) =>
      promise
        .then((allowance) => {
          this.walletAllowances = {
            ...this.walletAllowances,
            [Number(chainId)]: {
              isLoading: false,
              allowances: {},
            },
          };

          return allowance;
        })
        .catch((e) => console.log('Error fetchin allowances', e))
    );

    const settledPromises = await Promise.allSettled(entries);

    let newAllowances = {
      ...this.walletAllowances,
    };

    settledPromises.forEach((promise, index) => {
      if (promise.status === 'fulfilled') {
        const chainId = chains[index];
        const allowances = promise.value;
        if (!allowances) return;

        newAllowances = {
          ...newAllowances,
          [chainId]: {
            isLoading: false,
            allowances,
          },
        };
      }
    });

    this.walletAllowances = newAllowances;
    this.isLoadingAllowances = false;
  }

  baseFetchWalletsAllowances(
    wallets: Address[],
    contracts: Record<ChainId, Address[]>
  ): Record<ChainId, Promise<Record<Wallet, Record<Contract, Record<TokenAddress, bigint>>>>> {
    const entries = Object.entries(contracts).map(([chainId, contractsAddresses]) => [
      chainId,
      this.fetchAllowancesInChain(wallets, Number(chainId), contractsAddresses),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
      const token = toLower(address);
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
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

  // fetchWalletsAllowances(wallets: Address[], contracts: Record<ChainId, Address[]>) {
  //   const chainIds = Object.keys(contracts).map(Number);
  //   const contractsAddresses = Object.values(contracts);
  //   const walletAllowances = {
  //     ...this.walletAllowances,
  //   }

  //   for (const chainId of chainIds) {
  //     walletAllowances[chainId] = {
  //       isLoading: true,
  //       allowances: {},
  //     };
  //   }

  //   this.walletAllowances = walletAllowances;

  //   chainIds.forEach((chainId, index) => {
  //     setTimeout(() => {
  //       this.walletAllowances = {
  //         ...this.walletAllowances,
  //         [chainId]: {
  //           isLoading: false,
  //           allowances: wallets.reduce<ChainAllowances>((acc, wallet) => {
  //             // eslint-disable-next-line no-param-reassign
  //             acc[wallet] = contractsAddresses.reduce<ChainAllowances[Address]>((contractAcc, contractAddress) => {
  //               // eslint-disable-next-line no-param-reassign
  //               contractAddress.forEach((contract) => {contractAcc[contract] = { [getWrappedProtocolToken(chainId).address]: 1000000000000000000000n};});
  //               return contractAcc;
  //             }, {});
  //             return acc;
  //           }, {}),
  //         },
  //       }
  //     }, 2000 * index);
  //   });
  // }
}

type Wallet = Address;
type Contract = Address;
