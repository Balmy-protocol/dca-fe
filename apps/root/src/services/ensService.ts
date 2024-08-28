import { Address } from 'viem';
import ContractService from './contractService';
import ProviderService from './providerService';
import { NETWORKS } from '@constants';
import { EventsManager } from './eventsManager';
import { isUndefined, map } from 'lodash';
import AccountService from './accountService';

type EnsNames = Record<Address, string | null | undefined>;

export interface EnsServiceData {
  ensNames: EnsNames;
}

const initialState: EnsServiceData = {
  ensNames: {},
};

export default class EnsService extends EventsManager<EnsServiceData> {
  private contractService: ContractService;

  private providerService: ProviderService;

  private accountService: AccountService;

  constructor(contractService: ContractService, providerService: ProviderService, accountService: AccountService) {
    super(initialState);
    this.contractService = contractService;
    this.providerService = providerService;
    this.accountService = accountService;
  }

  get ensNames() {
    return this.serviceData.ensNames;
  }

  set ensNames(ensNames) {
    this.serviceData = { ...this.serviceData, ensNames };
  }

  getEnsNames() {
    return this.ensNames;
  }

  async fetchEns(upperAddress: Address): Promise<void> {
    const address = upperAddress.toLowerCase() as Address;
    let ens = null;

    if (!isUndefined(this.ensNames[address])) {
      return;
    }
    // We set the new address as null to avoid multiple calls to the same address
    const updatedEnsNames: EnsNames = { ...this.ensNames, [address]: ens };
    this.ensNames = updatedEnsNames;
    // First we check if the address has a ENS name in mainnet
    try {
      const provider = this.providerService.getProvider(NETWORKS.mainnet.chainId);
      ens = await provider.getEnsName({
        address,
        universalResolverAddress: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
      });
    } catch {}

    if (ens) {
      updatedEnsNames[address] = ens;
      this.ensNames = updatedEnsNames;
      return;
    }

    // Then we check on Arbitrum if no ENS name was found
    try {
      const smolDomainInstance = await this.contractService.getSmolDomainInstance({
        chainId: NETWORKS.arbitrum.chainId,
        readOnly: true,
      });

      ens = await smolDomainInstance.read.getFirstDefaultDomain([address]);
    } catch {}

    if (ens) {
      updatedEnsNames[address] = ens;
      this.ensNames = updatedEnsNames;
      return;
    }
  }

  async fetchManyEns(addresses: Address[]): Promise<void> {
    const ensPromises = addresses.map((address) => this.fetchEns(address));
    await Promise.allSettled(ensPromises);
  }

  async initializeWalletsEnsNames(): Promise<void> {
    const wallets = this.accountService.getWallets();
    await this.fetchManyEns(map(wallets, 'address'));
  }
}
