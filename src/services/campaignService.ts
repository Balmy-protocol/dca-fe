import { BigNumber } from 'ethers';
import { CampaignsWithoutToken } from 'types';
import { emptyTokenWithAddress } from 'utils/currency';
import MeanApiService from './meanApiService';
import PriceService from './priceService';

export default class CampaginService {
  meanApiService: MeanApiService;

  priceService: PriceService;

  constructor(meanApiService: MeanApiService, priceService: PriceService) {
    this.meanApiService = meanApiService;
    this.priceService = priceService;
  }

  async getCampaigns(): Promise<CampaignsWithoutToken> {
    const rawCampaigns = await this.meanApiService.getCampaigns();

    const campaigns = Object.keys(rawCampaigns).reduce(
      (acc, chainId) => [
        ...acc,
        ...Object.keys(rawCampaigns[Number(chainId)]).map((campaignId) => ({
          tokens: rawCampaigns[Number(chainId)][campaignId].tokens.map((token) => ({
            address: token.token,
            balance: BigNumber.from(token.amount),
          })),
          expiresOn: rawCampaigns[Number(chainId)][campaignId].expiresOn,
          id: campaignId,
          title: rawCampaigns[Number(chainId)][campaignId].name,
          chainId: Number(chainId),
          proof: rawCampaigns[Number(chainId)][campaignId].proof,
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

    const pricesPerChain = Object.keys(tokensToFetchPrice).reduce<Record<string, Record<string, BigNumber>>>(
      (acc, chainId, promiseIndex) => ({
        ...acc,
        [chainId]: {
          ...priceChainPromises[promiseIndex],
        },
      }),
      {}
    );

    return campaigns.map((campaign) => ({
      ...campaign,
      tokens: campaign.tokens.map(({ address, balance }) => ({
        address,
        balance,
        usdPrice: pricesPerChain[campaign.chainId][address],
      })),
    }));
  }
}
