import { LogDescription } from '@ethersproject/abi';
import { Log } from '@ethersproject/providers';

import ContractService from './contractService';
import ProviderService from './providerService';
import SdkService from './sdkService';

export default class TransactionService {
  contractService: ContractService;

  providerService: ProviderService;

  loadedAsSafeApp: boolean;

  sdkService: SdkService;

  constructor(contractService: ContractService, providerService: ProviderService, sdkService: SdkService) {
    this.loadedAsSafeApp = false;
    this.providerService = providerService;
    this.contractService = contractService;
    this.sdkService = sdkService;
  }

  getLoadedAsSafeApp() {
    return this.loadedAsSafeApp;
  }

  setLoadedAsSafeApp(loadedAsSafeApp: boolean) {
    this.loadedAsSafeApp = loadedAsSafeApp;
  }

  // TRANSACTION HANDLING
  getTransactionReceipt(txHash: string, chainId: number) {
    return this.sdkService.getTransactionReceipt(txHash, chainId);
  }

  getTransaction(txHash: string, chainId: number) {
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
}
