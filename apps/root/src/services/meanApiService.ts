import { BigNumber, ethers } from 'ethers';
import { AxiosInstance } from 'axios';
import { MEAN_API_URL } from '@constants';
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
  AccountLabelsAndContactListResponse,
  AccountLabels,
  PostAccountLabels,
  AccountLabelsAndContactList,
  ContactList,
  PostContacts,
  Account,
  AccountId,
  ApiNewWallet,
  ApiWalletAdminConfig,
  WalletSignature,
  AccountBalancesResponse,
} from '@types';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { CLAIM_ABIS } from '@constants/campaigns';
import { BaseProvider } from '@ethersproject/providers';

// MOCKS
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';

const DEFAULT_SAFE_DEADLINE_SLIPPAGE = {
  slippagePercentage: 0.1, // 0.1%
  deadline: '48h', // 48hs
};

export default class MeanApiService {
  axiosClient: AxiosInstance;

  client: ethers.providers.Web3Provider;

  loadedAsSafeApp: boolean;

  constructor(axiosClient: AxiosInstance) {
    this.axiosClient = axiosClient;
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

  async migratePosition({
    id,
    newFrom,
    newTo,
    recipient,
    chainId,
    permissionPermit,
    hubAddress,
    newHubAddress,
  }: {
    id: string;
    newFrom: string;
    newTo: string;
    recipient: string;
    chainId: number;
    permissionPermit?: PermissionPermit;
    hubAddress: string;
    newHubAddress: string;
  }) {
    return this.axiosClient.post<MeanFinanceResponse>(
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

  async getCampaigns(address: string, provider: BaseProvider): Promise<RawCampaigns> {
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

  private async authorizedRequest<TResponse>({
    method,
    url,
    signature,
    data,
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    signature: WalletSignature;
    data?: unknown;
  }): Promise<TResponse> {
    let authorizationHeader: Nullable<string> = null;

    authorizationHeader = `WALLET expiration="${signature.expiration}", signature="${signature.message}"`;

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

  async getAccountLabelsAndContactList({
    accountId,
    signature,
  }: {
    accountId: string;
    signature: WalletSignature;
  }): Promise<AccountLabelsAndContactList> {
    const accountResponse = await this.authorizedRequest<AccountLabelsAndContactListResponse>({
      method: 'GET',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}`,
      signature,
    });

    const parsedAccountData: AccountLabelsAndContactList = {
      ...accountResponse,
      contacts: accountResponse.contacts.map((contact) => ({
        address: contact.wallet,
        label: accountResponse.labels[contact.wallet],
      })),
    };

    return parsedAccountData;
  }

  async postAccountLabels({
    labels,
    accountId,
    signature,
  }: {
    labels: AccountLabels;
    accountId: string;
    signature: WalletSignature;
  }): Promise<void> {
    const parsedLabels: PostAccountLabels = {
      labels: Object.entries(labels).map(([wallet, label]) => ({ wallet, label })),
    };

    await this.authorizedRequest({
      method: 'POST',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/labels`,
      signature,
      data: parsedLabels,
    });
  }

  async putAccountLabel({
    newLabel,
    labeledAddress,
    accountId,
    signature,
  }: {
    newLabel: string;
    labeledAddress: string;
    accountId: string;
    signature: WalletSignature;
  }): Promise<void> {
    await this.authorizedRequest({
      method: 'PUT',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/labels/${labeledAddress}`,
      data: { label: newLabel },
      signature,
    });
  }

  async deleteAccountLabel({
    labeledAddress,
    accountId,
    signature,
  }: {
    labeledAddress: string;
    accountId: string;
    signature: WalletSignature;
  }): Promise<void> {
    await this.authorizedRequest({
      method: 'DELETE',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/labels/${labeledAddress}`,
      signature,
    });
  }

  async postContacts({
    contacts,
    accountId,
    signature,
  }: {
    contacts: ContactList;
    accountId: string;
    signature: WalletSignature;
  }): Promise<void> {
    const parsedContacts: PostContacts = {
      contacts: contacts.map((contact) => ({
        contact: contact.address,
        label: contact.label,
      })),
    };

    await this.authorizedRequest({
      method: 'POST',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/contacts`,
      data: {
        contacts: parsedContacts,
      },
      signature,
    });
  }

  async deleteContact({
    contactAddress,
    accountId,
    signature,
  }: {
    contactAddress: string;
    accountId: string;
    signature: WalletSignature;
  }): Promise<void> {
    await this.authorizedRequest({
      method: 'DELETE',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/contacts/${contactAddress}`,
      signature,
    });
  }

  async getAccounts({ signature }: { signature: WalletSignature }) {
    return this.authorizedRequest<{ accounts: Account[] }>({
      method: 'GET',
      url: `${MEAN_API_URL}/v1/accounts`,
      signature,
    });
  }

  async createAccount({ label, signature }: { label: string; signature: WalletSignature }) {
    return this.authorizedRequest<{ accountId: AccountId }>({
      method: 'POST',
      url: `${MEAN_API_URL}/v1/accounts`,
      data: {
        label,
      },
      signature,
    });
  }

  async linkWallet({
    wallet,
    accountId,
    signature,
  }: {
    wallet: ApiNewWallet;
    accountId: string;
    signature: WalletSignature;
  }) {
    return this.authorizedRequest({
      method: 'POST',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/wallets`,
      data: {
        wallets: [wallet],
      },
      signature,
    });
  }

  async modifyWallet({
    walletConfig,
    address,
    accountId,
    signature,
  }: {
    address: string;
    accountId: string;
    walletConfig: ApiWalletAdminConfig;
    signature: WalletSignature;
  }) {
    return this.authorizedRequest({
      method: 'PUT',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/wallets/${address}`,
      data: walletConfig,
      signature,
    });
  }

  async unlinkWallet({
    address,
    accountId,
    signature,
  }: {
    address: string;
    accountId: string;
    signature: WalletSignature;
  }) {
    return this.authorizedRequest({
      method: 'DELETE',
      url: `${MEAN_API_URL}/v1/accounts/${accountId}/wallets/${address}`,
      signature,
    });
  }

  async getAccountBalances({
    wallets,
    chainIds,
  }: {
    wallets: string[];
    chainIds: number[];
  }): Promise<AccountBalancesResponse> {
    const params = {
      chains: chainIds.join(','),
      addresses: wallets.join(','),
    };
    const response = await this.axiosClient.get<AccountBalancesResponse>(`${MEAN_API_URL}/v1/balances`, { params });
    return response.data;
  }

  async invalidateCacheForBalances(
    items: {
      chainId: number;
      address: string;
      token: string;
    }[]
  ): Promise<void> {
    await this.axiosClient.put(`${MEAN_API_URL}/v1/balances/invalidate`, items);
  }
}
