import { AccountLabels, AccountLabelsAndContactList, ILabelService } from '@types';
import AccountService from './accountService';
import MeanApiService from './meanApiService';
import ContactListService from './conctactListService';

export default class LabelService implements ILabelService {
  labels: AccountLabels = {};

  meanApiService: MeanApiService;

  accountService: AccountService;

  contactListService: ContactListService;

  constructor(meanApiService: MeanApiService, accountService: AccountService, contactListService: ContactListService) {
    this.meanApiService = meanApiService;
    this.accountService = accountService;
    this.contactListService = contactListService;
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
      this.labels = { ...currentLabels, [labeledAddress]: newLabel };
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

  setWalletsLabels(): void {
    this.accountService.setWalletsLabels(this.labels);
  }

  async initializeLabelsAndContacts(): Promise<void> {
    const labelsAndContactList = await this.fetchLabelsAndContactList();
    if (!labelsAndContactList) {
      return;
    }

    this.labels = labelsAndContactList.labels;
    this.contactListService.setContacts(labelsAndContactList.contacts);
    this.setWalletsLabels();
  }
}
