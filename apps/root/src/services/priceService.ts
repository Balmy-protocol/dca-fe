import { AxiosInstance } from 'axios';
import { Timestamp, Token } from '@types';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { INDEX_TO_PERIOD, INDEX_TO_SPAN, STABLE_COINS, getTokenAddressForPriceFetching } from '@constants';
import ContractService from './contractService';
import WalletService from './walletService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import { parseNumberUsdPriceToBigInt } from '@common/utils/currency';
import { TimeString } from '@balmy/sdk';

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

export default class PriceService {
  axiosClient: AxiosInstance;

  walletService: WalletService;

  contractService: ContractService;

  providerService: ProviderService;

  sdkService: SdkService;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    axiosClient: AxiosInstance,
    providerService: ProviderService,
    sdkService: SdkService
  ) {
    this.walletService = walletService;
    this.axiosClient = axiosClient;
    this.contractService = contractService;
    this.providerService = providerService;
    this.sdkService = sdkService;
  }

  // TOKEN METHODS
  async getUsdHistoricPrice(tokens: Token[], date?: string, chainId?: number) {
    if (!tokens.length) {
      return {};
    }
    const chainIdToUse = chainId || tokens[0].chainId;
    const mappedTokens = tokens.map((token) => ({
      ...token,
      fetchingAddress: getTokenAddressForPriceFetching(token.chainId, token.address),
    }));
    const addresses = mappedTokens.map((token) => token.fetchingAddress);

    const prices = date
      ? await this.sdkService.sdk.priceService.getHistoricalPricesInChain({
          chainId: chainIdToUse,
          tokens: addresses,
          timestamp: parseInt(date, 10),
        })
      : await this.sdkService.sdk.priceService.getCurrentPricesInChain({ chainId: chainIdToUse, tokens: addresses });

    const tokensPrices = mappedTokens
      .filter((token) => prices[token.fetchingAddress] && prices[token.fetchingAddress].price)
      .reduce<Record<string, bigint>>((acc, token) => {
        let returnedPrice = 0n;

        try {
          returnedPrice = parseNumberUsdPriceToBigInt(prices[token.fetchingAddress].price);
        } catch (e) {
          console.error('Error parsing price for', token.address, e);
        }

        return {
          ...acc,
          [token.address]: returnedPrice,
        };
      }, {});

    return tokensPrices;
  }

  async getProtocolHistoricPrices(dates: string[], chainId: number) {
    const protocolToken = getProtocolToken(chainId);
    const pricePromises = dates.map((date) => this.getUsdHistoricPrice([protocolToken], date, chainId));

    const tokenPrices = await Promise.all(pricePromises);

    return tokenPrices.reduce<Record<string, bigint>>((acc, priceResponse, index) => {
      const dateToUse = dates[index];
      // eslint-disable-next-line no-param-reassign
      acc[dateToUse] = priceResponse[protocolToken.address];
      return acc;
    }, {});
  }

  async getPriceForGraph({
    from,
    to,
    periodIndex = 0,
    chainId,
    tentativeSpan,
    tentativePeriod,
    tentativeEnd,
  }: {
    from: Token;
    to: Token;
    periodIndex?: number;
    chainId?: number;
    tentativeSpan?: number;
    tentativePeriod?: TimeString;
    tentativeEnd?: Timestamp;
  }) {
    const chainIdToUse = chainId || from.chainId;
    const wrappedProtocolToken = getWrappedProtocolToken(chainIdToUse);
    const span = tentativeSpan || INDEX_TO_SPAN[periodIndex];
    const period = tentativePeriod || INDEX_TO_PERIOD[periodIndex];

    const adjustedFrom =
      from.address === PROTOCOL_TOKEN_ADDRESS
        ? wrappedProtocolToken
        : { ...from, address: getTokenAddressForPriceFetching(from.chainId, from.address) };
    const adjustedTo =
      to.address === PROTOCOL_TOKEN_ADDRESS
        ? wrappedProtocolToken
        : { ...to, address: getTokenAddressForPriceFetching(to.chainId, to.address) };

    let tokenA: GraphToken;
    let tokenB: GraphToken;
    if (adjustedFrom.address < adjustedTo.address) {
      tokenA = {
        ...adjustedFrom,
        isBaseToken: STABLE_COINS.includes(adjustedFrom.symbol),
      };
      tokenB = {
        ...adjustedTo,
        isBaseToken: STABLE_COINS.includes(adjustedTo.symbol),
      };
    } else {
      tokenA = {
        ...adjustedTo,
        isBaseToken: STABLE_COINS.includes(adjustedTo.symbol),
      };
      tokenB = {
        ...adjustedFrom,
        isBaseToken: STABLE_COINS.includes(adjustedFrom.symbol),
      };
    }

    const tokens = [
      { chainId: chainIdToUse, token: tokenA.address },
      { chainId: chainIdToUse, token: tokenB.address },
    ];

    const prices = await this.sdkService.sdk.priceService.getChart({
      span,
      period,
      tokens,
      bound: {
        upTo: tentativeEnd || 'now',
      },
    });

    const tokenAPrices = prices[chainIdToUse][tokenA.address];
    const tokenBPrices = prices[chainIdToUse][tokenB.address];

    const tokenAIsBaseToken = STABLE_COINS.includes(tokenA.symbol) || !STABLE_COINS.includes(tokenB.symbol);

    const graphData = tokenAPrices.reduce<{ date: number; tokenPrice: string }[]>(
      (acc, { price, closestTimestamp: timestamp }, index) => {
        const tokenBPrice = tokenBPrices[index].price;
        const tokenPrice = tokenAIsBaseToken ? tokenBPrice / price : price / tokenBPrice;
        acc.push({
          date: timestamp,
          tokenPrice: tokenPrice.toString(),
        });
        return acc;
      },
      []
    );

    return graphData;
  }
}
