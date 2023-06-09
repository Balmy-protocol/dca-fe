import { BigNumber } from 'ethers';
import findKey from 'lodash/findKey';
import { parseUnits } from '@ethersproject/units';
import { AxiosInstance, AxiosResponse } from 'axios';
import { Token } from '@types';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import {
  DEFILLAMA_IDS,
  DEFILLAMA_PROTOCOL_TOKEN_ADDRESS,
  INDEX_TO_PERIOD,
  INDEX_TO_SPAN,
  NETWORKS,
  STABLE_COINS,
  ZRX_API_ADDRESS,
} from '@constants';
import { DateTime } from 'luxon';
import { emptyTokenWithAddress } from '@common/utils/currency';
import ContractService from './contractService';
import WalletService from './walletService';
import ProviderService from './providerService';

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

export default class PriceService {
  axiosClient: AxiosInstance;

  walletService: WalletService;

  contractService: ContractService;

  providerService: ProviderService;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    axiosClient: AxiosInstance,
    providerService: ProviderService
  ) {
    this.walletService = walletService;
    this.axiosClient = axiosClient;
    this.contractService = contractService;
    this.providerService = providerService;
  }

  // TOKEN METHODS
  async getUsdHistoricPrice(tokens: Token[], date?: string, chainId?: number) {
    const network = await this.providerService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const defillamaId = DEFILLAMA_IDS[chainIdToUse] || findKey(NETWORKS, { chainId: chainIdToUse });
    if (!tokens.length || !defillamaId) {
      return {};
    }
    const mappedTokens = tokens.map((token) =>
      token.address === PROTOCOL_TOKEN_ADDRESS ? emptyTokenWithAddress(DEFILLAMA_PROTOCOL_TOKEN_ADDRESS) : token
    );
    const defillamaToknes = mappedTokens.map((token) => `${defillamaId}:${token.address}`).join(',');

    const price = await this.axiosClient.get<{ coins: Record<string, { price: number }> }>(
      date
        ? `https://coins.llama.fi/prices/historical/${parseInt(date, 10)}/${defillamaToknes}`
        : `https://coins.llama.fi/prices/current/${defillamaToknes}`
    );

    const tokensPrices = mappedTokens
      .filter(
        (token) =>
          price.data.coins &&
          price.data.coins[`${defillamaId}:${token.address}`] &&
          price.data.coins[`${defillamaId}:${token.address}`].price
      )
      .reduce<Record<string, BigNumber>>((acc, token) => {
        const tokenAddressToUse =
          token.address === DEFILLAMA_PROTOCOL_TOKEN_ADDRESS ? PROTOCOL_TOKEN_ADDRESS : token.address;
        let returnedPrice = BigNumber.from(0);

        try {
          returnedPrice = parseUnits(price.data.coins[`${defillamaId}:${token.address}`].price.toFixed(18), 18);
        } catch (e) {
          console.error('Error parsing price for', tokenAddressToUse, e);
        }

        return {
          ...acc,
          [tokenAddressToUse]: returnedPrice,
        };
      }, {});

    return tokensPrices;
  }

  async getProtocolHistoricPrices(dates: string[], chainId?: number) {
    const network = await this.providerService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const defillamaId = DEFILLAMA_IDS[chainIdToUse] || findKey(NETWORKS, { chainId: chainIdToUse });
    if (!defillamaId) {
      return {};
    }
    const expectedResults: Promise<AxiosResponse<{ coins: Record<string, { price: number }> }>>[] = dates.map((date) =>
      this.axiosClient.get<{ coins: Record<string, { price: number }> }>(
        date
          ? `https://coins.llama.fi/prices/historical/${parseInt(
              date,
              10
            )}/${defillamaId}:${DEFILLAMA_PROTOCOL_TOKEN_ADDRESS}`
          : `https://coins.llama.fi/prices/current/${defillamaId}:${DEFILLAMA_PROTOCOL_TOKEN_ADDRESS}`
      )
    );

    const tokensPrices = await Promise.all(expectedResults);

    return tokensPrices.reduce<Record<string, BigNumber>>((acc, priceResponse, index) => {
      const dateToUse = dates[index];
      const price = priceResponse.data.coins[`${defillamaId}:${DEFILLAMA_PROTOCOL_TOKEN_ADDRESS}`].price.toString();
      return {
        ...acc,
        [dateToUse]: parseUnits(price, 18),
      };
    }, {});
  }

  async getZrxGasSwapQuote(from: Token, to: Token, amount: BigNumber, chainId?: number) {
    const network = await this.providerService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const api = ZRX_API_ADDRESS[chainIdToUse];
    const url =
      `${api}/swap/v1/quote` +
      `?sellToken=${from.address}` +
      `&buyToken=${to.address}` +
      `&skipValidation=true` +
      `&slippagePercentage=0.03` +
      `&sellAmount=${amount.toString()}` +
      `&enableSlippageProtection=false`;

    const response = await this.axiosClient.get<{
      estimatedGas: string;
      data: string;
    }>(url);

    const { estimatedGas, data } = response.data;

    let estimatedOptimismGas: BigNumber | null = null;

    if (chainId === NETWORKS.optimism.chainId) {
      const oeGasOracle = await this.contractService.getOEGasOracleInstance();
      estimatedOptimismGas = await oeGasOracle.getL1GasUsed(data);
    }

    return { estimatedGas, estimatedOptimismGas };
  }

  async getPriceForGraph(
    from: Token,
    to: Token,
    periodIndex = 0,
    chainId?: number,
    tentativeSpan?: number,
    tentativePeriod?: string,
    tentativeEnd?: string
  ) {
    const network = await this.providerService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const wrappedProtocolToken = getWrappedProtocolToken(chainIdToUse);
    const span = tentativeSpan || INDEX_TO_SPAN[periodIndex];
    const period = tentativePeriod || INDEX_TO_PERIOD[periodIndex];
    const toAddress = to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : to.address;
    const fromAddress = from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : from.address;
    const end = tentativeEnd || DateTime.now().toSeconds();

    let tokenA: GraphToken = { ...emptyTokenWithAddress(fromAddress), isBaseToken: false };
    let tokenB: GraphToken = { ...emptyTokenWithAddress(toAddress), isBaseToken: false };
    if (fromAddress < toAddress) {
      tokenA = {
        ...(from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from),
        symbol: from.symbol,
        isBaseToken: STABLE_COINS.includes(from.symbol),
      };
      tokenB = {
        ...(to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
    } else {
      tokenA = {
        ...(to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
      tokenB = {
        ...(from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from),
        symbol: from.symbol,
        isBaseToken: STABLE_COINS.includes(from.symbol),
      };
    }

    const defillamaId = DEFILLAMA_IDS[chainIdToUse] || findKey(NETWORKS, { chainId: chainIdToUse });
    if (!defillamaId) {
      return [];
    }
    const prices = await this.axiosClient.get<{
      coins: Record<string, { prices: { timestamp: number; price: number }[] }>;
    }>(
      `https://coins.llama.fi/chart/${defillamaId}:${tokenA.address},${defillamaId}:${
        tokenB.address
      }?period=${period}&span=${span}${(end && `&end=${end}`) || ''}`
    );

    const {
      data: { coins },
    } = prices;

    const tokenAPrices =
      coins && coins[`${defillamaId}:${tokenA.address}`] && coins[`${defillamaId}:${tokenA.address}`].prices;
    const tokenBPrices =
      coins && coins[`${defillamaId}:${tokenB.address}`] && coins[`${defillamaId}:${tokenB.address}`].prices;

    const tokenAIsBaseToken = STABLE_COINS.includes(tokenA.symbol);

    const graphData = tokenAPrices.reduce<{ timestamp: number; rate: number }[]>((acc, { price, timestamp }, index) => {
      const tokenBPrice = tokenBPrices[index] && tokenBPrices[index].price;
      if (!tokenBPrice) {
        return acc;
      }

      return [
        ...acc,
        {
          timestamp,
          rate: tokenAIsBaseToken ? tokenBPrice / price : price / tokenBPrice,
        },
      ];
    }, []);

    return graphData;
  }
}
