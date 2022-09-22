import { BigNumber, ethers } from 'ethers';
import { AxiosInstance } from 'axios';
import { LATEST_VERSION, MEAN_API_URL, PositionVersions } from 'config';
import { getWrappedProtocolToken } from 'mocks/tokens';
import { MeanFinanceResponse, PermissionPermit } from 'types';

// MOCKS
import ContractService from './contractService';
import WalletService from './walletService';

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

  async depositUsingYield(
    from: string,
    to: string,
    totalAmmount: BigNumber,
    swaps: BigNumber,
    interval: BigNumber,
    yieldFrom: string | undefined,
    yieldTo: string | undefined,
    account: string,
    permissions: { operator: string; permissions: string[] }[]
  ) {
    const singer = this.walletService.getSigner();
    const currentNetwork = await this.walletService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress();

    // Call to api and get transaction
    const transactionToSend = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/dca/networks/${currentNetwork.chainId}/actions/swap-and-deposit`,
      {
        takeFromCaller: { token: from, amount: totalAmmount.toString() },
        from: yieldFrom || from,
        to: yieldTo || to,
        amountOfSwaps: swaps.toNumber(),
        swapInterval: interval.toNumber(),
        owner: account,
        hub: hubAddress,
        permissions,
      }
    );

    return singer.sendTransaction(transactionToSend.data.tx);
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

  async withdrawSwappedUsingOtherToken(
    id: string,
    recipient: string,
    positionVersion: PositionVersions,
    convertTo: string,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    const currentNetwork = await this.walletService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionToSend = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/dca/networks/${currentNetwork.chainId}/actions/withdraw-and-swap`,
      {
        positionId: id,
        convertTo,
        recipient,
        hub: hubAddress,
        permissionPermit,
      }
    );

    return singer.sendTransaction(transactionToSend.data.tx);
  }

  async terminateUsingOtherTokens(
    id: string,
    recipientUnswapped: string,
    recipientSwapped: string,
    positionVersion: PositionVersions,
    tokenFrom: string,
    tokenTo: string,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    const currentNetwork = await this.walletService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionToSend = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/dca/networks/${currentNetwork.chainId}/actions/terminate-and-swap`,
      {
        positionId: id,
        recipient: recipientSwapped,
        unswappedConvertFrom: tokenFrom,
        unswappedConvertTo: tokenTo,
        hub: hubAddress,
        permissionPermit,
      }
    );

    return singer.sendTransaction(transactionToSend.data.tx);
  }

  async increasePositionUsingOtherToken(
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    positionVersion: PositionVersions,
    tokenFrom: string,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    const currentNetwork = await this.walletService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionToSend = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/dca/networks/${currentNetwork.chainId}/actions/swap-and-increase`,
      {
        takeFromCaller: { token: tokenFrom, amount: newAmount.toString() },
        positionId: id,
        amountOfSwaps: newSwaps.toNumber(),
        hub: hubAddress,
        permissionPermit,
      }
    );

    return singer.sendTransaction(transactionToSend.data.tx);
  }

  async reducePositionUsingOtherToken(
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    recipient: string,
    positionVersion: PositionVersions,
    tokenFrom: string,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    const currentNetwork = await this.walletService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionToSend = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/dca/networks/${currentNetwork.chainId}/actions/reduce-and-swap`,
      {
        positionId: id,
        amount: newAmount.toString(),
        amountOfSwaps: newSwaps.toNumber(),
        convertTo: tokenFrom,
        recipient,
        hub: hubAddress,
        permissionPermit,
      }
    );

    return singer.sendTransaction(transactionToSend.data.tx);
  }

  async migratePosition(
    id: string,
    newFrom: string,
    newTo: string,
    recipient: string,
    positionVersion: PositionVersions,
    permissionPermit?: PermissionPermit
  ) {
    const singer = this.walletService.getSigner();

    const currentNetwork = await this.walletService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);
    const newHubAddress = await this.contractService.getHUBAddress(LATEST_VERSION);

    // Call to api and get transaction
    const transactionToSend = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/dca/networks/${currentNetwork.chainId}/actions/swap-and-migrate`,
      {
        sourceHub: hubAddress,
        targetHub: newHubAddress,
        swappedRecipient: recipient,
        positionId: id,
        newFrom,
        newTo,
        permissionPermit,
      }
    );

    return singer.sendTransaction(transactionToSend.data.tx);
  }
}
