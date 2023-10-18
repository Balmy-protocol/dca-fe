import { AccountLabels } from '@types';
import AccountService from './accountService';
import MeanApiService from './meanApiService';

export default class LabelService {
  labels: AccountLabels = {};

  meanApiService: MeanApiService;

  accountService: AccountService;

  constructor(meanApiService: MeanApiService, accountService: AccountService) {
    this.meanApiService = meanApiService;
    this.accountService = accountService;
  }

  getStoredLabels(): AccountLabels {
    return this.labels;
  }

  async fetchLabels(): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    try {
      this.labels = await this.meanApiService.getAccountLabels(user.id);
    } catch (e) {
      console.error(e);
    }
  }

  async postLabels(labels: AccountLabels): Promise<void> {
    const user = this.accountService.getUser();
    const currentLabels = this.labels;
    if (!user) {
      return;
    }
    try {
      this.labels = { ...currentLabels, ...labels };
      await this.meanApiService.postAccountLabels(labels, user.id);
    } catch (e) {
      this.labels = { ...currentLabels };
      console.error(e);
    }
  }

  setWalletsLabels(): void {
    this.accountService.setWalletsLabels(this.labels);
  }

  async initializeLabels(): Promise<void> {
    await this.fetchLabels();
    this.setWalletsLabels();
  }
}
