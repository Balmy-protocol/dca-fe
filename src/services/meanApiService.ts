import { BigNumber, ethers } from 'ethers';
import { AxiosInstance } from 'axios';
import { LATEST_VERSION, MEAN_API_URL, PositionVersions } from 'config';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import {
  AllowedPairs,
  BlowfishResponse,
  MeanApiUnderlyingResponse,
  MeanFinanceAllowedPairsResponse,
  MeanFinanceResponse,
  PermissionPermit,
  Token,
} from 'types';
import { TransactionRequest } from '@ethersproject/providers';
import { emptyTokenWithAddress } from 'utils/currency';

// MOCKS
import ContractService from './contractService';
import ProviderService from './providerService';

const DEFAULT_SAFE_DEADLINE_SLIPPAGE = {
  slippagePercentage: 0.1, // 0.1%
  deadline: '48h', // 48hs
};

export default class MeanApiService {
  axiosClient: AxiosInstance;

  contractService: ContractService;

  providerService: ProviderService;

  client: ethers.providers.Web3Provider;

  loadedAsSafeApp: boolean;

  constructor(contractService: ContractService, axiosClient: AxiosInstance, providerService: ProviderService) {
    this.axiosClient = axiosClient;
    this.contractService = contractService;
    this.providerService = providerService;
    this.loadedAsSafeApp = false;
  }

  getLoadedAsSafeApp() {
    return this.loadedAsSafeApp;
  }

  setLoadedAsSafeApp(loadedAsSafeApp: boolean) {
    this.loadedAsSafeApp = loadedAsSafeApp;
  }

  getDeadlineSlippageDefault() {
    if (this.getLoadedAsSafeApp()) {
      return DEFAULT_SAFE_DEADLINE_SLIPPAGE;
    }

    return {};
  }

  async addGasLimit(tx: TransactionRequest): Promise<TransactionRequest> {
    const gasUsed = await this.providerService.estimateGas(tx);

    return {
      ...tx,
      gasLimit: gasUsed.mul(BigNumber.from(130)).div(BigNumber.from(100)), // 30% more
    };
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
    permissions: { operator: string; permissions: number[] }[]
  ) {
    const currentNetwork = await this.providerService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const fromToUse = from === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : from;
    const toTouse = to === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : to;

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/actions/swap-and-deposit`,
      {
        takeFromCaller: { token: from, amount: totalAmmount.toString() },
        from: yieldFrom || fromToUse,
        to: yieldTo || toTouse,
        amountOfSwaps: swaps.toNumber(),
        swapInterval: interval.toNumber(),
        owner: account,
        hub: hubAddress,
        permissions,
        dex: { only: 'MeanTransformer' },
        ...this.getDeadlineSlippageDefault(),
      }
    );

    const transactionToSend = await this.addGasLimit(transactionResponse.data.tx);

    return this.providerService.sendTransaction(transactionToSend);
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
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const hubAddress = await this.contractService.getHUBAddress();
    const toTouse = to === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : to;

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/actions/swap-and-deposit`,
      {
        takeFromCaller: { token: from, amount: totalAmmount.toString() },
        from: wrappedProtocolToken.address,
        to: toTouse,
        amountOfSwaps: swaps.toNumber(),
        swapInterval: interval.toNumber(),
        owner: account,
        hub: hubAddress,
        permissions,
        dex: { only: 'MeanTransformer' },
        ...this.getDeadlineSlippageDefault(),
      }
    );

    const transactionToSend = await this.addGasLimit(transactionResponse.data.tx);

    return this.providerService.sendTransaction(transactionToSend);
  }

  async getUnderlyingTokens(tokens: { token: Token; amount: BigNumber }[]) {
    const tokensToUse = tokens.filter((tokenObj) => !!tokenObj.token.underlyingTokens.length);

    // Call to api and get transaction
    const underlyingResponse = await this.axiosClient.post<MeanApiUnderlyingResponse>(
      `${MEAN_API_URL}/v2/transforms/to-underlying`,
      {
        tokens: tokensToUse.map((tokenObj) => ({
          dependent: `${tokenObj.token.chainId}:${tokenObj.token.underlyingTokens[0].address.toString()}`,
          dependentAmount: tokenObj.amount.toString(),
        })),
      }
    );

    return underlyingResponse.data.underlying;
  }

  async withdrawSwappedUsingOtherToken(
    id: string,
    recipient: string,
    positionVersion: PositionVersions,
    convertTo: string,
    permissionPermit?: PermissionPermit
  ) {
    const currentNetwork = await this.providerService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/actions/withdraw-and-swap`,
      {
        positionId: id,
        convertTo,
        recipient,
        hub: hubAddress,
        permissionPermit,
        dex: { only: 'MeanTransformer' },
        ...this.getDeadlineSlippageDefault(),
      }
    );

    const transactionToSend = await this.addGasLimit(transactionResponse.data.tx);

    return this.providerService.sendTransaction(transactionToSend);
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
    const currentNetwork = await this.providerService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/actions/terminate-and-swap`,
      {
        positionId: id,
        recipient: recipientSwapped,
        unswappedConvertTo: tokenFrom,
        swappedConvertTo: tokenTo,
        hub: hubAddress,
        permissionPermit,
        dex: { only: 'MeanTransformer' },
        ...this.getDeadlineSlippageDefault(),
      }
    );

    const transactionToSend = await this.addGasLimit(transactionResponse.data.tx);

    return this.providerService.sendTransaction(transactionToSend);
  }

  async increasePositionUsingOtherToken(
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    positionVersion: PositionVersions,
    tokenFrom: string,
    permissionPermit?: PermissionPermit
  ) {
    const currentNetwork = await this.providerService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/actions/swap-and-increase`,
      {
        takeFromCaller: { token: tokenFrom, amount: newAmount.toString() },
        positionId: id,
        amountOfSwaps: newSwaps.toNumber(),
        hub: hubAddress,
        permissionPermit,
        dex: { only: 'MeanTransformer' },
        ...this.getDeadlineSlippageDefault(),
      }
    );

    const transactionToSend = await this.addGasLimit(transactionResponse.data.tx);

    return this.providerService.sendTransaction(transactionToSend);
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
    const currentNetwork = await this.providerService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/actions/reduce-to-buy`,
      {
        positionId: id,
        buy: {
          amount: newAmount.toString(),
          token: tokenFrom,
        },
        amountOfSwaps: newSwaps.toNumber(),
        recipient,
        dex: { only: 'MeanTransformer' },
        hub: hubAddress,
        permissionPermit,
        ...this.getDeadlineSlippageDefault(),
      }
    );

    const transactionToSend = await this.addGasLimit(transactionResponse.data.tx);

    return this.providerService.sendTransaction(transactionToSend);
  }

  async migratePosition(
    id: string,
    newFrom: string,
    newTo: string,
    recipient: string,
    positionVersion: PositionVersions,
    permissionPermit?: PermissionPermit
  ) {
    const currentNetwork = await this.providerService.getNetwork();
    const hubAddress = await this.contractService.getHUBAddress(positionVersion);
    const newHubAddress = await this.contractService.getHUBAddress(LATEST_VERSION);

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/actions/swap-and-migrate`,
      {
        sourceHub: hubAddress,
        targetHub: newHubAddress,
        swappedRecipient: recipient,
        positionId: id,
        newFrom,
        newTo,
        permissionPermit,
        ...this.getDeadlineSlippageDefault(),
      }
    );

    const transactionToSend = await this.addGasLimit(transactionResponse.data.tx);

    return this.providerService.sendTransaction(transactionToSend);
  }

  async getAllowedPairs(): Promise<AllowedPairs> {
    const currentNetwork = await this.providerService.getNetwork();
    try {
      const allowedPairsResponse = await this.axiosClient.get<MeanFinanceAllowedPairsResponse>(
        `${MEAN_API_URL}/v1/dca/networks/${currentNetwork.chainId}/config`
      );

      return allowedPairsResponse.data.supportedPairs.map((allowedPair) => ({
        tokenA: emptyTokenWithAddress(allowedPair.tokenA),
        tokenB: emptyTokenWithAddress(allowedPair.tokenB),
      }));
    } catch {
      return [];
    }
  }

  async getAllowanceTarget() {
    const currentNetwork = await this.providerService.getNetwork();
    const allowanceResponse = await this.axiosClient.get<{ allowanceTarget: string }>(
      `${MEAN_API_URL}/v1/swap/networks/${currentNetwork.chainId}/allowance-target`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
        cache: {
          maxAge: 0,
        },
      }
    );

    return allowanceResponse.data.allowanceTarget;
  }

  async logError(error: string, errorMessage: string, extraData?: unknown) {
    return this.axiosClient.post(`${MEAN_API_URL}/v1/error-reporting`, {
      error,
      errorMessage,
      url: window.location.pathname,
      extraData,
    });
  }

  async logFeedback(action: string, description: string) {
    return this.axiosClient.post(`${MEAN_API_URL}/v1/log-feedback`, {
      action,
      description,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async trackEvent(action: string, extraData: any) {
    return this.axiosClient.post(`${MEAN_API_URL}/v1/mixpanel-track`, {
      action,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      extraData,
    });
  }

  async simulateTransaction(
    txObject: {
      from: string;
      to: string;
      value: string;
      data: string;
    },
    userAccount: string,
    metadata: {
      origin: string;
    },
    chainId: number
  ) {
    return this.axiosClient.post<BlowfishResponse>(`${MEAN_API_URL}/v1/simulate-blowfish-transaction/${chainId}`, {
      txObject,
      userAccount,
      metadata,
    });
  }
}
