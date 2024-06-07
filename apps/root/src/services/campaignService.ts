import { Address } from 'viem';
import { Campaign, CampaignWithoutToken, CampaignsWithoutToken, SubmittedTransaction } from '@types';
import { emptyTokenWithAddress } from '@common/utils/currency';
import MeanApiService from './meanApiService';
import PriceService from './priceService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import { NETWORKS } from '@constants';
import ContractService from './contractService';

export default class CampaginService {
  meanApiService: MeanApiService;

  priceService: PriceService;

  providerService: ProviderService;

  sdkService: SdkService;

  contractService: ContractService;

  constructor(
    meanApiService: MeanApiService,
    priceService: PriceService,
    providerService: ProviderService,
    sdkService: SdkService,
    contractService: ContractService
  ) {
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.priceService = priceService;
    this.contractService = contractService;
    this.sdkService = sdkService;
  }

  async getCampaigns(userAddress: Address): Promise<CampaignsWithoutToken> {
    const provider = this.providerService.getProvider(NETWORKS.optimis.chainId);
    const rawCampaigns = await this.meanApiService.getCampaigns(userAddress, provider);

    const campaigns = Object.keys(rawCampaigns).reduce(
      (acc, chainId) => [
        ...acc,
        ...Object.keys(rawCampaigns[Number(chainId)]).map((campaignId) => ({
          tokens: rawCampaigns[Number(chainId)][campaignId].tokens.map((token) => ({
            address: token.token,
            decimals: token.decimals,
            symbol: token.symbol,
            name: token.name,
            balance: BigInt(token.amount),
          })),
          expiresOn: rawCampaigns[Number(chainId)][campaignId].expiresOn,
          id: campaignId,
          title: rawCampaigns[Number(chainId)][campaignId].name,
          chainId: Number(chainId),
          proof: rawCampaigns[Number(chainId)][campaignId].proof,
          type: rawCampaigns[Number(chainId)][campaignId].type,
          typeData: rawCampaigns[Number(chainId)][campaignId].typeData,
          claimed: rawCampaigns[Number(chainId)][campaignId].claimed,
          claimContract: rawCampaigns[Number(chainId)][campaignId].claimContract,
        })),
      ],
      []
    );

    const tokensToFetchPrice: Record<number, string[]> = [];

    campaigns.forEach((campaign) =>
      campaign.tokens.forEach((token) => {
        if (!tokensToFetchPrice[campaign.chainId]) {
          tokensToFetchPrice[campaign.chainId] = [];
        }
        if (tokensToFetchPrice[campaign.chainId].indexOf(token.address) === -1) {
          tokensToFetchPrice[campaign.chainId].push(token.address);
        }
      })
    );

    const priceChainPromises = await Promise.all(
      Object.keys(tokensToFetchPrice).map((chainId) =>
        this.priceService.getUsdHistoricPrice(
          tokensToFetchPrice[Number(chainId)].map((tokenAddess) => emptyTokenWithAddress(tokenAddess)),
          undefined,
          Number(chainId)
        )
      )
    );

    const pricesPerChain = Object.keys(tokensToFetchPrice).reduce<Record<string, Record<string, bigint>>>(
      (acc, chainId, promiseIndex) => {
        // eslint-disable-next-line no-param-reassign
        acc[chainId] = priceChainPromises[promiseIndex];
        return acc;
      },
      {}
    );

    return campaigns.map(
      (campaign) =>
        ({
          ...campaign,
          tokens: campaign.tokens.map(({ address, balance, decimals, symbol, name }) => ({
            address,
            decimals,
            symbol,
            name,
            balance,
            usdPrice: pricesPerChain[campaign.chainId][address],
          })),
        }) as CampaignWithoutToken
    );
  }

  async claim(campaign: Campaign, user: Address): Promise<SubmittedTransaction> {
    if (!campaign.claimContract) {
      throw new Error('Tried to claim a campaign without a contract');
    }

    const contract = await this.contractService.getCampaignInstance(
      { chainId: campaign.chainId, readOnly: false, wallet: user },
      campaign.claimContract,
      campaign.id
    );

    const hash = await contract.write.claimAndSendToClaimee([user, campaign.tokens[0].balance, campaign.proof!], {
      chain: null,
      account: user,
    });

    return {
      hash,
      from: user,
      chainId: campaign.chainId,
    };
  }
}
