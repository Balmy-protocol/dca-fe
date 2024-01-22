import ContractService from './contractService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import MeanApiService from './meanApiService';
import AccountService from './accountService';
import { TransactionApiEvent, TransactionsHistoryResponse } from '@types';
import { sortedLastIndexBy } from 'lodash';
import {
  Address,
  DecodeEventLogReturnType,
  Log,
  TransactionReceipt,
  WatchBlockNumberReturnType,
  decodeEventLog,
} from 'viem';
import COMPANION_ABI from '@abis/HubCompanion';
import HUB_ABI from '@abis/Hub';
export default class TransactionService {
  contractService: ContractService;

  providerService: ProviderService;

  loadedAsSafeApp: boolean;

  sdkService: SdkService;

  meanApiService: MeanApiService;

  accountService: AccountService;

  transactionsHistory: { isLoading: boolean; history?: TransactionsHistoryResponse } = { isLoading: false };

  onBlockCallbacks: Record<number, WatchBlockNumberReturnType>;

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
    this.onBlockCallbacks = {};
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
    return this.sdkService.getTransactionReceipt(txHash, chainId) as Promise<TransactionReceipt>;
  }

  getTransaction(txHash: Address, chainId: number) {
    return this.sdkService.getTransaction(txHash, chainId);
  }

  waitForTransaction(txHash: Address, chainId: number) {
    return this.providerService.waitForTransaction(txHash, chainId);
  }

  onBlock(chainId: number, callback: (blockNumber: bigint) => void) {
    if (this.loadedAsSafeApp) {
      return window.setInterval(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        () => (callback as unknown as (blockNumber: Promise<bigint>) => Promise<void>)(this.getBlockNumber(chainId)),
        10000
      );
    }

    this.onBlockCallbacks[chainId] = this.providerService.onBlock(chainId, callback);
  }

  removeOnBlock(chainId: number) {
    const listenerRemover = this.onBlockCallbacks[chainId];

    if (listenerRemover) {
      listenerRemover();
    }
  }

  async getBlockNumber(chainId: number) {
    const blockNumber = await this.providerService.getBlockNumber(chainId);
    return blockNumber || Promise.reject(new Error('No provider'));
  }

  async parseLog({ logs, chainId, eventToSearch }: { logs: Log[]; chainId: number; eventToSearch: string }) {
    const hubAddress = this.contractService.getHUBAddress(chainId);

    const hubInstance = await this.contractService.getHubInstance({ chainId, readOnly: true });

    const hubCompanionInstance = await this.contractService.getHUBCompanionInstance({ chainId, readOnly: true });

    const hubCompanionAddress = this.contractService.getHUBCompanionAddress(chainId);

    const parsedLogs: (DecodeEventLogReturnType<typeof COMPANION_ABI> | DecodeEventLogReturnType<typeof HUB_ABI>)[] =
      [];

    logs.forEach((log) => {
      try {
        let parsedLog;

        if (log.address.toLowerCase() === hubCompanionAddress.toLowerCase()) {
          parsedLog = decodeEventLog({
            ...hubCompanionInstance,
            ...log,
          });
        } else if (log.address.toLowerCase() === hubAddress.toLowerCase()) {
          parsedLog = decodeEventLog({
            ...hubInstance,
            ...log,
          });
        }

        if (parsedLog && parsedLog.eventName === eventToSearch) {
          parsedLogs.push(parsedLog);
        }
      } catch (e) {
        console.error(e);
      }
    });

    return parsedLogs[0];
  }

  addTransactionToHistory(tx: TransactionApiEvent) {
    // first we check if by some chance the indexer already fetched this tx
    const isTxConfirmedByIndexer = this.transactionsHistory.history?.events.find(
      (event) => event.tx.txHash === tx.tx.txHash && event.tx.chainId === tx.tx.chainId
    );

    if (isTxConfirmedByIndexer) return;

    if (!this.transactionsHistory.history) {
      this.transactionsHistory.history = { events: [], indexing: {}, pagination: { moreEvents: true } };
    }
    this.transactionsHistory.history.events.unshift(tx);
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
          { tx: { timestamp: beforeTimestamp } } as TransactionApiEvent,
          (ev) => -ev.tx.timestamp
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
      throw e;
    } finally {
      this.transactionsHistory.isLoading = false;
    }
  }
}
