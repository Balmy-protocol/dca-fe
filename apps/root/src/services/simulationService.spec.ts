import { createMockInstance } from '@common/utils/tests';

import { BLOWFISH_ENABLED_CHAINS } from '@constants';
import { BlowfishResponse, StateChangeKind } from '@types';
import { AxiosResponse } from 'axios';
import SimulationService from './simulationService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import ContractService from './contractService';
import SdkService from './sdkService';
import EventService from './analyticsService';
import WalletService from './walletService';

jest.mock('./providerService');
jest.mock('./meanApiService');
jest.mock('./contractService');
jest.mock('./sdkService');
jest.mock('./eventService');

/**
 * Create mock instance of given class or function constructor
 *
 * @param cl Class constructor
 * @returns New mocked instance of given constructor with all methods mocked
 */

jest.useFakeTimers();

const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedSdkService = jest.mocked(SdkService, { shallow: true });
const MockedEventService = jest.mocked(EventService, { shallow: true });
const MockedWalletService = jest.mocked(WalletService, { shallow: true });
describe('Simulation Service', () => {
  let simulationService: SimulationService;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let providerService: jest.MockedObject<ProviderService>;
  let contractService: jest.MockedObject<ContractService>;
  let sdkService: jest.MockedObject<SdkService>;
  let eventService: jest.MockedObject<EventService>;
  let walletService: jest.MockedObject<WalletService>;

  beforeEach(() => {
    meanApiService = createMockInstance(MockedMeanApiService);
    providerService = createMockInstance(MockedProviderService);
    contractService = createMockInstance(MockedContractService);
    sdkService = createMockInstance(MockedSdkService);
    eventService = createMockInstance(MockedEventService);
    walletService = createMockInstance(MockedWalletService);

    simulationService = new SimulationService(
      meanApiService as unknown as MeanApiService,
      providerService as unknown as ProviderService,
      contractService as unknown as ContractService,
      sdkService as unknown as SdkService,
      eventService as unknown as EventService,
      walletService as unknown as WalletService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('simulateQuotes', () => {});

  describe('simulateGasPriceTransaction', () => {
    test('it should return the none action when the estimate gas passess', async () => {
      providerService.estimateGas.mockResolvedValue(10n);
      const result = await simulationService.simulateGasPriceTransaction({ from: 'me', to: 'you', data: 'data' });

      expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
      expect(result).toEqual({
        action: 'NONE',
        warnings: [],
        simulationResults: {
          expectedStateChanges: [],
        },
      });
    });

    test('it should throw an error when estimateGas fails', async () => {
      providerService.estimateGas.mockImplementation(() => {
        throw new Error('blabalbla');
      });

      try {
        await simulationService.simulateGasPriceTransaction({ from: 'me', to: 'you', data: 'data' });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('blabalbla'));
      }
    });
  });
  describe('simulateTransaction', () => {
    test('it should call simulateGasPriceTransaction if its not a blowfish enabled chain', async () => {
      providerService.estimateGas.mockResolvedValue(10n);
      const result = await simulationService.simulateTransaction({ from: 'me', to: 'you', data: 'data' }, 99999, false);

      expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
      expect(result).toEqual({
        action: 'NONE',
        warnings: [],
        simulationResults: {
          expectedStateChanges: [],
        },
      });
    });

    BLOWFISH_ENABLED_CHAINS.forEach((chainId) => {
      test(`it should call simulateGasPriceTransaction if forceProviderSimulation is true for chain ${chainId}`, async () => {
        providerService.estimateGas.mockResolvedValue(10n);
        const result = await simulationService.simulateTransaction(
          { from: 'me', to: 'you', data: 'data' },
          chainId,
          true
        );

        expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
        expect(result).toEqual({
          action: 'NONE',
          warnings: [],
          simulationResults: {
            expectedStateChanges: [],
          },
        });
      });

      test(`it should call simulateGasPriceTransaction if the simulation returns errors for chain ${chainId}`, async () => {
        meanApiService.simulateTransaction.mockResolvedValue({
          data: {
            action: 'NONE',
            warnings: [],
            simulationResults: {
              error: { humanReadableError: 'There was some error' },
              expectedStateChanges: [
                {
                  humanReadableDiff: 'Something changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
                {
                  humanReadableDiff: 'Something else changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
              ],
            },
          } as BlowfishResponse,
        } as unknown as AxiosResponse<BlowfishResponse>);

        providerService.estimateGas.mockResolvedValue(10n);
        simulationService.simulateGasPriceTransaction = jest.fn().mockResolvedValue({
          action: 'NONE',
          warnings: [],
          simulationResults: {
            expectedStateChanges: [],
          },
        });

        const result = await simulationService.simulateTransaction(
          { from: 'me', to: 'you', data: 'data', value: 100n },
          chainId,
          false
        );

        expect(meanApiService.simulateTransaction).toHaveBeenCalledWith(
          {
            from: 'me',
            to: 'you',
            value: '100',
            data: 'data',
          },
          'me',
          {
            origin: window.location.origin,
          },
          chainId
        );

        expect(simulationService.simulateGasPriceTransaction).toHaveBeenCalledWith({
          from: 'me',
          to: 'you',
          data: 'data',
          value: 100n,
        });
        expect(result).toEqual({
          action: 'NONE',
          warnings: [],
          simulationResults: {
            expectedStateChanges: [],
          },
        });
      });

      test(`it should call the meanApiService simulate transaction and return the mapped value for chain ${chainId}`, async () => {
        meanApiService.simulateTransaction.mockResolvedValue({
          data: {
            action: 'NONE',
            warnings: [],
            simulationResults: {
              expectedStateChanges: [
                {
                  humanReadableDiff: 'Something changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
                {
                  humanReadableDiff: 'Something else changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
              ],
            },
          },
        } as unknown as AxiosResponse<BlowfishResponse>);

        const result = await simulationService.simulateTransaction(
          { from: 'me', to: 'you', data: 'data', value: 100n },
          chainId,
          false
        );

        expect(meanApiService.simulateTransaction).toHaveBeenCalledWith(
          {
            from: 'me',
            to: 'you',
            value: '100',
            data: 'data',
          },
          'me',
          {
            origin: window.location.origin,
          },
          chainId
        );

        expect(result).toEqual({
          action: 'NONE',
          simulationResults: {
            expectedStateChanges: [
              {
                humanReadableDiff: 'Something else changed',
                rawInfo: {
                  kind: StateChangeKind.ERC20_TRANSFER,
                  data: {
                    amount: {
                      before: '1',
                      after: '2',
                    },
                  },
                },
              },
              {
                humanReadableDiff: 'Something changed',
                rawInfo: {
                  kind: StateChangeKind.ERC20_TRANSFER,
                  data: {
                    amount: {
                      before: '1',
                      after: '2',
                    },
                  },
                },
              },
            ],
          },
          warnings: [],
        });
      });
    });
  });
});
