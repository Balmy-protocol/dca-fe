import { Address } from 'viem';
import ContractService from './contractService';
import ProviderService from './providerService';
import { NETWORKS } from '@constants';
import { EventsManager } from './eventsManager';
import { isUndefined, map } from 'lodash';
import AccountService from './accountService';

export interface EnsServiceData {
  ensNames: Record<Address, string | null | undefined>;
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

  async fetchEns(upperAddress: Address, chainId?: number): Promise<void> {
    const address = upperAddress.toLowerCase() as Address;
    let ens = null;

    if (!address || !isUndefined(this.ensNames[address])) {
      return;
    }

    // We set the new address as null to avoid multiple calls to the same address
    this.ensNames = { ...this.ensNames, [address]: null };

    const currentNetwork = (chainId && { chainId }) || (await this.providerService.getNetwork(address));

    if (currentNetwork.chainId === NETWORKS.arbitrum.chainId) {
      try {
        const smolDomainInstance = await this.contractService.getSmolDomainInstance({
          chainId: currentNetwork.chainId,
          readOnly: true,
        });

        ens = await smolDomainInstance.read.getFirstDefaultDomain([address]);
        // eslint-disable-next-line no-empty
      } catch {}
    }

    if (ens) {
      this.ensNames = { ...this.ensNames, [address]: ens };
      return;
    }

    try {
      const provider = this.providerService.getProvider(NETWORKS.mainnet.chainId);
      ens = await provider.getEnsName({
        address,
        universalResolverAddress: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
      });
      // eslint-disable-next-line no-empty
    } catch {}

    this.ensNames = { ...this.ensNames, [address]: ens };
    return;
  }

  async fetchManyEns(addresses: Address[], chainId?: number): Promise<void> {
    const ensPromises = addresses.map((address) =>
      this.fetchEns(address, chainId).catch((e) => {
        console.error('Error getting ENS', e);
        return undefined;
      })
    );
    await Promise.all(ensPromises);
  }

  async initializeWalletsEnsNames(): Promise<void> {
    const wallets = this.accountService.user?.wallets || [];
    await this.fetchManyEns(map(wallets, 'address'));
  }
}
