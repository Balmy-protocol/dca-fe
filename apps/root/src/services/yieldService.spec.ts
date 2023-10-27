import { createMockInstance } from '@common/utils/tests';
import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { DefillamaResponse } from '@types';
import YieldService from './yieldService';
import ProviderService from './providerService';

jest.mock('./providerService');
jest.mock('./walletService');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@constants', () => ({
  ...jest.requireActual('@constants'),
  ALLOWED_YIELDS: {
    '10': [
      {
        id: 'enabled-optimism',
        tokenAddress: 'Optimism-Address',
        poolId: 'enabled-optimism',
        name: 'Aave V3',
      },
    ],
    '137': [
      {
        id: 'enabled-polygon',
        tokenAddress: 'Polygon-Address',
        poolId: 'enabled-polygon',
        name: 'Aave V3',
      },
      {
        id: 'disabled-polygon',
        tokenAddress: 'disabledYield',
        poolId: 'disabled-polygon',
        name: 'Aave V3',
      },
    ],
    '1': [
      {
        id: 'enabled-mainnet',
        tokenAddress: 'Mainnet-Address',
        poolId: 'enabled-mainnet',
        name: 'Aave V3',
        forcedUnderlyings: ['Forced-Underlying'],
      },
    ],
    '42161': [
      {
        id: 'enabled-arbitrum',
        tokenAddress: 'Arbitrum-Address',
        poolId: 'enabled-arbitrum',
        name: 'Aave V3',
      },
    ],
  },
  DCA_TOKEN_BLACKLIST: ['disabledyield'],
}));

const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
describe('Yield Service', () => {
  let yieldService: YieldService;
  let providerService: jest.MockedObject<ProviderService>;
  let axiosClient: MockAdapter;

  beforeEach(() => {
    providerService = createMockInstance(MockedProviderService);
    axiosClient = new MockAdapter(axios);

    yieldService = new YieldService(providerService as unknown as ProviderService, axios as unknown as AxiosInstance);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    axiosClient.reset();
  });

  describe('getYieldOptions', () => {
    beforeEach(() => {
      providerService.getNetwork.mockResolvedValue({
        chainId: 9999,
        defaultProvider: false,
      });
      axiosClient.onGet('https://yields.llama.fi/pools').reply(200, {
        data: [
          {
            apy: 2,
            apyBase: 3,
            underlyingTokens: ['underlying-optimism'],
            pool: 'enabled-optimism',
          },
          {
            apy: 5,
            apyBase: 6,
            pool: 'enabled-polygon',
          },
          {
            apy: 4,
            apyBase: 7,
            pool: 'disabled-polygon',
          },
          {
            apy: 8,
            apyBase: 9,
            pool: 'enabled-mainnet',
          },
          {
            apy: 10,
            apyBase: 11,
            pool: 'enabled-arbitrum',
            underlyingTokens: ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
          },
        ],
      } as DefillamaResponse);
    });

    test('it should call the defillama and return the corresponding pools', async () => {
      const result = await yieldService.getYieldOptions(10);

      expect(axiosClient.history.get[0].url).toEqual('https://yields.llama.fi/pools');
      expect(axiosClient.history.get.length).toEqual(1);

      expect(result).toEqual([
        {
          apy: 3,
          enabledTokens: ['underlying-optimism'],
          id: 'enabled-optimism',
          name: 'Aave V3',
          poolId: 'enabled-optimism',
          tokenAddress: 'optimism-address',
        },
      ]);
    });

    test('it should filter the disabled yields if using the blacklist', async () => {
      const result = await yieldService.getYieldOptions(137, true);

      expect(result).toEqual([
        {
          id: 'enabled-polygon',
          tokenAddress: 'polygon-address',
          poolId: 'enabled-polygon',
          name: 'Aave V3',
          apy: 6,
          enabledTokens: [],
        },
      ]);
    });

    test('it should not filter the disabled yields', async () => {
      const result = await yieldService.getYieldOptions(137);

      expect(result).toEqual([
        {
          id: 'enabled-polygon',
          tokenAddress: 'polygon-address',
          poolId: 'enabled-polygon',
          name: 'Aave V3',
          apy: 6,
          enabledTokens: [],
        },
        {
          id: 'disabled-polygon',
          tokenAddress: 'disabledyield',
          poolId: 'disabled-polygon',
          name: 'Aave V3',
          apy: 7,
          enabledTokens: [],
        },
      ]);
    });

    test('it should return the apy if the apyBase is not available', async () => {
      axiosClient.onGet('https://yields.llama.fi/pools').reply(200, {
        data: [
          {
            apy: 2,
            underlyingTokens: ['underlying-optimism'],
            pool: 'enabled-optimism',
          },
          {
            apy: 5,
            apyBase: 6,
            pool: 'enabled-polygon',
          },
        ],
      } as DefillamaResponse);

      const result = await yieldService.getYieldOptions(10);

      expect(result).toEqual([
        {
          apy: 2,
          enabledTokens: ['underlying-optimism'],
          id: 'enabled-optimism',
          name: 'Aave V3',
          poolId: 'enabled-optimism',
          tokenAddress: 'optimism-address',
        },
      ]);
    });

    test('it should return 0 if both the apy and the apyBase are not available', async () => {
      axiosClient.onGet('https://yields.llama.fi/pools').reply(200, {
        data: [
          {
            underlyingTokens: ['underlying-optimism'],
            pool: 'enabled-optimism',
          },
          {
            apy: 5,
            apyBase: 6,
            pool: 'enabled-polygon',
          },
        ],
      } as DefillamaResponse);

      const result = await yieldService.getYieldOptions(10);

      expect(result).toEqual([
        {
          apy: 0,
          enabledTokens: ['underlying-optimism'],
          id: 'enabled-optimism',
          name: 'Aave V3',
          poolId: 'enabled-optimism',
          tokenAddress: 'optimism-address',
        },
      ]);
    });

    test('it should add the protocol token if the wrapped protocol token is present', async () => {
      const result = await yieldService.getYieldOptions(42161);

      expect(result).toEqual([
        {
          id: 'enabled-arbitrum',
          tokenAddress: 'arbitrum-address',
          poolId: 'enabled-arbitrum',
          name: 'Aave V3',
          apy: 11,
          enabledTokens: ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
        },
      ]);
    });

    test('it should force the underlying token if set as an option', async () => {
      const result = await yieldService.getYieldOptions(1);

      expect(result).toEqual([
        {
          id: 'enabled-mainnet',
          tokenAddress: 'mainnet-address',
          poolId: 'enabled-mainnet',
          name: 'Aave V3',
          apy: 9,
          enabledTokens: ['forced-underlying'],
          forcedUnderlyings: ['Forced-Underlying'],
        },
      ]);
    });
  });
});
