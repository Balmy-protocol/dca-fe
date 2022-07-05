import { ethers } from 'ethers';
import { LogDescription } from '@ethersproject/abi';
import { Log } from '@ethersproject/providers';

import ContractService from './contractService';

export default class TransactionService {
  client: ethers.providers.Web3Provider;

  contractService: ContractService;

  constructor(client?: ethers.providers.Web3Provider) {
    if (client) {
      this.client = client;
    }

    this.contractService = new ContractService();
  }

  // GETTERS AND SETTERS
  setClient(client: ethers.providers.Web3Provider) {
    this.client = client;
    this.contractService.setClient(client);
  }

  // TRANSACTION HANDLING
  getTransactionReceipt(txHash: string) {
    return this.client.getTransactionReceipt(txHash);
  }

  getTransaction(txHash: string) {
    return this.client.getTransaction(txHash);
  }

  waitForTransaction(txHash: string) {
    return this.client.waitForTransaction(txHash);
  }

  getBlockNumber() {
    return this.client.getBlockNumber();
  }

  onBlock(callback: (blockNumber: number) => void) {
    return this.client.on('block', callback);
  }

  removeOnBlock() {
    return this.client.off('block');
  }

  async parseLog(logs: Log[], chainId: number, eventToSearch: string) {
    const hubInstance = await this.contractService.getHubInstance();

    const hubCompanionInstance = await this.contractService.getHUBCompanionInstance();

    const hubCompanionAddress = await this.contractService.getHUBCompanionAddress();

    const parsedLogs: LogDescription[] = [];
    logs.forEach((log) => {
      try {
        let parsedLog;

        if (log.address === hubCompanionAddress) {
          parsedLog = hubCompanionInstance.interface.parseLog(log);
        } else {
          parsedLog = hubInstance.interface.parseLog(log);
        }

        if (parsedLog.name === eventToSearch) {
          parsedLogs.push(parsedLog);
        }
      } catch (e) {
        console.error(e);
      }
    });

    return parsedLogs[0];
  }
}
