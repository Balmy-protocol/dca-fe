import { BigNumber, ethers } from 'ethers';
import { AxiosInstance } from 'axios';
import { MEAN_API_URL, PositionVersions } from 'config';

// MOCKS
import ContractService from './contractService';
import WalletService from './walletService';
import { getWrappedProtocolToken } from 'mocks/tokens';
import { TransactionRequest } from '@ethersproject/providers';
import { MeanFinanceResponse, PermissionPermit } from 'types';

export default class MeanApiService {
  axiosClient: AxiosInstance;

  walletService: WalletService;

  contractService: ContractService;

  client: ethers.providers.Web3Provider;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    axiosClient: AxiosInstance,
    client?: ethers.providers.Web3Provider
  ) {
    if (client) {
      this.client = client;
    }
    this.walletService = walletService;
    this.axiosClient = axiosClient;
    this.contractService = contractService;
  }

  setClient(client: ethers.providers.Web3Provider) {
    this.client = client;
  }

  async depositUsingProtocolToken(
    from: string,
    to: string,
    totalAmmount: BigNumber,
    swaps: BigNumber,
    interval: BigNumber,
    account: string,
    permissions: { operator: string; permissions: string[] }[]
  ) {
    const singer = this.walletService.getSigner();
    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const hubAddress = await this.contractService.getHUBAddress();

    // Call to api and get transaction
    const transactionToSend = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/dca/networks/${currentNetwork.chainId}/actions/swap-and-deposit`,
      {
        takeFromCaller: { token: from, amount: totalAmmount.toString() },
        from: wrappedProtocolToken.address,
        to,
        amountOfSwaps: swaps.toNumber(),
        swapInterval: interval.toNumber(),
        owner: account,
        hub: hubAddress,
        permissions,
      }
    );

    return singer.sendTransaction(transactionToSend.data.tx);
  }

  withdrawSwappedUsingProtocolToken(
    id: string,
    recipient: string,
    positionVersion: PositionVersions,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    // Call to api and get transaction
    const transactionToSend = {};

    return singer.sendTransaction(transactionToSend);
  }

  terminateUsingProtocolTokenAsFrom(
    id: string,
    recipientUnswapped: string,
    recipientSwapped: string,
    positionVersion: PositionVersions,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    // Call to api and get transaction
    const transactionToSend = {};

    return singer.sendTransaction(transactionToSend);
  }

  terminateUsingProtocolTokenAsTo(
    id: string,
    recipientUnswapped: string,
    recipientSwapped: string,
    positionVersion: PositionVersions,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    // Call to api and get transaction
    const transactionToSend = {};

    return singer.sendTransaction(transactionToSend);
  }

  increasePositionUsingProtocolToken(
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    positionVersion: PositionVersions,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    // Call to api and get transaction
    const transactionToSend = {};

    return singer.sendTransaction(transactionToSend);
  }

  reducePositionUsingProtocolToken(
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    recipient: string,
    positionVersion: PositionVersions,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    // Call to api and get transaction
    const transactionToSend = {};

    return singer.sendTransaction(transactionToSend);
  }
}
