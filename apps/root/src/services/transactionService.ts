import { LogDescription } from '@ethersproject/abi';

import ContractService from './contractService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import MeanApiService from './meanApiService';
import AccountService from './accountService';
import { TransactionEvent, TransactionsHistoryResponse } from '@types';
import { sortedLastIndexBy } from 'lodash';
import { Address, Log } from 'viem';

export default class TransactionService {
  contractService: ContractService;

  providerService: ProviderService;

  loadedAsSafeApp: boolean;

  sdkService: SdkService;

  meanApiService: MeanApiService;

  accountService: AccountService;

  transactionsHistory: { isLoading: boolean; history?: TransactionsHistoryResponse } = { isLoading: true };

  constructor(
    contractService: ContractService,
    providerService: ProviderService,
    sdkService: SdkService,
    meanApiService: MeanApiService,
    accountService: AccountService
  ) {
    this.loadedAsSafeApp = false;
    this.providerService = providerService;
    this.contractService = contractService;
    this.sdkService = sdkService;
    this.meanApiService = meanApiService;
    this.accountService = accountService;
  }

  getLoadedAsSafeApp() {
    return this.loadedAsSafeApp;
  }

  setLoadedAsSafeApp(loadedAsSafeApp: boolean) {
    this.loadedAsSafeApp = loadedAsSafeApp;
  }

  getStoredTransactionsHistory() {
    return this.transactionsHistory;
  }

  // TRANSACTION HANDLING
  getTransactionReceipt(txHash: Address, chainId: number) {
    return this.sdkService.getTransactionReceipt(txHash, chainId);
  }

  getTransaction(txHash: Address, chainId: number) {
    return this.sdkService.getTransaction(txHash, chainId);
  }

  waitForTransaction(txHash: string) {
    return this.providerService.waitForTransaction(txHash);
  }

  async getBlockNumber() {
    const blockNumber = await this.providerService.getBlockNumber();
    return blockNumber || Promise.reject(new Error('No provider'));
  }

  onBlock(callback: ((blockNumber: Promise<number>) => Promise<void>) | ((blockNumber: number) => void)) {
    if (this.loadedAsSafeApp) {
      return window.setInterval(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        () => (callback as (blockNumber: Promise<number>) => Promise<void>)(this.getBlockNumber()),
        10000
      );
    }

    return this.providerService.on('block', callback as (blockNumber: number) => void);
  }

  removeOnBlock() {
    return this.providerService.off('block');
  }

  async parseLog({
    logs,
    chainId,
    eventToSearch,
    ownerAddress,
  }: {
    logs: Log[];
    chainId: number;
    eventToSearch: string;
    ownerAddress: string;
  }) {
    const hubAddress = this.contractService.getHUBAddress(chainId);

    const hubInstance = await this.contractService.getHubInstance(chainId, ownerAddress);

    const hubCompanionInstance = await this.contractService.getHUBCompanionInstance(chainId, ownerAddress);

    const hubCompanionAddress = this.contractService.getHUBCompanionAddress(chainId);

    const parsedLogs: LogDescription[] = [];

    logs.forEach((log) => {
      try {
        let parsedLog;

        if (log.address === hubCompanionAddress) {
          parsedLog = hubCompanionInstance.interface.parseLog(log);
        } else if (log.address === hubAddress) {
          parsedLog = hubInstance.interface.parseLog(log);
        }

        if (parsedLog && parsedLog.name === eventToSearch) {
          parsedLogs.push(parsedLog);
        }
      } catch (e) {
        console.error(e);
      }
    });

    return parsedLogs[0];
  }

  async fetchTransactionsHistory(beforeTimestamp?: number): Promise<void> {
    const user = this.accountService.getUser();
    try {
      if (!user) {
        throw new Error('User is not connected');
      }

      this.transactionsHistory.isLoading = true;
      const signature = await this.accountService.getWalletVerifyingSignature({});
      const transactionsHistoryResponse = await this.meanApiService.getAccountTransactionsHistory({
        accountId: user.id,
        signature,
        beforeTimestamp,
      });

      if (beforeTimestamp && this.transactionsHistory.history) {
        const insertionIndex = sortedLastIndexBy(
          this.transactionsHistory.history.events,
          { timestamp: beforeTimestamp } as TransactionEvent,
          (ev) => -ev.timestamp
        );

        this.transactionsHistory.history = {
          ...transactionsHistoryResponse,
          events: [
            ...this.transactionsHistory.history.events.slice(0, insertionIndex),
            ...transactionsHistoryResponse.events,
          ],
        };
      } else {
        this.transactionsHistory.history = transactionsHistoryResponse;
      }
    } catch (e) {
      console.error(e);
    }
    this.transactionsHistory.isLoading = false;
  }
}
