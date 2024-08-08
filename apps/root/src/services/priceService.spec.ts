/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

import { createMockInstance } from '@common/utils/tests';
import axios, { AxiosInstance } from 'axios';
import { toToken } from '@common/utils/currency';
import { parseUnits } from 'viem';
import { STABLE_COINS } from '@constants';

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
  const mockGetChart = jest.fn();
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
        getHistoricalPricesInChain: mockGetHistoricalPricesForChain,
        supportedChains: jest.fn(),
        getChart: jest.fn(),
        supportedQueries: jest.fn(),
        getCurrentPricesInChain: mockGetCurrentPricesForChain,
        getCurrentPrices: jest.fn(),
        getHistoricalPrices: jest.fn(),
        getBulkHistoricalPrices: jest.fn(),
      },
    };
    sdkService.getChart = mockGetChart;
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

        expect(sdkService.sdk.priceService.getHistoricalPricesInChain).toHaveBeenCalledWith({
          chainId: 10,
          tokens: [tokenAAddress, tokenBAddress],
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

        expect(sdkService.sdk.priceService.getCurrentPricesInChain).toHaveBeenCalledWith({
          chainId: 10,
          tokens: [tokenAAddress, tokenBAddress],
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

        expect(sdkService.sdk.priceService.getHistoricalPricesInChain).toHaveBeenCalledWith({
          chainId: 10,
          tokens: [tokenAAddress, tokenBFetchingAddress],
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

    describe('when token A is a stable coin', () => {
      test('it should return the prices based on token A', async () => {
        mockGetChart.mockResolvedValueOnce({
          [CHAIN_ID]: {
            [stableTokenA.address]: [{ price: 100, closestTimestamp: 1 }],
            [nonStableTokenB.address]: [{ price: 200, closestTimestamp: 1 }],
          },
        });

        const result = await priceService.getPriceForGraph({
          from: stableTokenA,
          to: nonStableTokenB,
          chainId: CHAIN_ID,
        });

        const expectedRate = 200 / 100;
        expect(result).toEqual([{ date: 1, tokenPrice: expectedRate.toString() }]);
      });
    });

    describe('when token B is a stable coin', () => {
      test('it should return the prices based on token B', async () => {
        mockGetChart.mockResolvedValueOnce({
          [CHAIN_ID]: {
            [nonStableTokenB.address]: [{ price: 100, closestTimestamp: 1 }],
            [stableTokenA.address]: [{ price: 200, closestTimestamp: 1 }],
          },
        });

        const result = await priceService.getPriceForGraph({
          from: nonStableTokenB,
          to: stableTokenA,
          chainId: CHAIN_ID,
        });

        const expectedRate = 100 / 200;
        expect(result).toEqual([{ date: 1, tokenPrice: expectedRate.toString() }]);
      });
    });

    describe('when no token is a stable coin', () => {
      test('it should return the prices based on token A', async () => {
        mockGetChart.mockResolvedValueOnce({
          [CHAIN_ID]: {
            [nonStableTokenB.address]: [{ price: 100, closestTimestamp: 1 }],
            [nonStableTokenC.address]: [{ price: 200, closestTimestamp: 1 }],
          },
        });

        const result = await priceService.getPriceForGraph({
          from: nonStableTokenB,
          to: nonStableTokenC,
          chainId: CHAIN_ID,
        });

        const expectedRate = 200 / 100;
        expect(result).toEqual([{ date: 1, tokenPrice: expectedRate.toString() }]);
      });
    });
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
