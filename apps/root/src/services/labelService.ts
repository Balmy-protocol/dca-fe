import { AccountLabels, ILabelService, PostAccountLabels } from '@types';
import AccountService from './accountService';
import MeanApiService from './meanApiService';
import { keyBy, mapValues } from 'lodash';
import { EventsManager } from './eventsManager';

export interface LabelServiceData {
  labels: AccountLabels;
}

const initialState: LabelServiceData = {
  labels: {},
};
export default class LabelService extends EventsManager<LabelServiceData> implements ILabelService {
  meanApiService: MeanApiService;

  accountService: AccountService;

  constructor(meanApiService: MeanApiService, accountService: AccountService) {
    super(initialState);
    this.meanApiService = meanApiService;
    this.accountService = accountService;
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
    const newLabels: AccountLabels = this.labels;
    Object.entries(labels).forEach(([address, label]) => {
      newLabels[address] = label;
    });
    this.labels = newLabels;
  }

  getLabels() {
    return this.labels;
  }
}
