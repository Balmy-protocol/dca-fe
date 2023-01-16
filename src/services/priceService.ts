import { BigNumber, ethers } from 'ethers';
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
  LATEST_VERSION,
  NETWORKS,
  ZRX_API_ADDRESS,
} from 'config/constants';
import { emptyTokenWithAddress } from 'utils/currency';
import ContractService from './contractService';
import WalletService from './walletService';

export default class PriceService {
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

  // TOKEN METHODS
  async getUsdPrice(token: Token) {
    const network = await this.walletService.getNetwork();
    const price = await this.axiosClient.get<Record<string, { usd: number }>>(
      `https://api.coingecko.com/api/v3/simple/token_price/${
        COINGECKO_IDS[network.chainId] || COINGECKO_IDS[DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION].chainId]
      }?contract_addresses=${token.address}&vs_currencies=usd`
    );

    const usdPrice = price.data[token.address] && price.data[token.address].usd;

    return usdPrice || 0;
  }

  async getUsdHistoricPrice(tokens: Token[], date?: string, chainId?: number) {
    const network = await this.walletService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const mappedTokens = tokens.map((token) =>
      token.address === PROTOCOL_TOKEN_ADDRESS ? emptyTokenWithAddress(DEFILLAMA_PROTOCOL_TOKEN_ADDRESS) : token
    );
    const defillamaToknes = mappedTokens.map((token) => `${DEFILLAMA_IDS[chainIdToUse]}:${token.address}`).join(',');
    const price = await this.axiosClient.get<{ coins: Record<string, { price: number }> }>(
      date
        ? `https://coins.llama.fi/prices/historical/${parseInt(date, 10)}/${defillamaToknes}`
        : `https://coins.llama.fi/prices/current/${defillamaToknes}`
    );

    const tokensPrices = mappedTokens
      .filter(
        (token) =>
          price.data.coins &&
          price.data.coins[`${DEFILLAMA_IDS[chainIdToUse]}:${token.address}`] &&
          price.data.coins[`${DEFILLAMA_IDS[chainIdToUse]}:${token.address}`].price
      )
      .reduce<Record<string, BigNumber>>((acc, token) => {
        const tokenAddressToUse =
          token.address === DEFILLAMA_PROTOCOL_TOKEN_ADDRESS ? PROTOCOL_TOKEN_ADDRESS : token.address;
        return {
          ...acc,
          [tokenAddressToUse]: parseUnits(
            price.data.coins[`${DEFILLAMA_IDS[chainIdToUse]}:${token.address}`].price.toString(),
            18
          ),
        };
      }, {});

    return tokensPrices;
  }

  async getProtocolHistoricPrices(dates: string[], chainId?: number) {
    const network = await this.walletService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const expectedResults: Promise<AxiosResponse<{ coins: Record<string, { price: number }> }>>[] = dates.map((date) =>
      this.axiosClient.post<{ coins: Record<string, { price: number }> }>(
        date
          ? `https://coins.llama.fi/prices/historical/${parseInt(date, 10)}/${
              DEFILLAMA_IDS[chainIdToUse]
            }:${DEFILLAMA_PROTOCOL_TOKEN_ADDRESS}`
          : `https://coins.llama.fi/prices/current/${DEFILLAMA_IDS[chainIdToUse]}:${DEFILLAMA_PROTOCOL_TOKEN_ADDRESS}`
      )
    );

    const tokensPrices = await Promise.all(expectedResults);

    return tokensPrices.reduce<Record<string, BigNumber>>((acc, priceResponse, index) => {
      const dateToUse = dates[index];
      const price =
        priceResponse.data.coins[`${DEFILLAMA_IDS[chainIdToUse]}:${DEFILLAMA_PROTOCOL_TOKEN_ADDRESS}`].price.toString();
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
    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const fromToUse = from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from;
    const toToUse = to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to;

    const oracleInstance = await this.contractService.getOracleInstance();

    return oracleInstance.quote(fromToUse.address, fromAmount, toToUse.address, []);
  }

  async getGasPrice() {
    const currentNetwork = await this.walletService.getNetwork();

    if (currentNetwork.chainId !== NETWORKS.optimism.chainId && currentNetwork.chainId !== NETWORKS.polygon.chainId)
      return BigNumber.from(0);

    if (currentNetwork.chainId === NETWORKS.optimism.chainId) {
      return this.client.getGasPrice();
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
    const currentNetwork = await this.walletService.getNetwork();

    if (currentNetwork.chainId !== NETWORKS.optimism.chainId) return BigNumber.from(0);

    const oeGasOracle = await this.contractService.getOEGasOracleInstance();

    return oeGasOracle.getL1Fee(data);
  }

  async getTransformerValue(token: string, value: BigNumber) {
    const transformerRegistryInstance = await this.contractService.getTransformerRegistryInstance(LATEST_VERSION);

    return transformerRegistryInstance.calculateTransformToUnderlying(token, value);
  }

  async getEstimatedPairCreation(
    token0: Token,
    token1: Token,
    amountToDeposit: string,
    amountOfSwaps: string,
    swapInterval: BigNumber
  ) {
    if (!token0 || !token1) return Promise.resolve();

    const chain = await this.walletService.getNetwork();

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
