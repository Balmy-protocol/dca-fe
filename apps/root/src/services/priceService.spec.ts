/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

import { createMockInstance } from '@common/utils/tests';
import axios, { AxiosInstance } from 'axios';
import { toToken } from '@common/utils/currency';
import { parseUnits } from 'viem';
import { DEFILLAMA_IDS, STABLE_COINS } from '@constants';

import WalletService from './walletService';
import ContractService from './contractService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import PriceService from './priceService';

jest.mock('./walletService');
jest.mock('./contractService');
jest.mock('./providerService');
jest.mock('./sdkService');
jest.mock('axios');

const MockedSdkService = jest.mocked(SdkService, { shallow: false });
const MockedWalletService = jest.mocked(WalletService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });

describe('Price Service', () => {
  let walletService: jest.MockedObject<WalletService>;
  let contractService: jest.MockedObject<ContractService>;
  let providerService: jest.MockedObject<ProviderService>;
  let sdkService: jest.MockedObject<SdkService>;
  let priceService: PriceService;

  const mockGetHistoricalPricesForChain = jest.fn();
  const mockGetCurrentPricesForChain = jest.fn();
  let getTokenAddressForPriceFetchingSpy: jest.SpyInstance;

  const tokenAAddress = 'token-a';
  const tokenBAddress = 'token-b';
  const tokenCAddress = 'token-c';

  beforeEach(() => {
    walletService = createMockInstance(MockedWalletService);
    contractService = createMockInstance(MockedContractService);
    providerService = createMockInstance(MockedProviderService);
    sdkService = createMockInstance(MockedSdkService);
    sdkService.sdk = {
      ...sdkService.sdk,
      priceService: {
        getHistoricalPricesForChain: mockGetHistoricalPricesForChain,
        supportedChains: jest.fn(),
        getChart: jest.fn(),
        supportedQueries: jest.fn(),
        getCurrentPricesForChain: mockGetCurrentPricesForChain,
        getCurrentPrices: jest.fn(),
        getHistoricalPrices: jest.fn(),
        getBulkHistoricalPrices: jest.fn(),
      },
    };
    priceService = new PriceService(
      walletService,
      contractService,
      axios as AxiosInstance,
      providerService,
      sdkService
    );

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    getTokenAddressForPriceFetchingSpy = jest.spyOn(require('@constants/addresses'), 'getTokenAddressForPriceFetching');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getUsdHistoricPrice', () => {
    const tokenA = toToken({ address: tokenAAddress });
    const tokenB = toToken({ address: tokenBAddress });
    const date = Date.now().toString();

    describe('when date was passed', () => {
      test('it should fetch all the token prices from getHistoricalPricesForChain of sdk and map the results', async () => {
        mockGetHistoricalPricesForChain.mockReturnValueOnce({
          [tokenAAddress]: { price: 100 },
          [tokenBAddress]: { price: 200 },
        });
        const result = await priceService.getUsdHistoricPrice([tokenA, tokenB], date, 10);

        expect(sdkService.sdk.priceService.getHistoricalPricesForChain).toHaveBeenCalledWith({
          chainId: 10,
          addresses: [tokenAAddress, tokenBAddress],
          timestamp: parseInt(date, 10),
        });
        expect(result).toStrictEqual({
          [tokenAAddress]: parseUnits((100).toFixed(18), 18),
          [tokenBAddress]: parseUnits((200).toFixed(18), 18),
        });
      });
    });

    describe('when date was not passed', () => {
      test('it should fetch all the token prices from getCurrentPricesForChain of sdk and map the results', async () => {
        mockGetCurrentPricesForChain.mockReturnValueOnce({
          [tokenAAddress]: { price: 100 },
          [tokenBAddress]: { price: 200 },
        });
        const result = await priceService.getUsdHistoricPrice([tokenA, tokenB], undefined, 10);

        expect(sdkService.sdk.priceService.getCurrentPricesForChain).toHaveBeenCalledWith({
          chainId: 10,
          addresses: [tokenAAddress, tokenBAddress],
        });
        expect(result).toStrictEqual({
          [tokenAAddress]: parseUnits((100).toFixed(18), 18),
          [tokenBAddress]: parseUnits((200).toFixed(18), 18),
        });
      });
    });

    describe('when a token has a fetching address', () => {
      test('it should use the fetchingAddress for price retrieval', async () => {
        const tokenBFetchingAddress = 'token-b-for-fetch';

        getTokenAddressForPriceFetchingSpy
          .mockReturnValueOnce(tokenAAddress)
          .mockReturnValueOnce(tokenBFetchingAddress);

        mockGetHistoricalPricesForChain.mockReturnValueOnce({
          [tokenAAddress]: { price: 100 },
          [tokenBFetchingAddress]: { price: 200 },
        });
        const result = await priceService.getUsdHistoricPrice([tokenA, tokenB], date, 10);

        expect(sdkService.sdk.priceService.getHistoricalPricesForChain).toHaveBeenCalledWith({
          chainId: 10,
          addresses: [tokenAAddress, tokenBFetchingAddress],
          timestamp: parseInt(date, 10),
        });
        expect(result).toStrictEqual({
          [tokenAAddress]: parseUnits((100).toFixed(18), 18),
          [tokenBAddress]: parseUnits((200).toFixed(18), 18),
        });
      });
    });
  });

  describe('getProtocolHistoricPrices', () => {
    test('it should make one call for each of the dates passed to get the protocol token price', async () => {});
  });

  describe('getZrxGasSwapQuote', () => {
    describe('when its on optimism', () => {
      test('it should return the quote estimated gas', async () => {});
    });
    describe('when its not on optimism', () => {
      test('it should return the quote estimated gas', async () => {});
    });
  });

  describe('getPriceForGraph', () => {
    const CHAIN_ID = 10;
    const stableTokenA = toToken({ address: tokenAAddress, symbol: STABLE_COINS[0] });
    const nonStableTokenB = toToken({ address: tokenBAddress, symbol: 'non-stable-b' });
    const nonStableTokenC = toToken({ address: tokenCAddress, symbol: 'non-stable-c' });
    const DEFILLAMA_ID = DEFILLAMA_IDS[CHAIN_ID];

    describe('when token A is a stable coin', () => {
      test('it should return the prices based on token A', async () => {
        const mockResponse = {
          coins: {
            [`${DEFILLAMA_ID}:${tokenAAddress}`]: { prices: [{ timestamp: 1, price: 100 }] },
            [`${DEFILLAMA_ID}:${tokenBAddress}`]: { prices: [{ timestamp: 1, price: 200 }] },
          },
        };
        axios.get = jest.fn().mockResolvedValueOnce({ data: mockResponse });
        const result = await priceService.getPriceForGraph(stableTokenA, nonStableTokenB, 0, CHAIN_ID);
        const expectedRate = 200 / 100;
        expect(result).toEqual([{ timestamp: 1, rate: expectedRate }]);
      });
    });

    describe('when token B is a stable coin', () => {
      test('it should return the prices based on token B', async () => {
        const mockResponse = {
          coins: {
            [`${DEFILLAMA_ID}:${tokenBAddress}`]: { prices: [{ timestamp: 1, price: 100 }] },
            [`${DEFILLAMA_ID}:${tokenAAddress}`]: { prices: [{ timestamp: 1, price: 200 }] },
          },
        };
        axios.get = jest.fn().mockResolvedValueOnce({ data: mockResponse });
        const result = await priceService.getPriceForGraph(nonStableTokenB, stableTokenA, 0, CHAIN_ID);

        const expectedRate = 100 / 200;
        expect(result).toEqual([{ timestamp: 1, rate: expectedRate }]);
      });
    });

    describe('when no token is a stable coin', () => {
      test('it should return the prices based on token A', async () => {
        const mockResponse = {
          coins: {
            [`${DEFILLAMA_ID}:${tokenBAddress}`]: { prices: [{ timestamp: 1, price: 100 }] },
            [`${DEFILLAMA_ID}:${tokenCAddress}`]: { prices: [{ timestamp: 1, price: 200 }] },
          },
        };
        axios.get = jest.fn().mockResolvedValueOnce({ data: mockResponse });
        const result = await priceService.getPriceForGraph(nonStableTokenB, nonStableTokenC, 0, CHAIN_ID);

        const expectedRate = 200 / 100;
        expect(result).toEqual([{ timestamp: 1, rate: expectedRate }]);
      });
    });
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
