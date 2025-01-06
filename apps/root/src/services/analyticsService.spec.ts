import { createMockInstance } from '@common/utils/tests';
import md5 from 'md5';
import { MEAN_PROXY_PANEL_URL } from '@constants';
import mixpanel from 'mixpanel-browser';
import AnalyticsService from './analyticsService';
import ProviderService from './providerService';
import AccountService from './accountService';
import { NetworkStruct, UserStatus, WalletStatus, WalletType } from '@types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('mixpanel-browser');
jest.mock('./providerService');
jest.mock('md5');

const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedAccountService = jest.mocked(AccountService, { shallow: true });
const MockedMd5 = jest.mocked(md5, { shallow: true });
const MockedMixpanelBrowser = jest.mocked(mixpanel, { shallow: true });

describe('Analytics Service', () => {
  let analyticsService: AnalyticsService;
  let providerService: jest.MockedObject<ProviderService>;
  let accountService: jest.MockedObject<AccountService>;
  let setConfigMock: jest.Mock;
  let trackMock: jest.Mock;
  let peopleSetMock: jest.Mock;
  let peopleSetOnceMock: jest.Mock;
  let peopleUnsetMock: jest.Mock;
  let peopleIncrementMock: jest.Mock;
  let peopleAppendMock: jest.Mock;
  let peopleUnionMock: jest.Mock;
  let identifyMock: jest.Mock;

  beforeEach(() => {
    MockedMd5.mockImplementation((value: string) => `md5-${value}`);
    providerService = createMockInstance(MockedProviderService);
    accountService = createMockInstance(MockedAccountService);
    providerService.getNetwork.mockResolvedValue({ chainId: 10 } as NetworkStruct);
    accountService.getUser.mockReturnValue({
      id: 'wallet:userId',
      label: 'userId',
      status: UserStatus.loggedIn,
      wallets: [],
      signature: { message: '0x', signer: '0xuserId' },
    });
    accountService.getActiveWallet.mockReturnValue({
      address: '0xactive',
      status: WalletStatus.disconnected,
      isAuth: false,
      type: WalletType.external,
      isOwner: false,
    });
    setConfigMock = jest.fn();
    trackMock = jest.fn();
    peopleSetMock = jest.fn();
    peopleSetOnceMock = jest.fn();
    peopleUnsetMock = jest.fn();
    peopleIncrementMock = jest.fn();
    peopleAppendMock = jest.fn();
    peopleUnionMock = jest.fn();
    identifyMock = jest.fn();

    MockedMixpanelBrowser.init.mockReturnValue({
      set_config: setConfigMock,
      track: trackMock,
      identify: identifyMock,
      people: {
        set: peopleSetMock,
        set_once: peopleSetOnceMock,
        unset: peopleUnsetMock,
        increment: peopleIncrementMock,
        append: peopleAppendMock,
        union: peopleUnionMock,
      },
    } as unknown as ReturnType<typeof mixpanel.init>);
    process.env = {
      MIXPANEL_TOKEN: 'MIXPANEL_TOKEN',
    };
    analyticsService = new AnalyticsService(providerService, accountService);
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
      await analyticsService.trackEvent('Action to track', { someProp: 'someValue' });
      expect(trackMock).toHaveBeenCalledTimes(1);
      expect(trackMock).toHaveBeenCalledWith('Action to track', {
        chainId: 10,
        chainName: 'Optimism',
        someProp: 'someValue',
        distinct_id: 'wallet:userId',
        activeWallet: '0xactive',
      });
    });

    test('it should fail gracefully when track fails', async () => {
      trackMock.mockImplementation(() => {
        throw new Error('error tracking');
      });
      await analyticsService.trackEvent('Action to track', { someProp: 'someValue' });
      expect(trackMock).toHaveBeenCalledTimes(1);
      expect(trackMock).toHaveBeenCalledWith('Action to track', {
        chainId: 10,
        chainName: 'Optimism',
        someProp: 'someValue',
        distinct_id: 'wallet:userId',
        activeWallet: '0xactive',
      });
    });
  });

  describe('identifyUser', () => {
    test('should identify user in mixpanel and hotjar when userId is provided', () => {
      analyticsService.identifyUser('testUser');
      expect(identifyMock).toHaveBeenCalledWith('testUser');
    });

    test('should not identify user when userId is not provided', () => {
      analyticsService.identifyUser();
      expect(identifyMock).not.toHaveBeenCalled();
    });
  });

  describe('setPeopleProperty', () => {
    test('should flatten and set people properties in mixpanel', () => {
      const properties = {
        user: {
          details: { name: 'John' },
          active: true,
        },
      };
      analyticsService.setPeopleProperty(properties);
      expect(peopleSetMock).toHaveBeenCalledWith({
        'user.details.name': 'John',
        'user.active': true,
      });
    });

    test('should handle errors gracefully', () => {
      peopleSetMock.mockImplementation(() => {
        throw new Error('error setting property');
      });
      analyticsService.setPeopleProperty({ prop1: 'value1' });
      expect(peopleSetMock).toHaveBeenCalled();
    });
  });

  describe('setOnceProperty', () => {
    test('should flatten and set one-time properties in mixpanel', () => {
      const properties = {
        profile: {
          info: { age: 25 },
          verified: true,
        },
      };
      analyticsService.setOnceProperty(properties);
      expect(peopleSetOnceMock).toHaveBeenCalledWith({
        'profile.info.age': 25,
        'profile.verified': true,
      });
    });

    test('should handle errors gracefully', () => {
      peopleSetOnceMock.mockImplementation(() => {
        throw new Error('error setting property');
      });
      analyticsService.setOnceProperty({ prop1: 'value1' });
      expect(peopleSetOnceMock).toHaveBeenCalled();
    });
  });

  describe('unsetProperty', () => {
    test('should unset single property in mixpanel', () => {
      analyticsService.unsetProperty('prop1');
      expect(peopleUnsetMock).toHaveBeenCalledWith('prop1');
    });

    test('should unset multiple properties in mixpanel', () => {
      analyticsService.unsetProperty(['prop1', 'prop2']);
      expect(peopleUnsetMock).toHaveBeenCalledWith(['prop1', 'prop2']);
    });

    test('should handle errors gracefully', () => {
      peopleUnsetMock.mockImplementation(() => {
        throw new Error('error unsetting property');
      });
      analyticsService.unsetProperty('prop1');
      expect(peopleUnsetMock).toHaveBeenCalled();
    });
  });

  describe('incrementProperty', () => {
    test('should flatten and increment properties in mixpanel', () => {
      const properties = {
        stats: {
          visits: 1,
          actions: 5,
        },
      };
      analyticsService.incrementProperty(properties);
      expect(peopleIncrementMock).toHaveBeenCalledWith({
        'stats.visits': 1,
        'stats.actions': 5,
      });
    });

    test('should handle errors gracefully', () => {
      peopleIncrementMock.mockImplementation(() => {
        throw new Error('error incrementing property');
      });
      analyticsService.incrementProperty({ prop1: 1 });
      expect(peopleIncrementMock).toHaveBeenCalled();
    });
  });

  describe('appendProperty', () => {
    test('should flatten and append to properties in mixpanel', () => {
      const properties = {
        history: {
          actions: 'login',
          details: { timestamp: '2024-01-01' },
        },
      };
      analyticsService.appendProperty(properties);
      expect(peopleAppendMock).toHaveBeenCalledWith({
        'history.actions': 'login',
        'history.details.timestamp': '2024-01-01',
      });
    });

    test('should handle errors gracefully', () => {
      peopleAppendMock.mockImplementation(() => {
        throw new Error('error appending property');
      });
      analyticsService.appendProperty({ prop1: 'value1' });
      expect(peopleAppendMock).toHaveBeenCalled();
    });
  });

  describe('unionProperty', () => {
    test('should flatten and union properties in mixpanel', () => {
      const properties = {
        tags: {
          categories: ['A', 'B'],
          labels: { primary: ['main'] },
        },
      };
      analyticsService.unionProperty(properties);
      expect(peopleUnionMock).toHaveBeenCalledWith({
        'tags.categories': ['A', 'B'],
        'tags.labels.primary': ['main'],
      });
    });

    test('should handle errors gracefully', () => {
      peopleUnionMock.mockImplementation(() => {
        throw new Error('error union-ing property');
      });
      analyticsService.unionProperty({ prop1: ['value1'] });
      expect(peopleUnionMock).toHaveBeenCalled();
    });
  });
});
