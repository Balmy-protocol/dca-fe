import { AccountLabels } from '@types';
import AccountService from './accountService';
import MeanApiService from './meanApiService';

export default class LabelService {
  meanApiService: MeanApiService;

  accountService: AccountService;

  constructor(meanApiService: MeanApiService, accountService: AccountService) {
    this.meanApiService = meanApiService;
    this.accountService = accountService;
  }

  async getLabels(): Promise<AccountLabels> {
    const user = this.accountService.getUser();
    if (!user) {
      return {};
    }
    const labels = await this.meanApiService.getAccountLabels(user.id);
    return labels;
  }

  async postLabels(labels: AccountLabels): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    await this.meanApiService.postAccountLabels(labels, user.id);
  }

  async setWalletLabels(): Promise<void> {
    const labels = await this.getLabels();
    this.accountService.setWalletsLabels(labels);
  }
}
