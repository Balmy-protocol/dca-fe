import { createMockInstance } from '@common/utils/tests';
import md5 from 'md5';
import { MEAN_PROXY_PANEL_URL } from '@constants';
import mixpanel, { Mixpanel } from 'mixpanel-browser';
import EventService from './eventService';
import ProviderService from './providerService';
import AccountService from './accountService';
import { UserType } from '@types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('mixpanel-browser');
jest.mock('./providerService');
jest.mock('md5');

const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedAccountService = jest.mocked(AccountService, { shallow: true });
const MockedMd5 = jest.mocked(md5, { shallow: true });
const MockedMixpanelBrowser = jest.mocked(mixpanel, { shallow: true });

describe('Event Service', () => {
  let eventService: EventService;
  let providerService: jest.MockedObject<ProviderService>;
  let accountService: jest.MockedObject<AccountService>;
  let setConfigMock: jest.Mock;
  let trackMock: jest.Mock;

  beforeEach(() => {
    MockedMd5.mockImplementation((value: string) => `md5-${value}`);
    providerService = createMockInstance(MockedProviderService);
    accountService = createMockInstance(MockedAccountService);
    providerService.getNetwork.mockResolvedValue({ chainId: 10, defaultProvider: false });
    accountService.getUser.mockReturnValue({
      id: 'wallet:userId',
      type: UserType.wallet,
      wallets: [],
      signature: { expiration: '', message: '0x' },
    });
    setConfigMock = jest.fn();
    trackMock = jest.fn();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    MockedMixpanelBrowser.init.mockReturnValue({
      set_config: setConfigMock,
      track: trackMock,
      identify: jest.fn(),
    } as unknown as Mixpanel);
    process.env = {
      MIXPANEL_TOKEN: 'MIXPANEL_TOKEN',
    };
    eventService = new EventService(providerService, accountService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('it should init mixpanel browser and set config', () => {
      expect(MockedMixpanelBrowser.init).toHaveBeenCalledTimes(1);
      expect(MockedMixpanelBrowser.init).toHaveBeenCalledWith(
        'MIXPANEL_TOKEN',
        { api_host: MEAN_PROXY_PANEL_URL },
        ' '
      );
      expect(setConfigMock).toHaveBeenCalledTimes(1);
      expect(setConfigMock).toHaveBeenCalledWith({ persistence: 'localStorage', ignore_dnt: true });
    });
  });

  describe('trackEvent', () => {
    test('it should call mixpanel to track the event and expand all data', async () => {
      await eventService.trackEvent('Action to track', { someProp: 'someValue' });
      expect(trackMock).toHaveBeenCalledTimes(1);
      expect(trackMock).toHaveBeenCalledWith('Action to track', {
        chainId: 10,
        chainName: 'Optimism',
        someProp: 'someValue',
      });
    });

    test('it should fail gracefully when track fails', async () => {
      trackMock.mockImplementation(() => {
        throw new Error('error tracking');
      });
      await eventService.trackEvent('Action to track', { someProp: 'someValue' });
      expect(trackMock).toHaveBeenCalledTimes(1);
      expect(trackMock).toHaveBeenCalledWith('Action to track', {
        chainId: 10,
        chainName: 'Optimism',
        someProp: 'someValue',
      });
    });
  });
});
