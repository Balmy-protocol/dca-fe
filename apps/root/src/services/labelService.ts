import { AccountEns, AccountLabels, AccountLabelsAndContactList, ILabelService } from '@types';
import AccountService from './accountService';
import MeanApiService from './meanApiService';
import ContactListService from './conctactListService';
import WalletService from './walletService';
import { map } from 'lodash';

export default class LabelService implements ILabelService {
  labels: AccountLabels = {};

  ens: AccountEns = {};

  meanApiService: MeanApiService;

  accountService: AccountService;

  contactListService: ContactListService;

  walletService: WalletService;

  constructor(
    meanApiService: MeanApiService,
    accountService: AccountService,
    contactListService: ContactListService,
    walletService: WalletService
  ) {
    this.meanApiService = meanApiService;
    this.accountService = accountService;
    this.contactListService = contactListService;
    this.walletService = walletService;
  }

  getStoredLabels(): AccountLabels {
    return this.labels;
  }

  async fetchLabelsAndContactList(): Promise<AccountLabelsAndContactList | undefined> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }

    try {
      const signature = await this.accountService.getWalletVerifyingSignature({});
      return await this.meanApiService.getAccountLabelsAndContactList({
        accountId: user.id,
        signature,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async postLabels(labels: AccountLabels): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentLabels = this.labels;
    try {
      this.labels = { ...currentLabels, ...labels };
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
    try {
      this.labels = { ...currentLabels, [labeledAddress]: { label: newLabel, lastModified: Date.now() / 1000 } };
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

  setWalletsAliases(): void {
    this.accountService.setWalletsAliases(this.labels, this.ens);
  }

  async initializeAliasesAndContacts(): Promise<void> {
    const labelsAndContactList = await this.fetchLabelsAndContactList();
    if (labelsAndContactList) {
      this.labels = labelsAndContactList.labels;
      this.contactListService.setContacts(labelsAndContactList.contacts);
    }

    const wallets = this.accountService.getWallets();
    const accountEns = await this.walletService.getManyEns(map(wallets, 'address'));
    this.ens = accountEns;

    this.setWalletsAliases();
  }
}
