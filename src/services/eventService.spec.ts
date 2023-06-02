import { createMockInstance } from '@common/utils/tests';
import md5 from 'md5';
import EventService from './eventService';
import mixpanel from 'mixpanel-browser';
import ProviderService from './providerService';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('mixpanel-browser', () => ({ __esModule: true, ...jest.requireActual('mixpanel-browser') }));
jest.mock('./providerService');
jest.mock('md5');

const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedMd5 = jest.mocked(md5, { shallow: true });
const MockedMixpanelBrowser = jest.mocked(mixpanel, { shallow: true });

describe.skip('Transaction Service', () => {
  let eventService: EventService;
  let providerService: jest.MockedObject<ProviderService>;

  beforeEach(() => {
    MockedMd5.mockImplementation((value: string) => `md5-${value}`);
    providerService = createMockInstance(MockedProviderService);
    providerService.getAddress.mockResolvedValue('account');
    providerService.getNetwork.mockResolvedValue({ chainId: 10, defaultProvider: false });
    eventService = new EventService(providerService as unknown as ProviderService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('it should init mixpanel browser and set config', () => {
      //   expect(uuidSpy).toHaveBeenCalledTimes(1);
      //   expect(eventService.sessionId).toEqual('uuidv4');
    });
  });

  describe('getIdentifier', () => {
    test('it should generate an md5 id from the account if present', async () => {
      const result = await eventService.getIdentifier();

      expect(result).toEqual('md5-account');
    });
  });

  describe('trackEvent', () => {
    test('it should call mixpanel to track the event and expand all data', async () => {
      // await eventService.trackEvent('Action to track', { someProp: 'someValue' });
      // expect(meanApiService.trackEvent).toHaveBeenCalledTimes(1);
      // expect(meanApiService.trackEvent).toHaveBeenCalledWith(
      //   'Action to track',
      //   {
      //     // distinct_id: 'uuidv4',
      //     hashedId: 'md5-account',
      //     chanId: 10,
      //     chainName: 'optimism',
      //     someProp: 'someValue',
      //   },
      //   'test'
      // );
    });
  });
});
