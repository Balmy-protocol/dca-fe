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

export interface LabelServiceData {
  labels: AccountLabels;
  ensNames: EnsNames;
}

const initialState: LabelServiceData = {
  labels: {},
  ensNames: {},
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
