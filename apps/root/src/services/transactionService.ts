import ContractService from './contractService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import MeanApiService from './meanApiService';
import AccountService from './accountService';
import { ApiIndexingResponse, IndexerUnits, TokenListId, TransactionsHistory } from '@types';
import { keyBy, orderBy } from 'lodash';
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
import { EventsManager } from './eventsManager';
import { ApiErrorKeys } from '@constants';

type TransactionsHistoryServiceData = {
  isLoading: boolean;
  history?: TransactionsHistory;
  globalPagination: {
    moreEvents: boolean;
    lastEventTimestamp?: number;
  };
  tokenPagination: {
    moreEvents: boolean;
    lastEventTimestamp?: number;
  };
};

export interface TransactionServiceData {
  transactionsHistory: TransactionsHistoryServiceData;
  dcaIndexingBlocks: ApiIndexingResponse['status'][IndexerUnits.DCA];
}

const initialState: TransactionServiceData = {
  transactionsHistory: {
    isLoading: false,
    history: undefined,
    globalPagination: { moreEvents: true },
    tokenPagination: { moreEvents: true },
  },
  dcaIndexingBlocks: {},
};

export default class TransactionService extends EventsManager<TransactionServiceData> {
  contractService: ContractService;

  providerService: ProviderService;

  loadedAsSafeApp: boolean;

  sdkService: SdkService;

  meanApiService: MeanApiService;

  accountService: AccountService;

  onBlockCallbacks: Record<number, WatchBlockNumberReturnType>;

  constructor(
    contractService: ContractService,
    providerService: ProviderService,
    sdkService: SdkService,
    meanApiService: MeanApiService,
    accountService: AccountService
  ) {
    super(initialState);
    this.loadedAsSafeApp = false;
    this.providerService = providerService;
    this.contractService = contractService;
    this.sdkService = sdkService;
    this.meanApiService = meanApiService;
    this.accountService = accountService;
    this.onBlockCallbacks = {};
  }

  get transactionsHistory() {
    return this.serviceData.transactionsHistory;
  }

  set transactionsHistory(transactionsHistory) {
    this.serviceData = { ...this.serviceData, transactionsHistory };
  }

  get dcaIndexingBlocks() {
    return this.serviceData.dcaIndexingBlocks;
  }

  set dcaIndexingBlocks(dcaIndexingBlocks) {
    this.serviceData = { ...this.serviceData, dcaIndexingBlocks };
  }

  logOutUser() {
    this.resetData();
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

  getDcaIndexingBlocks() {
    return this.dcaIndexingBlocks;
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

  clearTokenHistoryTimestamp() {
    // Set global lastEventTimestamp as token lastEventTimestamp start point
    this.transactionsHistory = {
      ...this.transactionsHistory,
      tokenPagination: {
        lastEventTimestamp: this.transactionsHistory.globalPagination.lastEventTimestamp,
        moreEvents: true,
      },
    };
  }

  async fetchTransactionsHistory({
    isFetchMore,
    tokens,
  }: {
    isFetchMore: boolean;
    tokens?: TokenListId[];
  }): Promise<void> {
    const user = this.accountService.getUser();
    const transactionsHistory = {
      ...this.transactionsHistory,
      isLoading: false,
    };

    try {
      if (!user) {
        throw new Error('User is not connected');
      }

      transactionsHistory.isLoading = true;
      this.transactionsHistory = transactionsHistory;

      const beforeTimestamp = tokens
        ? transactionsHistory.tokenPagination.lastEventTimestamp
        : transactionsHistory.globalPagination.lastEventTimestamp;

      const signature = await this.accountService.getWalletVerifyingSignature({});
      const transactionsHistoryResponse = await this.meanApiService.getAccountTransactionsHistory({
        accountId: user.id,
        signature,
        beforeTimestamp: isFetchMore ? beforeTimestamp : undefined,
        tokens,
      });

      const lastEventTimestamp =
        transactionsHistoryResponse.events[transactionsHistoryResponse.events.length - 1]?.tx.timestamp;
      const moreEvents = transactionsHistoryResponse.pagination.moreEvents;

      // Fetched timestamp always is relevant to token timestamp (either token or global)
      transactionsHistory.tokenPagination = { lastEventTimestamp, moreEvents };
      if (!tokens) {
        transactionsHistory.globalPagination = { lastEventTimestamp, moreEvents };
      }

      if (!transactionsHistory.history || !isFetchMore) {
        transactionsHistory.history = { events: [], indexing: {} };
      }

      // Stored events may contain gaps in the timestamp, user may have requested history from different tokens
      const allEvents = [...transactionsHistory.history?.events, ...transactionsHistoryResponse.events];

      // Make a record to avoid duplicated events
      const uniqueEventIdentifiers = keyBy(allEvents, (txEvent) => `${txEvent.tx.chainId}-${txEvent.tx.txHash}`);

      transactionsHistory.history.indexing = Object.entries(transactionsHistoryResponse.indexing).reduce<
        TransactionsHistory['indexing']
      >((acc, [address, chainsData]) => {
        if (!('error' in chainsData)) {
          Object.entries(chainsData).forEach(([chainId, chainData]) => {
            // eslint-disable-next-line no-param-reassign
            acc[address as Address] = { ...acc[address as Address], [Number(chainId)]: chainData };
          });
        }
        return acc;
      }, {});

      transactionsHistory.history.events = orderBy(Object.values(uniqueEventIdentifiers), (tx) => tx.tx.timestamp, [
        'desc',
      ]);
    } catch (e) {
      console.error(e);
      throw new Error(ApiErrorKeys.HISTORY);
    } finally {
      transactionsHistory.isLoading = false;
      this.transactionsHistory = transactionsHistory;
    }
  }

  async fetchDcaIndexingBlocks() {
    const response = await this.meanApiService.getIndexingBlocksData([IndexerUnits.DCA]);
    this.dcaIndexingBlocks = response.data.status[IndexerUnits.DCA];
  }
}
