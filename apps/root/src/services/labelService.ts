import { AccountLabels, ILabelService, PostAccountLabels } from '@types';
import AccountService from './accountService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import ContractService from './contractService';
import { isUndefined, keyBy, map, mapValues } from 'lodash';
import { EventsManager } from './eventsManager';
import { Address } from 'viem';
import { NETWORKS } from '@constants';

type EnsNames = Record<Address, string | null | undefined>;
type EnsAddresses = Record<string, Address | null>;
export const universalResolverAddress: Address = '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62';
export interface LabelServiceData {
  labels: AccountLabels;
  ensNames: EnsNames;
  ensAddresses: EnsAddresses;
}

const initialState: LabelServiceData = {
  labels: {},
  ensNames: {},
  ensAddresses: {},
};
export default class LabelService extends EventsManager<LabelServiceData> implements ILabelService {
  meanApiService: MeanApiService;

  accountService: AccountService;

  providerService: ProviderService;

  contractService: ContractService;

  constructor(
    meanApiService: MeanApiService,
    accountService: AccountService,
    providerService: ProviderService,
    contractService: ContractService
  ) {
    super(initialState);
    this.meanApiService = meanApiService;
    this.accountService = accountService;
    this.providerService = providerService;
    this.contractService = contractService;
  }

  get labels() {
    return this.serviceData.labels;
  }

  set labels(labels) {
    this.serviceData = { ...this.serviceData, labels };
  }

  logOutUser() {
    this.resetData();
  }

  async postLabels(labels: PostAccountLabels): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentLabels = this.labels;
    try {
      const parsedLabels = mapValues(keyBy(labels.labels, 'wallet'), ({ label }) => ({
        label,
        lastUpdated: Date.now(),
      }));
      this.labels = { ...currentLabels, ...parsedLabels };

      const signature = await this.accountService.getWalletVerifyingSignature({});
      await this.meanApiService.postAccountLabels({
        labels,
        accountId: user.id,
        signature,
      });
    } catch (e) {
      this.labels = currentLabels;
      console.error(e);
    }
  }

  async editLabel(newLabel: string, labeledAddress: string): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentLabels = this.labels;
    if (!currentLabels.hasOwnProperty(labeledAddress)) {
      console.warn(`Label for address ${labeledAddress} does not exist.`);
      return;
    }
    const updatedLabelData = { label: newLabel, lastModified: Date.now() };
    try {
      this.labels = { ...currentLabels, [labeledAddress]: updatedLabelData };
      const signature = await this.accountService.getWalletVerifyingSignature({});
      await this.meanApiService.putAccountLabel({ newLabel, labeledAddress, accountId: user.id, signature });
    } catch (e) {
      this.labels = currentLabels;
      console.error(e);
    }
  }

  async deleteLabel(labeledAddress: string): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentLabels = this.labels;
    if (currentLabels.hasOwnProperty(labeledAddress)) {
      const deletedLabel = currentLabels[labeledAddress];
      try {
        delete currentLabels[labeledAddress];
        this.labels = currentLabels;
        const signature = await this.accountService.getWalletVerifyingSignature({});
        await this.meanApiService.deleteAccountLabel({
          labeledAddress,
          signature,
          accountId: user.id,
        });
      } catch (e) {
        this.labels = { ...currentLabels, [labeledAddress]: deletedLabel };
        console.error(e);
      }
    } else {
      console.warn(`Label for address ${labeledAddress} does not exist.`);
    }
  }

  updateStoredLabels(labels: AccountLabels) {
    const newLabels: AccountLabels = { ...this.labels };
    Object.entries(labels).forEach(([address, label]) => {
      newLabels[address] = label;
    });
    this.labels = newLabels;
  }

  getLabels() {
    return this.labels;
  }

  get ensNames() {
    return this.serviceData.ensNames;
  }

  set ensNames(ensNames) {
    this.serviceData = { ...this.serviceData, ensNames };
  }

  get ensAddresses() {
    return this.serviceData.ensAddresses;
  }

  set ensAddresses(ensAddresses) {
    this.serviceData = { ...this.serviceData, ensAddresses };
  }

  getEnsNames() {
    const ensAddresses = { ...this.ensAddresses };
    const mergedEnsNames = { ...this.ensNames };

    Object.entries(ensAddresses).forEach(([name, address]) => {
      if (address) {
        mergedEnsNames[address] = name;
      }
    });

    return mergedEnsNames;
  }

  async fetchEns(upperAddress: Address): Promise<void> {
    const address = upperAddress.toLowerCase() as Address;
    let ens = null;

    const ensNames = { ...this.ensNames };

    if (!isUndefined(ensNames[address])) {
      return;
    }
    // We set the new address as null to avoid multiple calls to the same address
    const updatedEnsNames: EnsNames = { ...this.ensNames, [address]: ens };
    this.ensNames = updatedEnsNames;

    try {
      const provider = this.providerService.getProvider(NETWORKS.mainnet.chainId);
      ens = await provider.getEnsName({
        address,
        universalResolverAddress,
      });
    } catch {}

    if (ens) {
      updatedEnsNames[address] = ens;
      this.ensNames = updatedEnsNames;
      return;
    }
  }

  async fetchEnsAddress(ens: string): Promise<void> {
    let address: Address | null = null;

    const hasFetchedEnsAddress = !isUndefined(this.ensAddresses[ens]);
    const hasResolvedEnsAddress = Object.values(this.getEnsNames()).includes(ens);

    if (hasFetchedEnsAddress || hasResolvedEnsAddress) {
      return;
    }

    // We set the new ens address as null to avoid multiple calls to the same ens
    const updatedEnsAddresses: EnsAddresses = { ...this.ensAddresses, [ens]: address };
    this.ensAddresses = updatedEnsAddresses;

    try {
      const provider = this.providerService.getProvider(NETWORKS.mainnet.chainId);

      address = await provider.getEnsAddress({ name: ens, universalResolverAddress });
      if (address) {
        updatedEnsAddresses[ens] = address.toLowerCase() as Address;
        this.ensAddresses = updatedEnsAddresses;
      }
    } catch {}
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
