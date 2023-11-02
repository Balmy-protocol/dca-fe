import { BigNumber, ethers } from 'ethers';
import { AxiosInstance } from 'axios';
import { LATEST_VERSION, MEAN_API_URL } from '@constants';
import {
  AllowedPairs,
  BlowfishResponse,
  CampaignTypes,
  MeanApiUnderlyingResponse,
  MeanFinanceAllowedPairsResponse,
  MeanFinanceResponse,
  OptimismAirdropCampaingResponse,
  PermissionPermit,
  RawCampaign,
  RawCampaigns,
  Token,
  PositionVersions,
  AccountLabelsAndContactListResponse,
  AccountLabels,
  PostAccountLabels,
  AccountLabelsAndContactList,
  ContactList,
  PostContacts,
  UserType,
} from '@types';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { CLAIM_ABIS } from '@constants/campaigns';
import { getAccessToken } from '@privy-io/react-auth';

// MOCKS
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import ContractService from './contractService';
import ProviderService from './providerService';
import AccountService from './accountService';

const DEFAULT_SAFE_DEADLINE_SLIPPAGE = {
  slippagePercentage: 0.1, // 0.1%
  deadline: '48h', // 48hs
};

export default class MeanApiService {
  axiosClient: AxiosInstance;

  contractService: ContractService;

  providerService: ProviderService;

  accountService: AccountService;

  client: ethers.providers.Web3Provider;

  loadedAsSafeApp: boolean;

  constructor(
    contractService: ContractService,
    axiosClient: AxiosInstance,
    providerService: ProviderService,
    accountService: AccountService
  ) {
    this.axiosClient = axiosClient;
    this.contractService = contractService;
    this.providerService = providerService;
    this.accountService = accountService;
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

  async getUnderlyingTokens(tokens: { token: Token; amount: BigNumber }[]) {
    const tokensWithoutAmount = tokens.filter(
      (tokenObj) => !!tokenObj.token.underlyingTokens.length && tokenObj.amount.isZero()
    );
    const tokensToSend = tokens.filter(
      (tokenObj) => !!tokenObj.token.underlyingTokens.length && !tokenObj.amount.isZero()
    );

    // Call to api and get transaction
    const underlyingResponse = await this.axiosClient.post<MeanApiUnderlyingResponse>(
      `${MEAN_API_URL}/v2/transforms/to-underlying`,
      {
        tokens: tokensToSend.map((tokenObj) => ({
          dependent: `${tokenObj.token.chainId}:${tokenObj.token.underlyingTokens[0].address.toString()}`,
          dependentAmount: tokenObj.amount.toString(),
        })),
      }
    );

    const finalResponse = underlyingResponse.data.underlying;
    tokensWithoutAmount.forEach((tokenObj) => {
      const underlyingAddress = tokenObj.token.underlyingTokens[0].address;
      const isProtocolToken = getProtocolToken(tokenObj.token.chainId).address === tokenObj.token.address;
      const wrappedProtocolTokenAddress = getWrappedProtocolToken(tokenObj.token.chainId).address;

      finalResponse[`${tokenObj.token.chainId}-${underlyingAddress}-0`] = {
        underlying: isProtocolToken ? wrappedProtocolTokenAddress : tokenObj.token.address,
        underlyingAmount: '0',
      };
    });

    return finalResponse;
  }

  async migratePosition(
    id: string,
    newFrom: string,
    newTo: string,
    recipient: string,
    positionVersion: PositionVersions,
    chainId: number,
    permissionPermit?: PermissionPermit
  ) {
    const hubAddress = this.contractService.getHUBAddress(chainId, positionVersion);
    const newHubAddress = this.contractService.getHUBAddress(chainId, LATEST_VERSION);

    // Call to api and get transaction
    const transactionResponse = await this.axiosClient.post<MeanFinanceResponse>(
      `${MEAN_API_URL}/v1/dca/networks/${chainId}/actions/swap-and-migrate`,
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

    return this.providerService.sendTransactionWithGasLimit({
      ...transactionResponse.data.tx,
      from: recipient,
    });
  }

  async getAllowedPairs(chainId: number): Promise<AllowedPairs> {
    const chainIdTouse = chainId;
    try {
      const allowedPairsResponse = await this.axiosClient.get<MeanFinanceAllowedPairsResponse>(
        `${MEAN_API_URL}/v1/dca/networks/${chainIdTouse}/config`
      );

      return allowedPairsResponse.data.supportedPairs.map((allowedPair) => ({
        tokenA: emptyTokenWithAddress(allowedPair.tokenA),
        tokenB: emptyTokenWithAddress(allowedPair.tokenB),
      }));
    } catch {
      return [];
    }
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

  async getCampaigns(address: string): Promise<RawCampaigns> {
    let optimismClaimCampaign: RawCampaign | undefined;
    try {
      const getOptimismClaimCampaignData = await this.axiosClient.get<OptimismAirdropCampaingResponse>(
        `${MEAN_API_URL}/v1/optimism-airdrop/${address}`
      );

      optimismClaimCampaign = {
        name: 'Optimism Airdrop',
        proof: getOptimismClaimCampaignData.data.proof,
        claimContract: '0xf453cc2cb0d016a028a34162cf1f9efbb799c2d7',
        tokens: [
          {
            token: '0x4200000000000000000000000000000000000042',
            symbol: 'OP',
            name: 'Optimism',
            decimals: 18,
            amount: getOptimismClaimCampaignData.data.op,
          },
        ],
        type: CampaignTypes.optimismAirdrop,
        typeData: { positions: getOptimismClaimCampaignData.data.positions },
        claimed: false,
      };

      const provider = await this.providerService.getSigner(address);

      const contract = new ethers.Contract(optimismClaimCampaign.claimContract, CLAIM_ABIS.optimismAirdrop, provider);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const claimed = (await contract.claimed(address)) as boolean;

      optimismClaimCampaign.claimed = claimed;
    } catch (e) {
      console.error(e);
    }

    return {
      10: {
        ...((optimismClaimCampaign && { optimismAirdrop: optimismClaimCampaign }) || {}),
      },
    };
  }

  private async authorizedRequest<TResponse>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: unknown
  ): Promise<TResponse> {
    const user = this.accountService.getUser();

    if (!user) {
      throw new Error('User not existent');
    }

    let authToken: Nullable<string> = null;
    let authorizationHeader: Nullable<string> = null;

    if (user.type === UserType.privy) {
      authToken = await getAccessToken();

      if (!authToken) {
        throw new Error('Authorization token not available');
      }

      authorizationHeader = `PRIVY token="${authToken}"`;
    } else if (user.type === UserType.wallet) {
      authorizationHeader = `WALLET expiration="${user.signature.expiration}", signature="${user.signature.message}"`;
    }

    if (!authorizationHeader) {
      throw new Error('Could not create authorization header');
    }

    const headers = {
      Authorization: authorizationHeader,
    };

    const response = await this.axiosClient.request<TResponse>({
      method,
      url,
      headers,
      data,
    });
    return response.data;
  }

  async getAccountLabelsAndContactList(): Promise<AccountLabelsAndContactList> {
    const user = this.accountService.getUser();
    const accountId = user?.id;

    if (!accountId) {
      throw new Error('User not signed in');
    }

    const accountResponse = await this.authorizedRequest<AccountLabelsAndContactListResponse>(
      'GET',
      `${MEAN_API_URL}/v1/accounts/${accountId}`
    );

    const parsedAccountData: AccountLabelsAndContactList = {
      ...accountResponse,
      contacts: accountResponse.contacts.map((contact) => ({
        address: contact.wallet,
        label: accountResponse.labels[contact.wallet],
      })),
    };

    return parsedAccountData;
  }

  async postAccountLabels(labels: AccountLabels): Promise<void> {
    const user = this.accountService.getUser();
    const accountId = user?.id;

    if (!accountId) {
      throw new Error('User not signed in');
    }

    const parsedLabels: PostAccountLabels = {
      labels: Object.entries(labels).map(([wallet, label]) => ({ wallet, label })),
    };

    await this.authorizedRequest('POST', `${MEAN_API_URL}/v1/accounts/${accountId}/labels`, parsedLabels);
  }

  async putAccountLabel(newLabel: string, labeledAddress: string): Promise<void> {
    const user = this.accountService.getUser();
    const accountId = user?.id;

    if (!accountId) {
      throw new Error('User not signed in');
    }

    await this.authorizedRequest('PUT', `${MEAN_API_URL}/v1/accounts/${accountId}/labels/${labeledAddress}`, {
      newLabel,
    });
  }

  async deleteAccountLabel(labeledAddress: string): Promise<void> {
    const user = this.accountService.getUser();
    const accountId = user?.id;

    if (!accountId) {
      throw new Error('User not signed in');
    }

    await this.authorizedRequest('DELETE', `${MEAN_API_URL}/v1/accounts/${accountId}/labels/${labeledAddress}`);
  }

  async postContacts(contacts: ContactList): Promise<void> {
    const user = this.accountService.getUser();
    const accountId = user?.id;

    if (!accountId) {
      throw new Error('User not signed in');
    }

    const parsedContacts: PostContacts = {
      contacts: contacts.map((contact) => ({
        contact: contact.address,
        label: contact.label,
      })),
    };

    await this.authorizedRequest('POST', `${MEAN_API_URL}/v1/accounts/${accountId}/contacts`, {
      contacts: parsedContacts,
    });
  }

  async deleteContact(contactAddress: string): Promise<void> {
    const user = this.accountService.getUser();
    const accountId = user?.id;

    if (!accountId) {
      throw new Error('User not signed in');
    }

    await this.authorizedRequest('DELETE', `${MEAN_API_URL}/v1/accounts/${accountId}/contacts/${contactAddress}`);
  }
}
