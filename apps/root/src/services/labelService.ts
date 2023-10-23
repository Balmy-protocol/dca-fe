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
      const accountLabelsAndContactList = await this.meanApiService.getAccountLabelsAndContactList(user.id);
      return accountLabelsAndContactList;
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
      await this.meanApiService.postAccountLabels(labels, user.id);
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
      await this.meanApiService.putAccountLabel(newLabel, labeledAddress, user.id);
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
        await this.meanApiService.deleteAccountLabel(labeledAddress, user.id);
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
