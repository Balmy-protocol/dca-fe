import { createMockInstance } from '@common/utils/tests';
import * as uuid from 'uuid';
import md5 from 'md5';
import EventService from './eventService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('uuid', () => ({ __esModule: true, ...jest.requireActual('uuid') }));
jest.mock('./providerService');
jest.mock('./meanApiService');
jest.mock('md5');

const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedMd5 = jest.mocked(md5, { shallow: true });

describe('Event Service', () => {
  let eventService: EventService;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let providerService: jest.MockedObject<ProviderService>;
  let uuidSpy: jest.SpyInstance;

  beforeEach(() => {
    uuidSpy = jest.spyOn(uuid, 'v4').mockReturnValue('uuidv4');
    MockedMd5.mockImplementation((value: string) => `md5-${value}`);
    meanApiService = createMockInstance(MockedMeanApiService);
    providerService = createMockInstance(MockedProviderService);
    providerService.getAddress.mockResolvedValue('account');
    providerService.getNetwork.mockResolvedValue({ chainId: 10, defaultProvider: false });
    eventService = new EventService(
      meanApiService as unknown as MeanApiService,
      providerService as unknown as ProviderService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('it should generate a uuidv4 id', () => {
      expect(uuidSpy).toHaveBeenCalledTimes(1);
      expect(eventService.sessionId).toEqual('uuidv4');
    });
  });

  describe('getIdentifier', () => {
    test('it should generate an md5 id from the account if present', async () => {
      const result = await eventService.getIdentifier();

      expect(result).toEqual('md5-account');
    });

    test('it should generate an md5 id from the sessionId if the account is not present', async () => {
      providerService.getAddress.mockResolvedValue('');
      const result = await eventService.getIdentifier();

      expect(result).toEqual('md5-uuidv4');
    });
  });

  describe('trackEvent', () => {
    test('it should call the meanApiService to track the event and expand all data', async () => {
      await eventService.trackEvent('Action to track', { someProp: 'someValue' });

      expect(meanApiService.trackEvent).toHaveBeenCalledTimes(1);
      expect(meanApiService.trackEvent).toHaveBeenCalledWith(
        'Action to track',
        {
          distinct_id: 'uuidv4',
          hashedId: 'md5-account',
          chanId: 10,
          someProp: 'someValue',
        },
        'test'
      );
    });
  });
});
