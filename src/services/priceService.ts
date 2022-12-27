import { BigNumber, ethers } from 'ethers';
import findKey from 'lodash/findKey';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import { AxiosInstance, AxiosResponse } from 'axios';
import { CoinGeckoPriceResponse, Token, TxPriceResponse } from 'types';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import {
  COINGECKO_IDS,
  DEFAULT_NETWORK_FOR_VERSION,
  DEFILLAMA_IDS,
  DEFILLAMA_PROTOCOL_TOKEN_ADDRESS,
  INDEX_TO_PERIOD,
  INDEX_TO_SPAN,
  LATEST_VERSION,
  NETWORKS,
  STABLE_COINS,
  ZRX_API_ADDRESS,
} from 'config/constants';
import { emptyTokenWithAddress } from 'utils/currency';
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
  async getUsdPrice(token: Token) {
    const network = await this.providerService.getNetwork();
    const price = await this.axiosClient.get<Record<string, { usd: number }>>(
      `https://api.coingecko.com/api/v3/simple/token_price/${
        COINGECKO_IDS[network.chainId] || COINGECKO_IDS[DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION].chainId]
      }?contract_addresses=${token.address}&vs_currencies=usd`
    );

    const usdPrice = price.data[token.address] && price.data[token.address].usd;

    return usdPrice || 0;
  }

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
    const network = await this.walletService.getNetwork();
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
    const network = await this.walletService.getNetwork();
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

  async getTokenQuote(from: Token, to: Token, fromAmount: BigNumber) {
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const fromToUse = from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from;
    const toToUse = to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to;

    const oracleInstance = await this.contractService.getOracleInstance();

    return oracleInstance.quote(fromToUse.address, fromAmount, toToUse.address, []);
  }

  async getGasPrice() {
    const currentNetwork = await this.providerService.getNetwork();

    if (currentNetwork.chainId !== NETWORKS.optimism.chainId && currentNetwork.chainId !== NETWORKS.polygon.chainId)
      return BigNumber.from(0);

    if (currentNetwork.chainId === NETWORKS.optimism.chainId) {
      return this.providerService.getGasPrice();
    }

    if (currentNetwork.chainId === NETWORKS.polygon.chainId) {
      try {
        const polyGasResponse = await this.axiosClient.get<{
          estimatedBaseFee: number;
          standard: { maxPriorityFee: number };
        }>('https://gasstation-mainnet.matic.network/v2');

        return parseUnits(
          (polyGasResponse.data.estimatedBaseFee + polyGasResponse.data.standard.maxPriorityFee).toFixed(9).toString(),
          'gwei'
        );
      } catch {
        return BigNumber.from(0);
      }
    }

    return BigNumber.from(0);
  }

  async getL1GasPrice(data: string) {
    const currentNetwork = await this.providerService.getNetwork();

    if (currentNetwork.chainId !== NETWORKS.optimism.chainId) return BigNumber.from(0);

    const oeGasOracle = await this.contractService.getOEGasOracleInstance();

    return oeGasOracle.getL1Fee(data);
  }

  async getTransformerValue(token: string, value: BigNumber) {
    const transformerRegistryInstance = await this.contractService.getTransformerRegistryInstance(LATEST_VERSION);

    return transformerRegistryInstance.calculateTransformToUnderlying(token, value);
  }

  async getPriceForGraph(from: Token, to: Token, periodIndex = 0, chainId?: number) {
    const network = await this.walletService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const wrappedProtocolToken = getWrappedProtocolToken(chainIdToUse);
    const span = INDEX_TO_SPAN[periodIndex];
    const period = INDEX_TO_PERIOD[periodIndex];
    const toAddress = to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : to.address;
    const fromAddress = from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : from.address;

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
      `https://coins.llama.fi/chart/${defillamaId}:${tokenA.address},${defillamaId}:${tokenB.address}?period=${period}&span=${span}`
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

  async getEstimatedPairCreation(
    token0: Token,
    token1: Token,
    amountToDeposit: string,
    amountOfSwaps: string,
    swapInterval: BigNumber
  ) {
    if (!token0 || !token1) return Promise.resolve();

    const chain = await this.providerService.getNetwork();

    let tokenA = token0;
    let tokenB = token1;

    if (token0.address > token1.address) {
      tokenA = token1;
      tokenB = token0;
    }

    // check for ETH
    tokenA = tokenA.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(chain.chainId) : tokenA;
    tokenB = tokenB.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(chain.chainId) : tokenB;

    const hubInstance = await this.contractService.getHubInstance();

    const weiValue = parseUnits(amountToDeposit, token0.decimals);

    return Promise.all([
      hubInstance.estimateGas.deposit(
        tokenA.address,
        tokenB.address,
        weiValue,
        BigNumber.from(amountOfSwaps),
        swapInterval,
        this.walletService.getAccount(),
        []
      ),
      this.axiosClient.get<TxPriceResponse>('https://api.txprice.com/'),
      this.axiosClient.get<CoinGeckoPriceResponse>(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum&order=market_cap_desc&per_page=1&page=1&sparkline=false'
      ),
    ]).then((promiseValues: [BigNumber, AxiosResponse<TxPriceResponse>, AxiosResponse<CoinGeckoPriceResponse>]) => {
      const [gasLimitRaw, gasPriceResponse, ethPriceResponse] = promiseValues;

      const gasLimit = BigNumber.from(gasLimitRaw);
      const gasPrice = parseUnits(
        gasPriceResponse.data.blockPrices[0].estimatedPrices[2].price.toString(),
        gasPriceResponse.data.unit
      );
      const ethPrice = ethPriceResponse.data[0].current_price;

      const gas = gasLimit.mul(gasPrice);

      return {
        gas: formatUnits(gas, 'gwei'),
        gasUsd: parseFloat(formatEther(gas)) * ethPrice,
        gasEth: gas,
      };
    });
  }
}
