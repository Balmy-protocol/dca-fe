import { BigNumber, ethers } from 'ethers';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import { AxiosInstance, AxiosResponse } from 'axios';
import { CoinGeckoPriceResponse, Token, TxPriceResponse } from 'types';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import { COINGECKO_IDS, DEFILLAMA_IDS, NETWORKS } from 'config/constants';
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
        COINGECKO_IDS[network.chainId] || COINGECKO_IDS[NETWORKS.optimism.chainId]
      }?contract_addresses=${token.address}&vs_currencies=usd`
    );

    const usdPrice = price.data[token.address] && price.data[token.address].usd;

    return usdPrice || 0;
  }

  async getUsdHistoricPrice(tokens: Token[], date?: string, chainId?: number) {
    const network = await this.walletService.getNetwork();
    const chainIdToUse = chainId || network.chainId;
    const wrappedProtocolToken = getWrappedProtocolToken(chainIdToUse);
    const mappedTokens = tokens.map((token) =>
      token.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : token
    );
    const price = await this.axiosClient.post<{ coins: Record<string, { price: number }> }>(
      'https://coins.llama.fi/prices',
      {
        coins: mappedTokens.map((token) => `${DEFILLAMA_IDS[chainIdToUse]}:${token.address}`),
        ...(date && { timestamp: parseInt(date, 10) }),
      }
    );

    const tokensPrices = mappedTokens.map((token) =>
      parseUnits(price.data.coins[`${DEFILLAMA_IDS[chainIdToUse]}:${token.address}`].price.toString(), 18)
    );

    return tokensPrices;
  }

  async getTokenQuote(from: Token, to: Token, fromAmount: BigNumber) {
    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const fromToUse = from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from;
    const toToUse = to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to;

    const oracleInstance = await this.contractService.getOracleInstance();

    return oracleInstance.quote(fromToUse.address, fromAmount, toToUse.address);
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
